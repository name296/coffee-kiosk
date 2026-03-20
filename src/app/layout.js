import './globals.css';

/** public/ 기준 상대경로 — basePath + trailingSlash 일 때 문서가 .../coffee-kiosk/ 로 끝나 경로가 맞음 */
const fontUrl = 'fonts/pretendard-gov-semibold.otf';

const fontFaceCss = `
@font-face {
  font-family: "MyFontLarge";
  src: url("${fontUrl}") format("opentype");
  font-weight: 600;
  font-style: normal;
  unicode-range: U+0000-001F, U+0021-002F, U+003A-10FFFF;
}
@font-face {
  font-family: "MyFontLarge";
  src: url("${fontUrl}") format("opentype");
  font-weight: 600;
  font-style: normal;
  size-adjust: 110%;
  unicode-range: U+0020;
}
@font-face {
  font-family: "MyFontLarge";
  src: url("${fontUrl}") format("opentype");
  font-weight: 600;
  font-style: normal;
  size-adjust: 110%;
  unicode-range: U+0030-0039;
}
@font-face {
  font-family: "MyFont";
  src: url("${fontUrl}") format("opentype");
  font-weight: 600;
  font-style: normal;
}
`;

export const metadata = {
  title: 'Coffee Kiosk',
  description: 'Coffee Kiosk Application',
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <style dangerouslySetInnerHTML={{ __html: fontFaceCss }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
