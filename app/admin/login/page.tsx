import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/server/auth";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Acesso restrito", robots: { index: false } };

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect("/admin");

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center bg-ink-50 px-4 py-16">
      <LoginForm />
    </div>
  );
}
