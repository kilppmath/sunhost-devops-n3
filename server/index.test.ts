import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
let api: ReturnType<typeof request>;
let stop: () => Promise<void>;
let folder: string;
let token: string;
let admin: string;
let id: number;
beforeAll(async () => {
  folder = await mkdtemp(join(tmpdir(), "sunhost-test-"));
  Object.assign(process.env, { DEMO_MODE: "true", DEMO_DATA_FILE: join(folder, "data.json"), ADMIN_EMAIL: "admin@test.local", ADMIN_PASSWORD: "Test-only-123", PASSWORD_PEPPER: "test-pepper", PORT: "0" });
  const server = await import("./index");
  await server.start(); stop = server.stop; api = request(server.app);
});
afterAll(async () => { await stop?.(); if (folder) await rm(folder, { recursive: true, force: true }); });
describe("API em modo demonstração", () => {
  it("informa saúde", async () => { await api.get("/api/health").expect(200, { ok: true, database: "local-demo" }); });
  it("valida cadastro", async () => {
    await api.post("/api/auth/signup").send({}).expect(400);
    await api.post("/api/auth/signup").send({ name: "Ana", email: "ana@test.local", password: "123" }).expect(400);
  });
  it("normaliza cadastro e protege senha", async () => {
    const r = await api.post("/api/auth/signup").send({ name: " Ana ", email: " ANA@Test.Local ", password: "password123" }).expect(201);
    expect(r.body.user).toMatchObject({ name: "Ana", email: "ana@test.local", role: "user" });
    expect(r.body.user).not.toHaveProperty("passwordHash"); expect(r.body.token).toMatch(/^[a-f0-9]{64}$/); token = r.body.token;
  });
  it("recusa duplicidade", async () => { await api.post("/api/auth/signup").send({ name: "Ana", email: "ANA@test.local", password: "password123" }).expect(409); });
  it("valida login", async () => {
    for (const email of ["ana@test.local", "missing@test.local"]) await api.post("/api/auth/login").send({ email, password: "wrong" }).expect(401);
    await api.post("/api/auth/login").send({ email: "ANA@test.local", password: "password123" }).expect(200);
    const r = await api.post("/api/auth/login").send({ email: "admin@test.local", password: "Test-only-123" }).expect(200); admin = r.body.token; expect(r.body.user.role).toBe("admin");
  });
  it("protege rotas e administrador", async () => {
    for (const route of ["/api/favorites", "/api/submissions"]) await api.get(route).expect(401);
    await api.post("/api/admin/ensure").expect(401);
    await api.post("/api/admin/ensure").auth(token, { type: "bearer" }).expect(403);
    await api.post("/api/admin/ensure").auth(admin, { type: "bearer" }).expect(200);
  });
  it("adiciona e remove favoritos sem duplicar", async () => {
    const auth = { Authorization: `Bearer ${token}` };
    await api.get("/api/favorites").set(auth).expect(200, []);
    for (let i = 0; i < 2; i++) await api.put("/api/favorites/7").set(auth).send({ saved: true }).expect(200);
    await api.get("/api/favorites").set(auth).expect(200, [7]);
    await api.put("/api/favorites/7").set(auth).send({ saved: false }).expect(200);
    await api.get("/api/favorites").set(auth).expect(200, []);
  });
  it("valida submissões", async () => {
    await api.post("/api/submissions").auth(token, { type: "bearer" }).send({}).expect(400);
    await api.post("/api/submissions").auth(admin, { type: "bearer" }).send({}).expect(403);
  });
  it("cria envio e isola os dados de cada usuário", async () => {
    const r = await api.post("/api/submissions").auth(token, { type: "bearer" }).send({ title: "Casa", district: "Centro", price: 150, description: "Perto da praia" }).expect(201); id = r.body.id;
    const list = await api.get("/api/submissions").auth(token, { type: "bearer" }).expect(200);
    expect(list.body[0]).toMatchObject({ id, status: "pending", price: 150, images: [] });
    const other = await api.post("/api/auth/signup").send({ name: "Bia", email: "bia@test.local", password: "password123" }).expect(201);
    await api.get("/api/submissions").auth(other.body.token, { type: "bearer" }).expect(200, []);
  });
  it("valida autorização e status de moderação", async () => {
    await api.patch(`/api/submissions/${id}`).auth(token, { type: "bearer" }).send({ status: "approved" }).expect(403);
    await api.patch(`/api/submissions/${id}`).auth(admin, { type: "bearer" }).send({ status: "invalid" }).expect(400);
    await api.patch("/api/submissions/999").auth(admin, { type: "bearer" }).send({ status: "approved" }).expect(404);
    for (const status of ["rejected", "approved"]) {
      await api.patch(`/api/submissions/${id}`).auth(admin, { type: "bearer" }).send({ status }).expect(200);
      const list = await api.get("/api/submissions").auth(admin, { type: "bearer" }).expect(200); expect(list.body[0].status).toBe(status);
    }
  });
  it("valida e publica avaliações", async () => {
    await api.get(`/api/accommodations/${id}/reviews`).expect(200, []);
    await api.post(`/api/accommodations/${id}/reviews`).send({}).expect(401);
    for (const rating of [0, 6, 2.5]) await api.post(`/api/accommodations/${id}/reviews`).auth(token, { type: "bearer" }).send({ rating, body: "Ótimo" }).expect(400);
    await api.post(`/api/accommodations/${id}/reviews`).auth(token, { type: "bearer" }).send({ rating: 5, body: "Ótimo lugar" }).expect(201);
    const list = await api.get(`/api/accommodations/${id}/reviews`).expect(200); expect(list.body[0]).toMatchObject({ userName: "Ana", rating: 5, body: "Ótimo lugar" });
  });
  it("persiste hashes sem guardar a senha", async () => {
    const data = JSON.parse(await readFile(process.env.DEMO_DATA_FILE!, "utf8"));
    expect(data.accommodations).toHaveLength(1);
    expect(data.users.find((u: { email: string }) => u.email === "ana@test.local").passwordHash).toMatch(/^[a-f0-9]{128}$/);
    expect(JSON.stringify(data)).not.toContain("password123");
  });
  it("restringe a exclusão ao administrador", async () => {
    await api.delete(`/api/submissions/${id}`).auth(token, { type: "bearer" }).expect(403);
    await api.delete(`/api/submissions/${id}`).auth(admin, { type: "bearer" }).expect(200);
    await api.get("/api/submissions").auth(admin, { type: "bearer" }).expect(200, []);
  });
});
