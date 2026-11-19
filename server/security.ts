import { scryptSync } from "node:crypto";
export function hashPassword(password: string): string {
  return scryptSync(password, process.env.PASSWORD_PEPPER || "sunhost-local-pepper", 64).toString("hex");
}
export function safeUser(row: { id: string; name: string; email: string; role: "user" | "admin" }) {
  return { id: row.id, name: row.name, email: row.email, role: row.role };
}
