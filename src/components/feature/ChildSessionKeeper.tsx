import { useEffect } from "react";
import { keepChildSession } from "@/store/progress";
import { HEARTBEAT } from "@/store/childSession";

/** Keeps the open child profile's "one active session" lock alive while this tab is open. */
export default function ChildSessionKeeper() {
  useEffect(() => {
    keepChildSession();
    const timer = window.setInterval(keepChildSession, HEARTBEAT);
    const onVisible = () => document.visibilityState === "visible" && keepChildSession();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
  return null;
}
