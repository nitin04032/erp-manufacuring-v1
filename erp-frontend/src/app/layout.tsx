import "./globals.css";
import Script from "next/script";
import LayoutContent from "./layout-content"; // 👈 alag client component import

export const metadata = {
  title: "My ERP System",
  description: "Manufacturing ERP built with Next.js",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Bootstrap 5 CSS */}
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />

        {/* Bootstrap Icons */}
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css"
          rel="stylesheet"
        />

        {/* Google Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />

        {/* Custom CSS */}
        {/* <link href="/assets/css/app.css" rel="stylesheet" /> */}
      </head>
      <body>
        {/* 👇 Ye client component ke andar children pass karenge */}
        <LayoutContent>{children}</LayoutContent>

        {/* ✅ Bootstrap JS Bundle (with Popper) */}
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
        />

        {/* GSAP */}
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"
          strategy="afterInteractive"
        />

        {/* Custom JS */}
        {/* <Script src="/assets/js/app.js" strategy="afterInteractive" /> */}
      </body>
    </html>
  );
}
