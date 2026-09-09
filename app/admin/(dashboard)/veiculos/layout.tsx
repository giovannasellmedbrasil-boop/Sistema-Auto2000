import { redirect } from "next/navigation";
import { getAdminSession, hasRole } from "@/lib/server/auth";

export default async function VeiculosLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session || !hasRole(session.role, ["MANAGER", "ADMIN"])) redirect("/admin");
  return children;
}
