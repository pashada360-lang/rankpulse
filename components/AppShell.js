"use client";
import { useEffect } from "react";

/* Wraps every signed-in page: switches the document to the product theme (same dark skin as
   the landing page) and restores the default when the user leaves. Pages render their own nav. */
export default function AppShell({ children }) {
  useEffect(() => {
    const el = document.documentElement;
    const prev = el.getAttribute("data-theme");
    el.setAttribute("data-theme", "app");
    return () => { if (prev) el.setAttribute("data-theme", prev); else el.removeAttribute("data-theme"); };
  }, []);
  return <>{children}</>;
}
