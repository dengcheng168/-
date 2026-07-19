'use client';

import { useEffect, useState } from 'react';

/** 解析形如 "1,000,000+" 的字符串，拆出数字部分与前后缀，用于数字滚动动画 */
function parseValue(raw: string) {
  const match = raw.match(/^([^\d]*)([\d,]+)(.*)$/);
  if (!match) return { prefix: '', number: null as number | null, suffix: raw };
  const [, prefix, numStr, suffix] = match;
  return { prefix, number: Number(numStr.replace(/,/g, '')), suffix };
}

export function CountUpValue({ value }: { value: string }) {
  const { prefix, number, suffix } = parseValue(value);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (number === null) return;

    // 用 setInterval 而非 requestAnimationFrame：rAF 在非可见/未聚焦的标签页中会被浏览器暂停触发，
    // 在无头浏览器/自动化测试环境下尤其明显；setInterval 没有这个可见性限制，动画更稳定可靠。
    const durationMs = 1200;
    const stepMs = 30;
    const totalSteps = Math.ceil(durationMs / stepMs);
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep += 1;
      const progress = Math.min(currentStep / totalSteps, 1);
      setDisplay(Math.round(number * progress));
      if (progress >= 1) clearInterval(timer);
    }, stepMs);

    return () => clearInterval(timer);
  }, [number]);

  if (number === null) {
    return <span>{value}</span>;
  }

  return (
    <span>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}
