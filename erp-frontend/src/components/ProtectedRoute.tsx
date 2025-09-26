"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Agar token nahi hai → login page pe bhej do
    if (!token) {
      router.push("/");
    }
  }, [router]);

  return <>{children}</>;
}
