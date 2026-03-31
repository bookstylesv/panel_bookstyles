import { redirect } from "next/navigation";
import { getRequiredPanelSession } from "@/lib/panel-route";

export default async function RootPage() {
  await getRequiredPanelSession({ redirectTo: "/login" });
  redirect("/overview");
}
