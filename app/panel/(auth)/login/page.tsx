import { PanelLoginForm } from "./PanelLoginForm";

export default async function PanelLoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const { callbackUrl } = await searchParams;
  return <PanelLoginForm callbackUrl={callbackUrl ?? "/panel"} />;
}
