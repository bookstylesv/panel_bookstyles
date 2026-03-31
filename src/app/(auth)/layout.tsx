import { getPanelSession } from "@/lib/panel-route";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getPanelSession();
  if (session) {
    redirect("/overview");
  }

  return <>{children}</>;
}
