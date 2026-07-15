import LayoutShell from "@/components/Shell/LayoutShell";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LayoutShell showHeader={false} showSidebar={true}>
      {children}
    </LayoutShell>
  );
}
