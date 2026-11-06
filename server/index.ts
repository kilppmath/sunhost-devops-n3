import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import { Pool } from "pg";
import fs from "fs/promises";
import { hashPassword, safeUser } from "./security";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const app = express();
const server = createServer(app);
const port = Number(process.env.PORT || 3001);
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 1500,
  idleTimeoutMillis: 10000,
});

// O PostgreSQL continua sendo suportado. Se ele não estiver disponível,
// a aplicação inicia automaticamente em modo demonstração local.
let demoMode = process.env.DEMO_MODE === "true";
const demoDataFile = process.env.DEMO_DATA_FILE || path.resolve(__dirname, "..", "sunhost-demo-data.json");
type DemoUser = { id: string; name: string; email: string; passwordHash: string; role: "user" | "admin"; created_at: string };
type DemoAccommodation = { id: number; owner_id: string; title: string; district: string; price: number; description: string; image_url: string | null; status: "pending" | "approved" | "rejected"; moderation_note?: string; created_at: string };
type DemoReview = { id: number; accommodation_id: number; user_id: string; user_name: string; rating: number; body: string; status: "pending" | "approved" | "rejected"; created_at: string };
type DemoData = { users: DemoUser[]; accommodations: DemoAccommodation[]; reviews?: DemoReview[]; favorites?: { user_id: string; accommodation_id: number }[]; nextAccommodationId: number; nextReviewId?: number };
let demoData: DemoData = { users: [], accommodations: [], nextAccommodationId: 1 };

if (process.env.NODE_ENV === "production" && (!process.env.ADMIN_PASSWORD || !process.env.PASSWORD_PEPPER)) {
  throw new Error("Defina ADMIN_PASSWORD e PASSWORD_PEPPER antes de iniciar em produção.");
}

const sessions = new Map<string, { id: string; role: "user" | "admin"; name: string; email: string }>();
const tokenFor = (user: any) => { const token = crypto.randomBytes(32).toString("hex"); sessions.set(token, safeUser(user)); return token; };
const auth = (req: express.Request) => sessions.get(String(req.headers.authorization || "").replace(/^Bearer\s+/i, ""));
const requireAuth = (req: express.Request, res: express.Response) => { const user = auth(req); if (!user) { res.status(401).json({ error: "Não autenticado." }); return null; } return user; };
const requireAdmin = (req: express.Request, res: express.Response) => { const user = requireAuth(req, res); if (user && user.role !== "admin") { res.status(403).json({ error: "Acesso restrito ao administrador." }); return null; } return user; };

async function saveDemoData() { await fs.writeFile(demoDataFile, JSON.stringify(demoData, null, 2), "utf8"); }
async function loadDemoData() {
  try { demoData = JSON.parse(await fs.readFile(demoDataFile, "utf8")); } catch { demoData = { users: [], accommodations: [], reviews: [], favorites: [], nextAccommodationId: 1, nextReviewId: 1 }; }
  const email = (process.env.ADMIN_EMAIL || "admin@sunhost.local").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "Floripa@2026";
  const admin = demoData.users.find(user => user.email === email);
  if (admin) { admin.role = "admin"; admin.passwordHash = hashPassword(password); }
  else demoData.users.push({ id: crypto.randomUUID(), name: "Admin SunHost", email, passwordHash: hashPassword(password), role: "admin", created_at: new Date().toISOString() });
  await saveDemoData();
}
const submissionJson = (row: any, ownerName: string) => ({ id: Number(row.id), title: row.title, district: row.district, location: `${row.district}, Florianópolis`, price: Number(row.price), category: "Acomodação enviada", guests: 2, beds: 1, points: 50, images: row.image_url ? [row.image_url] : [], description: row.description, tags: ["Envio local"], amenities: ["A validar pela equipe"], accent: "lagoa", localNote: row.status === "pending" ? "Aguardando análise" : "Envio local", ownerId: row.owner_id, ownerName, status: row.status, moderationNote: row.moderation_note });

app.use(express.json({ limit: "1mb" }));
app.get("/api/health", async (_req, res) => { if (demoMode) return res.json({ ok: true, database: "local-demo" }); try { await pool.query("SELECT 1"); res.json({ ok: true, database: "postgresql" }); } catch { res.status(503).json({ ok: false, database: "unavailable" }); } });

app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name?.trim() || !email?.trim() || !password || password.length < 6) return res.status(400).json({ error: "Nome, e-mail e senha de 6 caracteres são obrigatórios." });
  const normalizedEmail = email.trim().toLowerCase();
  if (demoMode) {
    if (demoData.users.some(user => user.email === normalizedEmail)) return res.status(409).json({ error: "Este e-mail já está cadastrado." });
    const row: DemoUser = { id: crypto.randomUUID(), name: name.trim(), email: normalizedEmail, passwordHash: hashPassword(password), role: "user", created_at: new Date().toISOString() };
    demoData.users.push(row); await saveDemoData(); const user = safeUser(row); return res.status(201).json({ user, token: tokenFor(user) });
  }
  try { const result = await pool.query("INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, role", [name.trim(), normalizedEmail, hashPassword(password)]); const user = safeUser(result.rows[0]); res.status(201).json({ user, token: tokenFor(user) }); }
  catch (error: any) { if (error.code === "23505") return res.status(409).json({ error: "Este e-mail já está cadastrado." }); res.status(500).json({ error: "Não foi possível criar a conta." }); }
});

app.post("/api/auth/login", async (req, res) => {
  const normalizedEmail = String(req.body?.email || "").trim().toLowerCase(); const password = String(req.body?.password || "");
  if (demoMode) { const row = demoData.users.find(user => user.email === normalizedEmail); if (!row || row.passwordHash !== hashPassword(password)) return res.status(401).json({ error: "E-mail ou senha inválidos." }); const user = safeUser(row); return res.json({ user, token: tokenFor(user) }); }
  try { const result = await pool.query("SELECT id, name, email, role, password_hash FROM users WHERE email = $1", [normalizedEmail]); const row = result.rows[0]; if (!row || row.password_hash !== hashPassword(password)) return res.status(401).json({ error: "E-mail ou senha inválidos." }); const user = safeUser(row); res.json({ user, token: tokenFor(user) }); }
  catch { res.status(500).json({ error: "Não foi possível entrar agora." }); }
});


app.get("/api/favorites", async (req, res) => { const user = requireAuth(req, res); if (!user) return; if (demoMode) return res.json((demoData.favorites || []).filter(item => item.user_id === user.id).map(item => item.accommodation_id)); const result = await pool.query("SELECT accommodation_id FROM favorites WHERE user_id=$1", [user.id]); res.json(result.rows.map(row => Number(row.accommodation_id))); });
app.put("/api/favorites/:id", async (req, res) => { const user = requireAuth(req, res); if (!user) return; const id = Number(req.params.id); const saved = Boolean(req.body?.saved); if (demoMode) { demoData.favorites = (demoData.favorites || []).filter(item => !(item.user_id === user.id && item.accommodation_id === id)); if (saved) demoData.favorites.push({ user_id: user.id, accommodation_id: id }); await saveDemoData(); return res.json({ ok: true }); } if (saved) await pool.query("INSERT INTO favorites (user_id, accommodation_id) VALUES ($1,$2) ON CONFLICT DO NOTHING", [user.id,id]); else await pool.query("DELETE FROM favorites WHERE user_id=$1 AND accommodation_id=$2", [user.id,id]); res.json({ ok: true }); });
app.get("/api/accommodations/:id/reviews", async (req, res) => {
  if (demoMode) { const rows = (demoData.reviews || []).filter(item => item.accommodation_id === Number(req.params.id) && item.status === "approved"); return res.json(rows.map(item => ({ id: item.id, userName: item.user_name, rating: item.rating, body: item.body, createdAt: item.created_at }))); }
  const result = await pool.query(`SELECT c.id, u.name AS user_name, c.rating, c.body, c.created_at FROM comments c JOIN users u ON u.id=c.user_id WHERE c.accommodation_id=$1 AND c.status='approved' ORDER BY c.created_at DESC`, [req.params.id]); res.json(result.rows.map(row => ({ id: Number(row.id), userName: row.user_name, rating: row.rating, body: row.body, createdAt: row.created_at })));
});
app.post("/api/accommodations/:id/reviews", async (req, res) => {
  const user = requireAuth(req, res); if (!user) return; const rating = Number(req.body?.rating); const body = String(req.body?.body || "").trim(); if (!Number.isInteger(rating) || rating < 1 || rating > 5 || body.length < 3) return res.status(400).json({ error: "Avaliação inválida." });
  if (demoMode) { const item: DemoReview = { id: demoData.nextReviewId || 1, accommodation_id: Number(req.params.id), user_id: user.id, user_name: user.name, rating, body, status: "approved", created_at: new Date().toISOString() }; demoData.nextReviewId = item.id + 1; demoData.reviews = [...(demoData.reviews || []), item]; await saveDemoData(); return res.status(201).json({ ok: true }); }
  await pool.query("INSERT INTO comments (accommodation_id,user_id,rating,body,status) VALUES ($1,$2,$3,$4,'approved')", [req.params.id, user.id, rating, body]); res.status(201).json({ ok: true });
});

app.post("/api/admin/ensure", async (req, res) => { if (!requireAdmin(req, res)) return; const email = (process.env.ADMIN_EMAIL || "admin@sunhost.local").toLowerCase(); if (demoMode) { await loadDemoData(); return res.json({ ok: true, email }); } try { await pool.query("INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,'admin') ON CONFLICT (email) DO UPDATE SET role='admin'", ["Admin SunHost", email, hashPassword(process.env.ADMIN_PASSWORD || "Floripa@2026")]); res.json({ ok: true, email }); } catch { res.status(500).json({ error: "Não foi possível preparar o administrador." }); } });

app.get("/api/submissions", async (req, res) => {
  const user = requireAuth(req, res); if (!user) return;
  if (demoMode) { const rows = demoData.accommodations.filter(row => user.role === "admin" || row.owner_id === user.id); return res.json(rows.map(row => submissionJson(row, demoData.users.find(item => item.id === row.owner_id)?.name || "Usuário"))); }
  const result = await pool.query(`SELECT a.*, u.name AS owner_name FROM accommodations a JOIN users u ON u.id=a.owner_id ${user.role === "admin" ? "" : "WHERE a.owner_id=$1"} ORDER BY a.created_at DESC`, user.role === "admin" ? [] : [user.id]); res.json(result.rows.map(row => submissionJson(row, row.owner_name)));
});

app.post("/api/submissions", async (req, res) => {
  const user = requireAuth(req, res); if (!user) return; if (user.role !== "user") return res.status(403).json({ error: "Apenas usuários podem enviar acomodações." });
  const { title, district, price, description, imageUrl } = req.body || {};
  if (!title?.trim() || !district?.trim() || !Number(price) || !description?.trim()) return res.status(400).json({ error: "Preencha título, bairro, preço e descrição." });
  if (demoMode) { const row: DemoAccommodation = { id: demoData.nextAccommodationId++, owner_id: user.id, title: title.trim(), district: district.trim(), price: Number(price), description: description.trim(), image_url: imageUrl?.trim() || null, status: "pending", created_at: new Date().toISOString() }; demoData.accommodations.unshift(row); await saveDemoData(); return res.status(201).json({ id: row.id }); }
  const result = await pool.query("INSERT INTO accommodations (owner_id,title,district,price,description,image_url) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id", [user.id, title.trim(), district.trim(), Number(price), description.trim(), imageUrl?.trim() || null]); res.status(201).json({ id: Number(result.rows[0].id) });
});

app.patch("/api/submissions/:id", async (req, res) => { const user = requireAdmin(req, res); if (!user) return; const status = req.body?.status; if (!["approved", "rejected"].includes(status)) return res.status(400).json({ error: "Status inválido." }); const note = status === "approved" ? "Aprovado para exibição." : "Rejeitado pela moderação."; if (demoMode) { const row = demoData.accommodations.find(item => item.id === Number(req.params.id)); if (!row) return res.status(404).json({ error: "Acomodação não encontrada." }); row.status = status; row.moderation_note = note; await saveDemoData(); return res.json({ ok: true }); } await pool.query("UPDATE accommodations SET status=$1, moderation_note=$2 WHERE id=$3", [status, note, req.params.id]); res.json({ ok: true }); });
app.delete("/api/submissions/:id", async (req, res) => { const user = requireAdmin(req, res); if (!user) return; if (demoMode) { demoData.accommodations = demoData.accommodations.filter(item => item.id !== Number(req.params.id)); await saveDemoData(); return res.json({ ok: true }); } await pool.query("DELETE FROM accommodations WHERE id=$1", [req.params.id]); res.json({ ok: true }); });

export async function start() {
  if (!demoMode) {
    try {
      const schema = await fs.readFile(path.resolve(__dirname, "..", "schema.sql"), "utf8"); await pool.query("CREATE EXTENSION IF NOT EXISTS pgcrypto"); await pool.query(schema);
      const email = (process.env.ADMIN_EMAIL || "admin@sunhost.local").toLowerCase(); await pool.query("INSERT INTO users (name,email,password_hash,role) VALUES ($1,$2,$3,'admin') ON CONFLICT(email) DO UPDATE SET role='admin', password_hash=EXCLUDED.password_hash", ["Admin SunHost", email, hashPassword(process.env.ADMIN_PASSWORD || "Floripa@2026")]);
    } catch (error) {
      if (process.env.DEMO_MODE === "false") { console.error("Falha ao conectar ao PostgreSQL. Confira se o serviço está ativo e se DATABASE_URL está correta."); throw error; }
      demoMode = true; await loadDemoData(); console.warn("PostgreSQL indisponível. SunHost iniciado em modo demonstração local.");
    }
  } else await loadDemoData();
  const staticPath = process.env.NODE_ENV === "production" ? path.resolve(__dirname, "public") : path.resolve(__dirname, "..", "dist", "public"); app.use(express.static(staticPath)); app.get("*", (_req, res) => res.sendFile(path.join(staticPath, "index.html"))); return server.listen(port, "0.0.0.0", () => { console.log(`SunHost Floripa em http://localhost:${port}`); console.log(`Persistência: ${demoMode ? "modo demonstração local" : "PostgreSQL"}`); });
}
if (process.env.NODE_ENV !== "test") {
  start().catch(error => { console.error("Falha ao iniciar:", error); process.exit(1); });
}
export async function stop() {
  if (server.listening) await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  await pool.end();
}
