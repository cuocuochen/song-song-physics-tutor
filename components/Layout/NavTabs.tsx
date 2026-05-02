'use client';

const tabs = [
  { key: 'analyze', label: '解题助手' },
  { key: 'similar', label: '同类题' },
  { key: 'learn', label: '学懂了吗' },
] as const;

export type TabKey = (typeof tabs)[number]['key'];

interface NavTabsProps {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
}

export function NavTabs({ activeTab, onChange }: NavTabsProps) {
  return (
    <nav className="flex gap-1 bg-surface rounded-xl p-1 border border-border">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
            ${activeTab === tab.key
              ? 'bg-primary text-white shadow-sm'
              : 'text-muted hover:text-foreground hover:bg-primary-light'
            }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
