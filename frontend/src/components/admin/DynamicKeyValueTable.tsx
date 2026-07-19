'use client';

import { useState } from 'react';
import { SortableList } from './SortableList';
import { fieldInputClasses } from './FormField';

interface ColumnConfig {
  key: string;
  label: string;
  placeholder?: string;
}

/**
 * 通用结构化数组编辑器：产品参数（label/value）、特点、应用场景等都是"若干行、每行几个字段"的
 * 结构，用同一个组件承载，避免每个字段各写一套增删/拖拽逻辑。
 *
 * outputMode='strings' 时（仅一列），hidden input 输出纯字符串数组（例如产品特点），
 * 匹配后端 features 字段已经接受的 string[] 形状；否则输出对象数组。
 */
export function DynamicKeyValueTable({
  name,
  columns,
  defaultValue,
  addLabel = '添加一行',
  outputMode = 'objects',
}: {
  name: string;
  columns: ColumnConfig[];
  defaultValue?: Record<string, string>[];
  addLabel?: string;
  outputMode?: 'objects' | 'strings';
}) {
  const [rows, setRows] = useState<Record<string, string>[]>(defaultValue ?? []);

  function updateCell(index: number, key: string, value: string) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  }

  function addRow() {
    const blank: Record<string, string> = {};
    columns.forEach((c) => (blank[c.key] = ''));
    setRows((prev) => [...prev, blank]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  const serialized =
    outputMode === 'strings' && columns.length === 1 ? rows.map((r) => r[columns[0].key] ?? '') : rows;

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(serialized)} />

      {rows.length === 0 && <p className="mb-2 text-xs text-grey-500">暂无内容，点击下方按钮添加一行。</p>}

      <SortableList
        items={rows}
        getKey={(_, i) => i}
        onReorder={setRows}
        renderItem={(row, index, drag) => (
          <div
            className="mb-2 flex items-start gap-2 rounded-md border border-grey-200 bg-white p-2"
            draggable={drag.draggable}
            onDragStart={drag.onDragStart}
            onDragOver={drag.onDragOver}
            onDrop={drag.onDrop}
            onDragEnd={drag.onDragEnd}
          >
            <span className="mt-2 shrink-0 cursor-grab select-none text-grey-400" title="拖拽排序">
              ⠿
            </span>
            <div className="flex flex-1 flex-wrap gap-2">
              {columns.map((col) => (
                <input
                  key={col.key}
                  value={row[col.key] ?? ''}
                  onChange={(e) => updateCell(index, col.key, e.target.value)}
                  placeholder={col.placeholder ?? col.label}
                  aria-label={col.label}
                  className={`${fieldInputClasses} min-w-[140px] flex-1`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => removeRow(index)}
              className="mt-1.5 shrink-0 text-xs text-red-600 hover:underline"
            >
              删除
            </button>
          </div>
        )}
      />

      <button type="button" onClick={addRow} className="mt-1 text-sm text-water-600 hover:underline">
        + {addLabel}
      </button>
    </div>
  );
}
