'use client';

import { useState, type ReactNode } from 'react';

export interface DragHandleProps {
  draggable: boolean;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onDragEnd: () => void;
}

/**
 * 原生 HTML5 拖拽排序容器，不引入额外依赖。
 * 供 DynamicKeyValueTable、图片画廊等场景复用。
 */
export function SortableList<T>({
  items,
  getKey,
  onReorder,
  renderItem,
  className,
  itemClassName,
}: {
  items: T[];
  getKey: (item: T, index: number) => string | number;
  onReorder: (newItems: T[]) => void;
  renderItem: (item: T, index: number, drag: DragHandleProps) => ReactNode;
  className?: string;
  itemClassName?: (isDragOver: boolean) => string;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  function handleDrop() {
    if (dragIndex === null || overIndex === null || dragIndex === overIndex) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }
    const next = [...items];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(overIndex, 0, moved);
    onReorder(next);
    setDragIndex(null);
    setOverIndex(null);
  }

  return (
    <div className={className}>
      {items.map((item, index) => {
        const isDragOver = overIndex === index && dragIndex !== null && dragIndex !== index;
        return (
          <div key={getKey(item, index)} className={itemClassName ? itemClassName(isDragOver) : isDragOver ? 'opacity-60' : ''}>
            {renderItem(item, index, {
              draggable: true,
              onDragStart: () => setDragIndex(index),
              onDragOver: (e) => {
                e.preventDefault();
                setOverIndex(index);
              },
              onDrop: handleDrop,
              onDragEnd: () => {
                setDragIndex(null);
                setOverIndex(null);
              },
            })}
          </div>
        );
      })}
    </div>
  );
}
