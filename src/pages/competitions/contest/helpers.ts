import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import type { Contest } from "@/data/contests";

export const arNum = (n: number): string => n.toLocaleString("ar-EG");

/** a clock that ticks once a minute, so countdowns and rounds move on by themselves */
export function useNow(every = 60000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), every);
    return () => window.clearInterval(t);
  }, [every]);
  return now;
}

/** "باقي ٣ أيام و٤ ساعات" */
export function timeLeft(end: number, now: number): string {
  const ms = Math.max(0, end - now);
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  const dayWord = days === 1 ? "يوم" : days === 2 ? "يومان" : days <= 10 ? `${arNum(days)} أيام` : `${arNum(days)} يومًا`;
  const hourWord = hours === 1 ? "ساعة" : hours === 2 ? "ساعتان" : hours <= 10 ? `${arNum(hours)} ساعات` : `${arNum(hours)} ساعة`;
  if (days > 0) return hours > 0 ? `باقي ${dayWord} و${hourWord}` : `باقي ${dayWord}`;
  if (hours > 0) return `باقي ${hourWord}`;
  return mins > 0 ? `باقي ${arNum(mins)} دقيقة` : "تنتهي الآن";
}

export const dateLabel = (ts: number): string => new Date(ts).toLocaleDateString("ar-EG", { day: "numeric", month: "long" });

/** how far a round has gone, 0..100 */
export const roundProgress = (start: number, end: number, now: number): number => Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));

export type FileRead = { ok: true; kind: "image" | "text"; src?: string; text?: string } | { ok: false; error: string };

const MAX_SIDE = 900;

function downscale(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.naturalWidth * k));
      canvas.height = Math.max(1, Math.round(img.naturalHeight * k));
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("canvas"));
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image"));
    };
    img.src = url;
  });
}

/** checks a chosen file against the contest and turns it into something that can be kept */
export async function readEntryFile(file: File, contest: Contest): Promise<FileRead> {
  const name = file.name.toLowerCase();
  const isImage = /^image\/(png|jpeg|webp)$/.test(file.type) || /\.(png|jpe?g|webp)$/.test(name);
  const isText = file.type === "text/plain" || name.endsWith(".txt");
  if (isImage && contest.files.image) {
    if (file.size > 8 * 1024 * 1024) return { ok: false, error: "الصورة كبيرة جدًا، اختر صورة أقل من ٨ ميجابايت." };
    try {
      return { ok: true, kind: "image", src: await downscale(file) };
    } catch {
      return { ok: false, error: "تعذّر فتح الصورة، جرّب صورة أخرى." };
    }
  }
  if (isText && contest.files.text) {
    if (file.size > 20 * 1024) return { ok: false, error: "الملف النصي كبير، الحد الأقصى ٢٠ كيلوبايت." };
    const text = (await file.text()).trim();
    if (text.length < 20) return { ok: false, error: "القصة قصيرة جدًا، اكتب بضع جمل على الأقل." };
    return { ok: true, kind: "text", text: text.slice(0, 1500) };
  }
  return { ok: false, error: contest.files.text ? "الملف غير مدعوم. اختر ملف TXT أو صورة PNG أو JPG أو WEBP." : "الملف غير مدعوم. اختر صورة PNG أو JPG أو WEBP." };
}

/**
 * arriving on "/page#section" from another page: scroll to the section once the page has drawn. The page's own
 * entrance (and the scroll reset on arrival) can move things, so it checks again a moment later and settles.
 */
export function useHashScroll() {
  const { hash, pathname } = useLocation();
  useEffect(() => {
    if (!hash) return undefined;
    const go = (behavior: ScrollBehavior) => document.querySelector(hash)?.scrollIntoView({ behavior, block: "start" });
    const first = window.setTimeout(() => go("auto"), 300);
    const settle = window.setTimeout(() => {
      const top = document.querySelector(hash)?.getBoundingClientRect().top ?? 0;
      if (Math.abs(top - 80) > 120) go("auto");
    }, 1200);
    return () => {
      window.clearTimeout(first);
      window.clearTimeout(settle);
    };
  }, [hash, pathname]);
}
