import { useEffect } from "react";
import { Link } from "react-router-dom";
import CategoryTile from "@/components/brand/CategoryTile";

type LoginRequiredModalProps = {
  open: boolean;
  onClose: () => void;
  message?: string;
};

export default function LoginRequiredModal({ open, onClose, message }: LoginRequiredModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4" role="dialog" aria-modal="true" aria-label="تسجيل الدخول مطلوب">
      <button type="button" aria-label="إغلاق" onClick={onClose} className="absolute inset-0 h-full w-full cursor-pointer bg-foreground-950/50" />
      <div className="card animate-rise-in relative z-10 max-h-[92vh] w-full max-w-sm overflow-y-auto p-6 text-center">
        <CategoryTile icon="ri-lock-star-line" tone="primary" size="lg" className="mx-auto" />
        <h3 className="mt-4 font-heading text-xl font-bold text-foreground-900">سجّل دخولك لتتابع</h3>
        <p className="mt-2 text-sm leading-relaxed text-foreground-600">
          {message || "هذه الميزة متاحة لأصحاب الحسابات. يمكنك تسجيل الدخول لتتابع، أو تكمل التصفح بحرية."}
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <Link to="/login" className="btn btn-primary">
            تسجيل الدخول
          </Link>
          <button type="button" onClick={onClose} className="btn btn-ghost">
            أكمل التصفح
          </button>
        </div>
        <p className="mt-3 text-xs font-medium text-foreground-500">لا يوجد حساب للطفل — يكفي حساب ولي الأمر لاختيار ملف الطفل.</p>
      </div>
    </div>
  );
}
