import "./globals.css";

export const metadata = {
  title: "Coffee Kiosk",
  description: "Coffee Kiosk Application",
  icons: {
    icon: "/favicon.png"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <div id="viewport-scaler" className="viewport-scaler">
          {children}
        </div>
      </body>
    </html>
  );
}
