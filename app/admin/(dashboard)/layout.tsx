import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/server/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <AdminShell name={session.name} email={session.email} role={session.role}>
      {children}
    </AdminShell>
  );
}
