import { ChevronLeft, Plus } from "lucide-react";
import type { ReactNode } from "react";

type AppShellProps = {
  title?: string;
  subtitle?: string;
  canGoBack?: boolean;
  onBack?: () => void;
  onCreate?: () => void;
  actions?: ReactNode;
  children: ReactNode;
};

export function AppShell({
  title = "毛孩档案",
  subtitle,
  canGoBack,
  onBack,
  onCreate,
  actions,
  children,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-cream text-ink">
      <div className="mx-auto min-h-screen w-full max-w-md bg-cream shadow-soft">
        <header className="sticky top-0 z-20 border-b border-sand/80 bg-cream/95 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            {canGoBack ? (
              <button
                className="grid h-10 w-10 place-items-center rounded-full bg-white text-ink shadow-sm"
                onClick={onBack}
                aria-label="返回"
              >
                <ChevronLeft size={22} />
              </button>
            ) : null}
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-bold">{title}</h1>
              {subtitle ? (
                <p className="truncate text-sm text-stone-500">{subtitle}</p>
              ) : null}
            </div>
            {onCreate ? (
              <button
                className="inline-flex h-10 items-center gap-1 rounded-full bg-clay px-4 text-sm font-semibold text-white shadow-sm"
                onClick={onCreate}
              >
                <Plus size={18} />
                新建
              </button>
            ) : null}
            {actions}
          </div>
        </header>
        <main className="safe-bottom px-4 py-4">{children}</main>
      </div>
    </div>
  );
}
