'use client';

import { useEffect } from 'react';

/**
 * 根 layout 的 <html lang="en"> 是写死的静态值：它是唯一允许声明 <html> 的地方，
 * 而如果让它读 headers()/cookies() 来按路径变化，会把整个站点（包括所有静态渲染的
 * 英文页面）拖成每次请求都动态渲染，代价太大也没必要。这里改用一个只在 /es 子树里
 * 挂载的极小客户端组件，挂载时把 lang 改成目标值，卸载时（离开 /es 子树做客户端软导航）
 * 改回来——不影响首屏 HTML 的静态生成，只是给浏览器/可执行 JS 的爬虫一个正确的运行时值。
 * 真正影响搜索引擎语言判定的是 hreflang/canonical/JSON-LD inLanguage（服务端渲染，见 Phase H）。
 */
export function SetHtmlLang({ lang }: { lang: string }) {
  useEffect(() => {
    const previous = document.documentElement.lang;
    document.documentElement.lang = lang;
    return () => {
      document.documentElement.lang = previous;
    };
  }, [lang]);

  return null;
}
