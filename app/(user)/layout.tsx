import LayoutShell from "@/components/Shell/LayoutShell";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute fallback={<div className="min-h-screen" />}>
      <LayoutShell showHeader={true} showSidebar={true}>
        {children}
      </LayoutShell>
    </ProtectedRoute>
  );
}
