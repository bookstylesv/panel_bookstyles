import { DashboardChrome } from "@/components/layout/DashboardChrome";
import { getRequiredPanelSession } from "@/lib/panel-route";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await getRequiredPanelSession();

  return <DashboardChrome>{children}</DashboardChrome>;
}
