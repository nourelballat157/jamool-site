import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Character from "@/components/brand/Character";
import useAuth, { PASSWORD_HINT, loginAccount, registerAccount, resetPassword, type AccountKind } from "@/store/auth";

const fieldCls =
  "flex h-12 items-center gap-2 rounded-2xl border-2 border-background-300 bg-background-50 px-4 transition-colors focus-within:border-foreground-700 focus-within:ring-2 focus-within:ring-primary-300";
const fieldErrCls = "!border-secondary-500";
const inputCls = "h-12 min-w-0 flex-1 bg-transparent text-sm text-foreground-900 placeholder:text-foreground-400 focus:outline-none";

type Mode = "login" | "register" | "reset" | "reset-done";

function Field({ label, icon, error, children }: { label: string; icon: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-foreground-800">{label}</span>
      <span className={`${fieldCls} ${error ? fieldErrCls : ""}`}>
        <i className={`${icon} text-foreground-400`} />
        {children}
      </span>
      {error ? (
        <span role="alert" className="mt-1 block text-xs font-bold text-secondary-700">
          {error}
        </span>
      ) : null}
    </label>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { account } = useAuth();
  const [mode, setMode] = useState<Mode>(params.get("tab") === "register" ? "register" : "login");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ field?: string; text: string } | null>(null);

  // login
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);

  // register
  const [kind, setKind] = useState<AccountKind>("parent");
  const [name, setName] = useState("");
  const [responsible, setResponsible] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password2, setPassword2] = useState("");
  const [confirm, setConfirm] = useState("");

  // reset
  const [resetId, setResetId] = useState("");
  const [resetWith, setResetWith] = useState("");

  useEffect(() => {
    setError(null);
  }, [mode]);

  // already signed in: straight to the parent dashboard
  if (account && mode !== "reset-done") return <Navigate to="/parent" replace />;

  const fail = (r: { error: string; field?: string }) => setError({ field: r.field, text: r.error });
  const errOf = (field: string) => (error?.field === field ? error.text : undefined);

  const submitLogin = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const r = await loginAccount(identifier, password, remember);
    setBusy(false);
    if (r.ok) navigate("/parent");
    else fail(r);
  };

  const submitRegister = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const r = await registerAccount({ kind, name, responsible, mobile, email, password: password2, confirm });
    setBusy(false);
    if (r.ok) navigate("/parent");
    else fail(r);
  };

  const submitReset = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const r = await resetPassword(resetId, resetWith, password2, confirm);
    setBusy(false);
    if (r.ok) {
      setPassword2("");
      setConfirm("");
      setIdentifier(resetId);
      setMode("reset-done");
    } else fail(r);
  };

  const inst = kind === "institution";
  const resetByEmail = resetId.includes("@");

  return (
    <div className="flex min-h-screen flex-col bg-background-50">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-8 md:px-6 md:py-16">
        <div className="card grid w-full max-w-5xl grid-cols-1 overflow-hidden lg:grid-cols-2">
          {/* Welcome side: Jamool greets, in flow */}
          <div className="flex flex-col items-center justify-end gap-3 bg-amber-50 px-6 pt-6 text-center lg:min-h-[28rem] lg:gap-4 lg:px-10 lg:pt-10">
            <div className="card rounded-3xl p-4 lg:max-w-xs">
              <p className="font-heading text-xl font-bold text-foreground-900 lg:text-2xl">{mode === "register" ? "أهلًا بك في جمّول!" : "أهلًا بعودتك!"}</p>
              <p className="mt-1 text-sm font-medium leading-relaxed text-foreground-600">
                {mode === "register" ? "أنشئ حسابك، ثم أضف ملف طفلك وافتح له عالمه الممتع." : "سجّل دخولك لتختار ملف طفلك وتفتح له عالمه الممتع."}
              </p>
            </div>
            <Character name="jamool" size="lg" motion="wave" priority className="-mb-1" />
          </div>

          {/* Form side */}
          <div className="p-6 md:p-10">
            <div className="mx-auto max-w-sm">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-1.5 text-xs font-bold text-primary-800">
                <i className="ri-user-smile-line" />
                دخول ولي الأمر
              </span>

              {mode === "login" ? (
                <form onSubmit={submitLogin} noValidate>
                  <h1 className="mt-4 font-heading text-3xl font-bold text-foreground-900">تسجيل الدخول</h1>
                  <p className="mt-2 text-sm leading-relaxed text-foreground-600">أدخل بيانات حسابك للوصول إلى ملفات أطفالك.</p>
                  <div className="mt-7 flex flex-col gap-4">
                    <Field label="البريد الإلكتروني أو رقم الجوال" icon="ri-mail-line">
                      <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} name="identifier" autoComplete="username" placeholder="name@example.com أو 05xxxxxxxx" className={inputCls} dir="ltr" style={{ textAlign: "start" }} />
                    </Field>
                    <Field label="كلمة المرور" icon="ri-lock-line">
                      <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" name="password" autoComplete="current-password" placeholder="••••••••" className={inputCls} />
                    </Field>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <button type="button" role="checkbox" aria-checked={remember} onClick={() => setRemember((v) => !v)} className="flex min-h-11 items-center gap-2 text-sm font-medium text-foreground-700 cursor-pointer">
                        <span className={`flex h-6 w-6 items-center justify-center rounded-md border-2 ${remember ? "border-primary-500 bg-primary-500 text-foreground-900" : "border-background-300 bg-background-50"}`}>
                          {remember ? <i className="ri-check-line text-sm" /> : null}
                        </span>
                        تذكّرني
                      </button>
                      <button type="button" onClick={() => setMode("reset")} className="text-sm font-bold text-foreground-800 underline underline-offset-2 hover:text-foreground-900 cursor-pointer">
                        نسيت كلمة المرور؟
                      </button>
                    </div>

                    {error && !error.field ? (
                      <p role="alert" className="rounded-2xl bg-secondary-50 px-4 py-3 text-sm font-bold text-secondary-800">
                        {error.text}
                      </p>
                    ) : null}

                    <button type="submit" disabled={busy} className="btn btn-primary btn-lg w-full">
                      <i className="ri-login-circle-line" />
                      {busy ? "لحظة..." : "دخول"}
                    </button>
                  </div>
                </form>
              ) : null}

              {mode === "register" ? (
                <form onSubmit={submitRegister} noValidate>
                  <h1 className="mt-4 font-heading text-3xl font-bold text-foreground-900">إنشاء حساب</h1>
                  <p className="mt-2 text-sm leading-relaxed text-foreground-600">لا يلزم اشتراك مدفوع، تبدأ بالباقة المجانية وتضيف أطفالك من لوحة التحكم.</p>

                  <div role="radiogroup" aria-label="نوع الحساب" className="mt-6 grid grid-cols-2 gap-2">
                    {([
                      { id: "parent", label: "ولي أمر / فرد", icon: "ri-parent-line" },
                      { id: "institution", label: "مؤسسة تعليمية", icon: "ri-school-line" },
                    ] as const).map((o) => (
                      <button key={o.id} type="button" role="radio" aria-checked={kind === o.id} onClick={() => setKind(o.id)} className={`flex min-h-[3.25rem] items-center justify-center gap-2 rounded-2xl border-2 px-3 text-sm font-bold transition-colors cursor-pointer ${kind === o.id ? "border-primary-500 bg-primary-100 text-foreground-900" : "border-background-300 bg-background-50 text-foreground-600"}`}>
                        <i className={`${o.icon} text-lg`} />
                        {o.label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-col gap-4">
                    <Field label={inst ? "اسم المؤسسة" : "الاسم الكامل"} icon={inst ? "ri-school-line" : "ri-user-line"} error={errOf("name")}>
                      <input value={name} onChange={(e) => setName(e.target.value)} autoComplete={inst ? "organization" : "name"} className={inputCls} />
                    </Field>
                    {inst ? (
                      <Field label="اسم المسؤول" icon="ri-user-star-line" error={errOf("responsible")}>
                        <input value={responsible} onChange={(e) => setResponsible(e.target.value)} autoComplete="name" className={inputCls} />
                      </Field>
                    ) : null}
                    <Field label="رقم الجوال" icon="ri-smartphone-line" error={errOf("mobile")}>
                      <input value={mobile} onChange={(e) => setMobile(e.target.value)} type="tel" inputMode="tel" autoComplete="tel" placeholder="05xxxxxxxx" className={inputCls} dir="ltr" style={{ textAlign: "start" }} />
                    </Field>
                    <Field label="البريد الإلكتروني" icon="ri-mail-line" error={errOf("email")}>
                      <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" placeholder="name@example.com" className={inputCls} dir="ltr" style={{ textAlign: "start" }} />
                    </Field>
                    <Field label="كلمة المرور" icon="ri-lock-line" error={errOf("password")}>
                      <input value={password2} onChange={(e) => setPassword2(e.target.value)} type="password" autoComplete="new-password" className={inputCls} />
                    </Field>
                    <p className="-mt-2 text-xs font-medium text-foreground-500">{PASSWORD_HINT}</p>
                    <Field label="تأكيد كلمة المرور" icon="ri-lock-password-line" error={errOf("confirm")}>
                      <input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" autoComplete="new-password" className={inputCls} />
                    </Field>
                    <button type="submit" disabled={busy} className="btn btn-primary btn-lg w-full">
                      <i className="ri-user-add-line" />
                      {busy ? "لحظة..." : "إنشاء الحساب"}
                    </button>
                  </div>
                </form>
              ) : null}

              {mode === "reset" ? (
                <form onSubmit={submitReset} noValidate>
                  <h1 className="mt-4 font-heading text-3xl font-bold text-foreground-900">استعادة كلمة المرور</h1>
                  <p className="mt-2 text-sm leading-relaxed text-foreground-600">أدخل بريدك أو جوالك، ثم أكّد الطرف الآخر المسجّل في حسابك لتختار كلمة مرور جديدة.</p>
                  <div className="mt-6 flex flex-col gap-4">
                    <Field label="البريد الإلكتروني أو رقم الجوال" icon="ri-mail-line">
                      <input value={resetId} onChange={(e) => setResetId(e.target.value)} className={inputCls} dir="ltr" style={{ textAlign: "start" }} />
                    </Field>
                    <Field label={resetByEmail ? "رقم الجوال المسجّل" : "البريد الإلكتروني المسجّل"} icon={resetByEmail ? "ri-smartphone-line" : "ri-mail-line"}>
                      <input value={resetWith} onChange={(e) => setResetWith(e.target.value)} className={inputCls} dir="ltr" style={{ textAlign: "start" }} />
                    </Field>
                    <Field label="كلمة المرور الجديدة" icon="ri-lock-line" error={errOf("password")}>
                      <input value={password2} onChange={(e) => setPassword2(e.target.value)} type="password" autoComplete="new-password" className={inputCls} />
                    </Field>
                    <Field label="تأكيد كلمة المرور" icon="ri-lock-password-line" error={errOf("confirm")}>
                      <input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" autoComplete="new-password" className={inputCls} />
                    </Field>
                    {error && !error.field ? (
                      <p role="alert" className="rounded-2xl bg-secondary-50 px-4 py-3 text-sm font-bold text-secondary-800">
                        {error.text}
                      </p>
                    ) : null}
                    <button type="submit" disabled={busy} className="btn btn-primary btn-lg w-full">
                      <i className="ri-key-2-line" />
                      {busy ? "لحظة..." : "تغيير كلمة المرور"}
                    </button>
                    <button type="button" onClick={() => setMode("login")} className="text-sm font-bold text-foreground-700 underline underline-offset-2 cursor-pointer">
                      العودة لتسجيل الدخول
                    </button>
                  </div>
                </form>
              ) : null}

              {mode === "reset-done" ? (
                <div>
                  <h1 className="mt-4 font-heading text-3xl font-bold text-foreground-900">تم تغيير كلمة المرور</h1>
                  <p className="mt-2 text-sm leading-relaxed text-foreground-600">يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.</p>
                  <button type="button" onClick={() => setMode("login")} className="btn btn-primary btn-lg mt-6 w-full">
                    <i className="ri-login-circle-line" />
                    تسجيل الدخول
                  </button>
                </div>
              ) : null}

              {mode === "login" || mode === "register" ? (
                <>
                  <div className="mt-5 flex items-start gap-2 rounded-2xl bg-accent-50 p-3">
                    <i className="ri-information-line mt-0.5 text-accent-700" />
                    <p className="text-xs font-medium leading-relaxed text-foreground-700">لا يوجد حساب منفصل للطفل: يحصل الطفل على ملف داخل حساب ولي الأمر فقط، ويدخله ولي الأمر بنفسه.</p>
                  </div>
                  <p className="mt-5 text-center text-sm font-medium text-foreground-600">
                    {mode === "login" ? "ليس لديك حساب؟" : "لديك حساب؟"}{" "}
                    <button type="button" onClick={() => setMode(mode === "login" ? "register" : "login")} className="font-bold text-foreground-900 underline underline-offset-2 cursor-pointer">
                      {mode === "login" ? "أنشئ حسابًا" : "سجّل الدخول"}
                    </button>
                  </p>
                  <p className="mt-3 text-center text-xs font-medium text-foreground-500">
                    تريد التصفح فقط؟{" "}
                    <Link to="/" className="font-bold underline underline-offset-2">
                      أكمل كزائر
                    </Link>
                  </p>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
