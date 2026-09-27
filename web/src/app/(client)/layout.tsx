import type { ReactNode } from "react";

import { ShellFrame } from "@/components/shell/ShellFrame";
import { Sidebar } from "@/components/shell/Sidebar";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return <ShellFrame sidebar={<Sidebar />}>{children}</ShellFrame>;
}
