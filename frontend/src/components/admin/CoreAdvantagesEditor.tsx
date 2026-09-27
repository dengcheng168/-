'use client';

import { useId, useRef, useState } from 'react';
import type { CoreAdvantage } from '@/types/settings';
import { FormField, fieldInputClasses } from './FormField';

export function CoreAdvantagesEditor({ initialValues, disabled = false }: { initialValues: CoreAdvantage[]; disabled?: boolean }) {
  const prefix = useId();
  const nextId = useRef(initialValues.length);
  const [items, setItems] = useState(() => initialValues.map((item, id) => ({ ...item, id })));
  const buttonClass = 'rounded-md border border-input px-3 py-1.5 text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40';

  function move(index: number, direction: -1 | 1) {
    setItems((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const updated = [...current];
      [updated[index], updated[target]] = [updated[target], updated[index]];
      return updated;
    });
  }

  return (
    <fieldset disabled={disabled} className="space-y-4">
      <legend className="font-semibold text-foreground">核心优势</legend>
      <p className="text-sm text-muted-foreground">填写标题和说明即可，无需编辑代码。按下面的顺序显示在首页；删除全部条目并保存后，将隐藏此模块。</p>
      <input type="hidden" name="coreAdvantagesJson" value={JSON.stringify(items.map(({ title, description }) => ({ title, description })))} />
      {items.length === 0 && <p className="rounded-md border border-dashed border-input p-4 text-sm text-muted-foreground">暂无核心优势，点击下方按钮添加。</p>}
      {items.map((item, index) => (
        <div key={item.id} className="space-y-3 rounded-md border border-input bg-background p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-medium text-foreground">优势 {index + 1}</h3>
            <div className="flex gap-2">
              <button type="button" className={buttonClass} disabled={index === 0} aria-label={`上移优势 ${index + 1}`} onClick={() => move(index, -1)}>上移</button>
              <button type="button" className={buttonClass} disabled={index === items.length - 1} aria-label={`下移优势 ${index + 1}`} onClick={() => move(index, 1)}>下移</button>
              <button type="button" className={`${buttonClass} text-destructive`} aria-label={`删除优势 ${index + 1}`} onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))}>删除</button>
            </div>
          </div>
          <FormField label="标题" htmlFor={`${prefix}-${item.id}-title`} required>
            <input id={`${prefix}-${item.id}-title`} required value={item.title} className={fieldInputClasses} onChange={(event) => setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, title: event.target.value } : entry))} />
          </FormField>
          <FormField label="说明" htmlFor={`${prefix}-${item.id}-description`}>
            <textarea id={`${prefix}-${item.id}-description`} rows={3} value={item.description ?? ''} className={fieldInputClasses} onChange={(event) => setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, description: event.target.value } : entry))} />
          </FormField>
        </div>
      ))}
      <button type="button" className={buttonClass} onClick={() => {
        const id = nextId.current++;
        setItems((current) => [...current, { id, title: '', description: '' }]);
      }}>＋ 添加核心优势</button>
    </fieldset>
  );
}
