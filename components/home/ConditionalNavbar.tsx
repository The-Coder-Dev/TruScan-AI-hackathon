"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";

const AUTH_ROUTES = ["/signin", "/signup", "/forgot-password", "/dashboard"];

export function ConditionalNavbar() {
  const pathname = usePathname();
  const hide = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  if (hide) return null;
  return <Navbar />;
}
