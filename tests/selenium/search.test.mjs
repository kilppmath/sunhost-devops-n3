import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

// Independent browser profile and temporary demo storage: no personal browser or data.
test('Selenium: buscar destino inexistente e limpar busca restaura acomodações', { timeout: 180_000 }, async () => {
  const folder = await mkdtemp(join(tmpdir(), 'sunhost-selenium-'));
  const artifacts = resolve('test-results/selenium');
  await mkdir(artifacts, { recursive: true });
  process.env.SE_CACHE_PATH ||= resolve('.selenium-cache');
  process.env.SE_AVOID_STATS = 'true';
  process.env.NODE_ENV = 'test';
  process.env.DEMO_MODE = 'true';
  process.env.DEMO_DATA_FILE = join(folder, 'data.json');
  process.env.PORT = '0';
  let driver;
  let stop;
  const report = { test: 'Busca e limpeza de filtros', status: 'running', steps: [] };
  try {
    const application = await import('../../dist/index.js');
    stop = application.stop;
    const server = await application.start();
    if (!server.listening) await once(server, 'listening');
    const options = new chrome.Options().addArguments('--headless=new', '--window-size=1440,1100', '--disable-dev-shm-usage', `--user-data-dir=${join(folder, 'chrome-profile')}`);
    if (process.env.CI) options.addArguments('--no-sandbox');
    if (process.env.CHROME_BIN) options.setChromeBinaryPath(process.env.CHROME_BIN);
    driver = await new Builder().forBrowser('chrome').setChromeOptions(options).setChromeService(new chrome.ServiceBuilder().loggingTo(join(artifacts, 'chromedriver.log')).enableVerboseLogging()).build();
    await driver.manage().setTimeouts({ pageLoad: 30_000, script: 15_000 });
    await driver.get(`http://127.0.0.1:${server.address().port}`);
    const heading = await driver.wait(until.elementLocated(By.css('h1')), 15_000);
    await driver.wait(until.elementIsVisible(heading), 15_000);
    await driver.wait(until.elementTextMatches(heading, /Floripa/), 15_000);
    assert.match(await heading.getText(), /Floripa/);
    const cards = By.css('#acomodacoes .stay-card');
    await driver.wait(async () => (await driver.findElements(cards)).length > 0, 10_000);
    const initialCount = (await driver.findElements(cards)).length;
    report.steps.push(`Página inicial exibe ${initialCount} acomodações`);
    const destination = await driver.findElement(By.css('input[placeholder="Para onde em Floripa?"]'));
    await destination.sendKeys('destino-inexistente-selenium-n3');
    await driver.findElement(By.css('.search-submit')).click();
    const empty = await driver.wait(until.elementLocated(By.css('.empty-search')), 10_000);
    await driver.wait(until.elementIsVisible(empty), 10_000);
    assert.match(await empty.getText(), /Nenhuma estadia apareceu/);
    assert.equal((await driver.findElements(cards)).length, 0);
    report.steps.push('Busca inexistente exibe estado vazio e nenhum cartão');
    await writeFile(join(artifacts, 'busca-vazia.png'), await driver.takeScreenshot(), 'base64');
    await empty.findElement(By.css('button')).click();
    await driver.wait(async () => (await driver.findElements(cards)).length === initialCount, 10_000);
    assert.equal(await destination.getAttribute('value'), '');
    report.steps.push('Limpar busca restaura cartões e limpa o campo de destino');
    await writeFile(join(artifacts, 'busca-restaurada.png'), await driver.takeScreenshot(), 'base64');
    report.status = 'passed';
  } catch (error) {
    report.status = 'failed';
    report.error = String(error);
    if (driver) {
      await driver.takeScreenshot().then(png => writeFile(join(artifacts, 'falha.png'), png, 'base64')).catch(() => {});
    }
    throw error;
  } finally {
    await writeFile(join(artifacts, 'resultado.json'), JSON.stringify(report, null, 2));
    try { await driver?.quit(); } finally {
      try { await stop?.(); } finally { await rm(folder, { recursive: true, force: true }); }
    }
  }
});
