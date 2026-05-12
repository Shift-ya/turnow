import { Menu } from 'lucide-react';
import type { DashboardAction, DashboardNavItem } from '../../types/dashboard';

interface DashboardHeaderProps<TTab extends string> {
  activeTab: TTab;
  navItems: DashboardNavItem<TTab>[];
  title: string;
  eyebrow: string;
  subtitle?: string;
  onOpenSidebar: () => void;
  onSelectTab: (tab: TTab) => void;
  actions?: DashboardAction[];
  showSidebarToggle?: boolean;
}

export function DashboardHeader<TTab extends string>({
  activeTab,
  navItems,
  title,
  eyebrow,
  subtitle,
  onOpenSidebar,
  onSelectTab,
  actions = [],
  showSidebarToggle = true,
}: DashboardHeaderProps<TTab>) {
  const activeLabel = navItems.find((item) => item.id === activeTab)?.label || title;

  return (
    <header className="panel-light mb-6 flex flex-col gap-4 px-6 py-5 sm:flex-row max-md:flex-row max-md:justify-between sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {showSidebarToggle && (
          <button className="button-ghost-luxe h-11 w-11 rounded-full p-0 lg:hidden" onClick={onOpenSidebar}>
            <Menu size={18} />
          </button>
        )}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-500">{eyebrow}</p>
          <h1 className="font-['Space_Grotesk'] text-3xl font-bold tracking-[-0.05em] text-white">{activeLabel}</h1>
          {subtitle && <p className="mt-1 text-sm text-[#a1a1aa]">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {actions.map((action) => (
          <button key={action.key} className="button-ghost-luxe h-11 w-11 rounded-full p-0" aria-label={action.ariaLabel}>
            {action.node}
          </button>
        ))}
      </div>
    </header>
  );
}
