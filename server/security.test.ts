import { afterEach, describe, expect, it } from "vitest";
import { hashPassword, safeUser } from "./security";
const original = process.env.PASSWORD_PEPPER;
afterEach(() => { if (original === undefined) delete process.env.PASSWORD_PEPPER; else process.env.PASSWORD_PEPPER = original; });
describe("Proteção de credenciais", () => {
  it("gera hash consistente e diferencia senhas", () => {
    delete process.env.PASSWORD_PEPPER;
    expect(hashPassword("abc123")).toMatch(/^[a-f0-9]{128}$/);
    expect(hashPassword("abc123")).toBe(hashPassword("abc123"));
    expect(hashPassword("abc123")).not.toBe(hashPassword("abc124"));
  });
  it("muda o hash quando o pepper muda", () => {
    process.env.PASSWORD_PEPPER = "first"; const first = hashPassword("abc123");
    process.env.PASSWORD_PEPPER = "second"; expect(hashPassword("abc123")).not.toBe(first);
  });
  it("retorna somente os campos públicos", () => {
    const row = { id: "1", name: "Ana", email: "ana@test.local", role: "user" as const, password_hash: "secret", passwordHash: "secret" };
    expect(safeUser(row)).toEqual({ id: "1", name: "Ana", email: "ana@test.local", role: "user" });
  });
});
