import Navbar from "@/components/layout/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <body className="space-y-10">
      <Navbar />
      {children}
    </body>
  );
}
