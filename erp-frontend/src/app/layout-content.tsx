"use client";

import { usePathname } from "next/navigation";
import Navbar from "./navbar";

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 👇 Yaha future me aur bhi paths daal sakte ho jisme Navbar hide hoga
  const noNavbarPaths = ["/", "/register", "/forgot-password", "/reset-password", "/login"];

  const hideNavbar = noNavbarPaths.includes(pathname);

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
