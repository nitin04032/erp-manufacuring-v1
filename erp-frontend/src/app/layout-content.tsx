"use client";

import { usePathname } from "next/navigation";
import Navbar from "./navbar";

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Agar login ya register page hai → Navbar hide
  const hideNavbar = ["/", "/register"].includes(pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}

      <main className="container-fluid mt-4">{children}</main>

      {!hideNavbar && (
        <footer className="bg-light mt-5 py-3 border-top">
          <div className="container text-center small text-muted">
            &copy; {new Date().getFullYear()} My ERP System — Version 1.0.0
          </div>
        </footer>
      )}
    </>
  );
}
