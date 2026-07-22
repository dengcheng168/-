'use client';

import { useRef, useState } from 'react';

/**
 * 纯原生实现的"平移+缩放"裁剪框（不依赖第三方裁剪库）：裁剪框尺寸固定（按 aspectRatio），
 * 图片在裁剪框内可拖动/缩放，确认时把当前裁剪框覆盖的原图区域绘制到一个新 canvas 上导出。
 * 交互模式跟大多数图片裁剪组件一致（图片在固定取景框里移动，而不是取景框在图片上缩放移动），
 * 数学上更简单、不需要处理"取景框拖出图片边界"这类情况。
 *
 * 注意：blob URL 的撤销故意不放在 useEffect 的 cleanup 里——React 开发模式下 Strict Mode
 * 会对每个 effect 做"挂载 → 清理 → 再挂载"的双重调用来检测非幂等的副作用，这会导致 cleanup
 * 在图片还没加载完就把 blob URL 撤销掉，图片直接白屏。改成只在真正的退出时机（取消/跳过裁剪/
 * 裁剪完成后）手动撤销一次，不依赖组件挂载生命周期。
 */

const VIEWPORT_WIDTH = 320;
const MAX_ZOOM = 4;
const MAX_OUTPUT_SIDE = 2000;

interface Props {
  file: File;
  aspectRatio: number;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
}

export function ImageCropper({ file, aspectRatio, onCancel, onConfirm }: Props) {
  const [imgUrl] = useState(() => URL.createObjectURL(file));
  const [natural, setNatural] = useState<{ width: number; height: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragState = useRef<{ startX: number; startY: number; startOffsetX: number; startOffsetY: number } | null>(null);
  const viewportHeight = VIEWPORT_WIDTH / aspectRatio;

  function baseScale(w: number, h: number) {
    return Math.max(VIEWPORT_WIDTH / w, viewportHeight / h);
  }

  function clampOffset(next: { x: number; y: number }, w: number, h: number, z: number) {
    const scale = baseScale(w, h) * z;
    const displayedWidth = w * scale;
    const displayedHeight = h * scale;
    const minX = Math.min(0, VIEWPORT_WIDTH - displayedWidth);
    const minY = Math.min(0, viewportHeight - displayedHeight);
    return {
      x: Math.min(0, Math.max(minX, next.x)),
      y: Math.min(0, Math.max(minY, next.y)),
    };
  }

  function handleImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const w = e.currentTarget.naturalWidth;
    const h = e.currentTarget.naturalHeight;
    setNatural({ width: w, height: h });
    const scale = baseScale(w, h);
    // 初始居中显示
    setOffset({ x: (VIEWPORT_WIDTH - w * scale) / 2, y: (viewportHeight - h * scale) / 2 });
  }

  function handlePointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragState.current = { startX: e.clientX, startY: e.clientY, startOffsetX: offset.x, startOffsetY: offset.y };
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragState.current || !natural) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    setOffset(clampOffset({ x: dragState.current.startOffsetX + dx, y: dragState.current.startOffsetY + dy }, natural.width, natural.height, zoom));
  }

  function handlePointerUp() {
    dragState.current = null;
  }

  function handleZoomChange(next: number) {
    if (!natural) return;
    setZoom(next);
    setOffset((prev) => clampOffset(prev, natural.width, natural.height, next));
  }

  function handleCancel() {
    URL.revokeObjectURL(imgUrl);
    onCancel();
  }

  function handleSkip() {
    URL.revokeObjectURL(imgUrl);
    onConfirm(file);
  }

  function handleConfirm() {
    if (!natural) return;
    const scale = baseScale(natural.width, natural.height) * zoom;
    const cropX = -offset.x / scale;
    const cropY = -offset.y / scale;
    const cropWidth = VIEWPORT_WIDTH / scale;
    const cropHeight = viewportHeight / scale;

    const outputScale = Math.min(1, MAX_OUTPUT_SIDE / Math.max(cropWidth, cropHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(cropWidth * outputScale);
    canvas.height = Math.round(cropHeight * outputScale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(imgUrl);
      canvas.toBlob((blob) => {
        if (blob) onConfirm(blob);
      }, 'image/webp', 0.92);
    };
    img.src = imgUrl;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-xl">
        <p className="mb-3 text-sm font-medium text-navy-950">拖动图片调整位置，可用下方滑块缩放</p>

        <div
          className="relative mx-auto touch-none overflow-hidden rounded-md border border-grey-200 bg-grey-100"
          style={{ width: VIEWPORT_WIDTH, height: viewportHeight, cursor: 'grab' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {
            // eslint-disable-next-line @next/next/no-img-element -- 裁剪取景框需要直接控制原始像素尺寸和 draggable transform，不适合用 next/image
            <img
              src={imgUrl}
              alt=""
              draggable={false}
              onLoad={handleImageLoad}
              style={
                natural
                  ? {
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      // Tailwind preflight 给 img 设了 max-width: 100%，会把下面的 width 强行
                      // 压到容器宽度以内，导致图片被压扁、跟 transform 算出来的取景框对不上——
                      // 这里必须显式覆盖掉
                      maxWidth: 'none',
                      width: natural.width * baseScale(natural.width, natural.height) * zoom,
                      height: natural.height * baseScale(natural.width, natural.height) * zoom,
                      transform: `translate(${offset.x}px, ${offset.y}px)`,
                      userSelect: 'none',
                    }
                  : { visibility: 'hidden' }
              }
            />
          }
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-grey-500">缩放</span>
          <input
            type="range"
            min={1}
            max={MAX_ZOOM}
            step={0.05}
            value={zoom}
            onChange={(e) => handleZoomChange(Number(e.target.value))}
            className="flex-1"
          />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button type="button" onClick={handleCancel} className="text-sm text-grey-600 hover:underline">
            取消
          </button>
          <div className="flex gap-3">
            <button type="button" onClick={handleSkip} className="text-sm text-grey-600 hover:underline">
              跳过裁剪，直接上传原图
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!natural}
              className="rounded-md bg-water-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-water-600 disabled:opacity-50"
            >
              确认裁剪
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
