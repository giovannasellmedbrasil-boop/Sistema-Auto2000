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
  // Acesso a tudo (role ADMIN), exceto ao Dashboard — não é uma role
  // separada, é uma exceção pontual para este usuário (pedido em
  // 2026-09-13: "acesso a tudo exceto o dashboard").
  hideDashboard?: boolean;
}

const DEMO_USERS: DemoUser[] = [
  {
    id: "user_admin",
    name: "Administrador",
    email: "adm@auto2000.com.br",
    password: "auto2000admin",
    role: "ADMIN",
  },
  {
    id: "user_vitorhugo",
    name: "Vitor Hugo",
    email: "vitorhugo@auto2000.com.br",
    password: "auto2000vh",
    role: "ADMIN",
    hideDashboard: true,
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
  hideDashboard: boolean;
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
    hideDashboard: user.hideDashboard ?? false,
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
