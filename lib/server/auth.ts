import crypto from "node:crypto";
import { cookies } from "next/headers";
import type { UserRole } from "@/lib/types";

// Autenticação mock do painel administrativo (seção 16/23).
//
// Isto NÃO é o sistema de autenticação final: é um mecanismo simples de
// sessão assinada (cookie httpOnly + HMAC) suficiente para proteger o painel
// durante o desenvolvimento. Antes de produção, substituir por um provedor
// real (ex: NextAuth/Auth.js) com hashing de senha (bcrypt/argon2), MFA
// quando aplicável, e usuários reais por loja — hoje há apenas três
// usuários de demonstração fixos, um por nível de acesso (seção 14).

export const SESSION_COOKIE = "auto2000_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 8; // 8 horas — expiração de sessão (seção 13)

const AUTH_SECRET = process.env.AUTH_SECRET ?? "dev-only-insecure-secret-change-me";

interface DemoUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

const DEMO_USERS: DemoUser[] = [
  {
    id: "user_admin",
    name: "Administrador",
    email: process.env.ADMIN_EMAIL ?? "admin@auto2000.com.br",
    password: process.env.ADMIN_PASSWORD ?? "auto2000admin",
    role: "ADMIN",
  },
  {
    id: "user_manager",
    name: "Gerente Demonstração",
    email: "gerente@auto2000.com.br",
    password: "auto2000gerente",
    role: "MANAGER",
  },
  {
    id: "user_sales",
    name: "Vendedor Demonstração",
    email: "vendedor@auto2000.com.br",
    password: "auto2000vendedor",
    role: "SALES",
  },
];

export function listDemoUsers() {
  return DEMO_USERS.map(({ id, name, email, role }) => ({ id, name, email, role }));
}

interface SessionPayload {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  exp: number;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", AUTH_SECRET).update(payload).digest("hex");
}

export function authenticate(email: string, password: string): DemoUser | null {
  const normalized = email.trim().toLowerCase();
  const user = DEMO_USERS.find((u) => u.email.toLowerCase() === normalized);
  if (!user || user.password !== password) return null;
  return user;
}

export function createSessionToken(user: DemoUser): string {
  const payload: SessionPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  };
  const json = JSON.stringify(payload);
  const encoded = Buffer.from(json).toString("base64url");
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
}

export function verifySessionToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  if (sign(encoded) !== signature) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf-8")) as SessionPayload;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

export function hasRole(role: UserRole, allowed: UserRole[]): boolean {
  return allowed.includes(role);
}

export const SESSION_COOKIE_MAX_AGE = SESSION_MAX_AGE;
