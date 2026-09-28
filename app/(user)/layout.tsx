import Sidebar from "@/components/Sidebar/Sidebar";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session?.user?.id) {
    // Redirection côté serveur vers la page de connexion
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
