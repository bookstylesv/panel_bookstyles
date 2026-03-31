import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { AntdProvider } from "@/components/providers/AntdProvider";
import { AuthProvider } from "@/context/AuthContext";
import { verifyPanelSessionToken } from "@/lib/panel-session";

export const metadata: Metadata = {
  title: "Speeddan Control V3",
  description: "Panel central para Barber Pro, ERP Full Pro y DTE",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("speeddan_control_v3_session")?.value;
  const session = sessionToken ? verifyPanelSessionToken(sessionToken) : null;

  return (
    <html lang="es">
      <body>
        <AntdProvider>
          <AuthProvider initialSession={session}>{children}</AuthProvider>
        </AntdProvider>
      </body>
    </html>
  );
}
