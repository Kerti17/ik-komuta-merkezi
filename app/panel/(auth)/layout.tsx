import { AuthShell } from "@/components/AuthShell";

export default function PanelAuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthShell>{children}</AuthShell>;
}
