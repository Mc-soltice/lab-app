import LayoutShell from "@/components/Shell/LayoutShell";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LayoutShell showHeader={true} showSidebar={true}>
      {children}
    </LayoutShell>
  );
}
