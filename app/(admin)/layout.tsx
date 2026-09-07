import AppShell from "@/components/Shell/AppShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-(--bg-primary) text-(--text-primary)">
      <main>
        <AppShell>{children}</AppShell>
      </main>
    </div>
  );
}
