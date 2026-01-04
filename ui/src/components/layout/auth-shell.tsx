import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AuthShellProps = {
  children: ReactNode;
  gridClassName?: string;
};

export function AuthShell({ children, gridClassName }: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#f4f4f5,_#e4e4e7_35%,_#d4d4d8_100%)] text-zinc-900">
      <div className="pointer-events-none absolute -left-24 top-14 h-72 w-72 rounded-full bg-white/70 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-white/70 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-16">
        <div
          className={cn(
            "grid w-full gap-10 md:grid-cols-[1.1fr_1fr]",
            "max-w-4xl",
            gridClassName
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
