import Script from 'next/script';

/** X（原 Twitter）官方通用网站标签（uwt.js）标准代码 */
export function TwitterPixel({ pixelId }: { pixelId: string }) {
  return (
    <Script id="twitter-pixel" strategy="afterInteractive">
      {`
        !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
        },s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
        a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
        twq('config','${pixelId}');
      `}
    </Script>
  );
}
