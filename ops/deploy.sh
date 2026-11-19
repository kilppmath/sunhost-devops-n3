#!/usr/bin/env bash
set -euo pipefail
sha=${1:?Informe o SHA da versão}
[[ "$sha" =~ ^[a-f0-9]{40}$ ]] || { echo 'SHA inválido'; exit 1; }
cd /opt/sunhost
# Bootstrap once on the server. Credentials never enter Git or CI logs.
if [[ ! -e .env.production ]]; then
  python3 - <<'PYENV'
import os, secrets
fd = os.open('.env.production', os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
with os.fdopen(fd, 'w') as env:
    env.write('DEMO_MODE=true\nADMIN_EMAIL=admin@sunhost.local\n')
    env.write('ADMIN_PASSWORD=' + secrets.token_urlsafe(32) + '\n')
    env.write('PASSWORD_PEPPER=' + secrets.token_urlsafe(48) + '\n')
PYENV
fi
[[ -s .env.production ]] || { echo 'Arquivo de ambiente vazio'; exit 1; }
exec 9>/opt/sunhost/deploy.lock
flock -w 300 9
release="/opt/sunhost/releases/$sha"
previous=$(cat current-image 2>/dev/null || true)
gzip -dc "$release/image.tar.gz" | sudo -n docker load
export APP_IMAGE="sunhost:$sha"
cp "$release/compose.yaml" compose.yaml
if sudo -n --preserve-env=APP_IMAGE docker compose up -d --no-build --wait --wait-timeout 120; then
  printf '%s\n' "$APP_IMAGE" > current-image
  rm -f "$release/image.tar.gz"
else
  echo 'A versão não ficou saudável. Tentando restaurar a imagem anterior.'
  if [[ -n "$previous" ]]; then APP_IMAGE="$previous" sudo -n --preserve-env=APP_IMAGE docker compose up -d --no-build --wait --wait-timeout 120; fi
  exit 1
fi
