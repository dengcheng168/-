'use client';

import { useState, type ReactNode } from 'react';

export interface EditorTab {
  id: string;
  label: string;
  content: ReactNode;
}

/**
 * 标签页编辑器容器。所有 Tab 内容始终挂载在 DOM 中（只是 hidden 切换可见性），
 * 这样可以和外层单个 <form action={formAction}> + useActionState 的现有模式无缝配合，
 * 不需要跨路由保存表单状态。
 */
export function EditorTabs({ tabs, defaultTab }: { tabs: EditorTab[]; defaultTab?: string }) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);

  return (
    <div>
      <div role="tablist" className="mb-6 flex gap-1 overflow-x-auto border-b border-grey-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => setActive(tab.id)}
            className={`shrink-0 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              active === tab.id
                ? 'border-water-500 text-water-600'
                : 'border-transparent text-grey-500 hover:text-navy-950'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabs.map((tab) => (
        <div key={tab.id} role="tabpanel" hidden={active !== tab.id} className="space-y-4">
          {tab.content}
        </div>
      ))}
    </div>
  );
}
