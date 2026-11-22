import { useEffect, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Character from "@/components/brand/Character";
import useAuth, { PASSWORD_HINT, loginAccount, registerAccount, resetPassword, type AccountKind } from "@/store/auth";

type Mode = "login" | "register" | "reset" | "reset-done";

const inputCls = "h-full min-w-0 flex-1 bg-transparent text-[0.95rem] text-foreground-900 placeholder:text-foreground-400 focus:outline-none";
const ltr: CSSProperties = { direction: "ltr", textAlign: "start" };
const delay = (i: number): CSSProperties => ({ animationDelay: `${i * 70}ms` });

/** a labelled field: soft box, icon, clear focus ring and an inline error */
function Field({ label, icon, error, hint, trailing, i = 0, children }: { label: string; icon: string; error?: string; hint?: string; trailing?: ReactNode; i?: number; children: ReactNode }) {
  return (
    <label className="auth-fade block" style={delay(i)}>
      <span className="mb-1.5 block text-[0.8rem] font-bold text-foreground-700">{label}</span>
      <span
        className={`flex h-[3.25rem] items-center gap-3 rounded-2xl border bg-white px-4 shadow-[0_1px_0_rgb(31_42_92/0.04)] transition-all duration-200 focus-within:border-primary-500 focus-within:shadow-[0_0_0_4px_rgb(255_193_61/0.28)] ${
          error ? "border-secondary-500" : "border-background-300 hover:border-background-400"
        }`}
      >
        <i className={`${icon} text-lg text-foreground-400`} aria-hidden="true" />
        {children}
        {trailing}
      </span>
      {error ? (
        <span role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-secondary-700">
          <i className="ri-error-warning-line" aria-hidden="true" />
          {error}
        </span>
      ) : hint ? (
        <span className="mt-1.5 block text-xs font-medium text-foreground-500">{hint}</span>
      ) : null}
    </label>
  );
}

function PasswordInput({ value, onChange, autoComplete, placeholder }: { value: string; onChange: (v: string) => void; autoComplete: string; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <>
      <input value={value} onChange={(e) => onChange(e.target.value)} type={show ? "text" : "password"} autoComplete={autoComplete} placeholder={placeholder} className={inputCls} style={show ? ltr : undefined} />
      <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"} aria-pressed={show} className="-me-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-foreground-500 transition-colors hover:bg-background-100 hover:text-foreground-800 cursor-pointer">
        <i className={show ? "ri-eye-off-line text-lg" : "ri-eye-line text-lg"} />
      </button>
    </>
  );
}

function Submit({ busy, icon, children }: { busy: boolean; icon: string; children: ReactNode }) {
  return (
    <button type="submit" disabled={busy} className="btn btn-primary btn-lg auth-fade group relative w-full overflow-hidden !min-h-[3.4rem]" style={delay(7)}>
      <span aria-hidden="true" className="auth-anim pointer-events-none absolute inset-y-0 start-0 w-1/3 -skew-x-12 bg-white/35 opacity-0 transition-opacity group-hover:opacity-100 group-hover:animate-[authSheen_1.4s_ease-in-out_infinite]" />
      {busy ? <i className="ri-loader-4-line animate-spin text-xl" aria-hidden="true" /> : <i className={icon} aria-hidden="true" />}
      {busy ? "لحظة..." : children}
    </button>
  );
}

const TRUST = [
  { icon: "ri-shield-user-line", title: "ملفات للأطفال بلا كلمات مرور", text: "أنت تدخل أولًا ثم تختار ملف طفلك، فلا يحتاج الصغار حسابًا." },
  { icon: "ri-timer-line", title: "تحكّم كامل بالوقت والمزايا", text: "حدّ يومي وتشغيل وإيقاف ما يناسب أسرتك." },
  { icon: "ri-heart-3-line", title: "عالم هادئ وآمن", text: "بلا إعلانات، ولا محادثات مع غرباء، ولا مقارنات." },
];

const STEPS = [
  { icon: "ri-user-add-line", title: "أنشئ حسابك", text: "ببيانات بسيطة وبلا اشتراك مدفوع." },
  { icon: "ri-group-line", title: "أضف أطفالك", text: "ملف لكل طفل حسب باقتك." },
  { icon: "ri-rocket-2-line", title: "ادخل عالمهم", text: "تختار الملف ويبدأ الطفل رحلته." },
];

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
  const showTabs = mode === "login" || mode === "register";
  const registering = mode === "register";

  return (
    <div className="flex min-h-screen flex-col bg-background-50">
      <Navbar />
      <main className="grid flex-1 grid-cols-1 lg:min-h-[calc(100vh-4.75rem)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        {/* ------------------------------ form ------------------------------ */}
        <section className="relative flex items-center justify-center px-5 py-10 sm:px-10 lg:px-16 lg:py-14">
          {/* a faint dotted field behind the form */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(rgb(31_42_92/0.07)_1px,transparent_1.4px)] [background-size:22px_22px]" />

          <div className="relative w-full max-w-md">
            {showTabs ? (
              <div role="tablist" aria-label="الدخول أو إنشاء حساب" className="auth-fade relative mb-8 grid grid-cols-2 rounded-full bg-background-200/70 p-1">
                <span aria-hidden="true" className={`absolute inset-y-1 w-[calc(50%-0.25rem)] rounded-full bg-white shadow-[0_2px_8px_rgb(31_42_92/0.14)] transition-all duration-300 ease-out ${registering ? "start-[calc(50%+0rem)]" : "start-1"}`} />
                {([
                  { id: "login", label: "تسجيل الدخول" },
                  { id: "register", label: "حساب جديد" },
                ] as const).map((t) => (
                  <button key={t.id} type="button" role="tab" aria-selected={mode === t.id} onClick={() => setMode(t.id)} className={`relative z-10 min-h-11 rounded-full font-heading text-sm font-bold transition-colors cursor-pointer ${mode === t.id ? "text-foreground-900" : "text-foreground-500 hover:text-foreground-700"}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            ) : null}

            {mode === "login" ? (
              <form onSubmit={submitLogin} noValidate>
                <h1 className="auth-fade font-heading text-3xl font-bold leading-tight text-foreground-900 md:text-[2.1rem]">أهلًا بعودتك</h1>
                <p className="auth-fade mt-2 text-sm leading-relaxed text-foreground-600" style={delay(1)}>سجّل دخولك لتدير ملفات أطفالك وتتابع تقدّمهم.</p>
                <div className="mt-7 flex flex-col gap-4">
                  <Field i={2} label="البريد الإلكتروني أو رقم الجوال" icon="ri-user-3-line">
                    <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} name="identifier" autoComplete="username" placeholder="name@example.com" className={inputCls} style={ltr} />
                  </Field>
                  <Field i={3} label="كلمة المرور" icon="ri-lock-2-line">
                    <PasswordInput value={password} onChange={setPassword} autoComplete="current-password" placeholder="••••••••" />
                  </Field>

                  <div className="auth-fade flex flex-wrap items-center justify-between gap-2" style={delay(4)}>
                    <button type="button" role="checkbox" aria-checked={remember} onClick={() => setRemember((v) => !v)} className="flex min-h-11 items-center gap-2 text-sm font-medium text-foreground-700 cursor-pointer">
                      <span className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-colors ${remember ? "border-primary-500 bg-primary-500 text-foreground-900" : "border-background-400 bg-white"}`}>{remember ? <i className="ri-check-line text-xs" /> : null}</span>
                      تذكّرني
                    </button>
                    <button type="button" onClick={() => setMode("reset")} className="text-sm font-bold text-primary-800 underline-offset-4 hover:underline cursor-pointer">
                      نسيت كلمة المرور؟
                    </button>
                  </div>

                  {error && !error.field ? (
                    <p role="alert" className="flex items-center gap-2 rounded-2xl bg-secondary-50 px-4 py-3 text-sm font-bold text-secondary-800">
                      <i className="ri-error-warning-line text-lg" aria-hidden="true" />
                      {error.text}
                    </p>
                  ) : null}

                  <Submit busy={busy} icon="ri-login-circle-line">
                    دخول
                  </Submit>
                </div>
              </form>
            ) : null}

            {mode === "register" ? (
              <form onSubmit={submitRegister} noValidate>
                <h1 className="auth-fade font-heading text-3xl font-bold leading-tight text-foreground-900 md:text-[2.1rem]">أنشئ حسابك</h1>
                <p className="auth-fade mt-2 text-sm leading-relaxed text-foreground-600" style={delay(1)}>تبدأ بالباقة المجانية بلا أي دفع، وتضيف أطفالك من لوحة التحكم.</p>

                <div role="radiogroup" aria-label="نوع الحساب" className="auth-fade mt-6 grid grid-cols-2 gap-2" style={delay(2)}>
                  {([
                    { id: "parent", label: "ولي أمر / فرد", icon: "ri-parent-line" },
                    { id: "institution", label: "مؤسسة تعليمية", icon: "ri-school-line" },
                  ] as const).map((o) => (
                    <button key={o.id} type="button" role="radio" aria-checked={kind === o.id} onClick={() => setKind(o.id)} className={`flex min-h-[3.25rem] items-center justify-center gap-2 rounded-2xl border px-3 text-sm font-bold transition-all cursor-pointer ${kind === o.id ? "border-primary-500 bg-primary-50 text-foreground-900 shadow-[0_0_0_4px_rgb(255_193_61/0.22)]" : "border-background-300 bg-white text-foreground-600 hover:border-background-400"}`}>
                      <i className={`${o.icon} text-lg`} aria-hidden="true" />
                      {o.label}
                    </button>
                  ))}
                </div>

                <div className="mt-5 flex flex-col gap-4">
                  <Field i={3} label={inst ? "اسم المؤسسة" : "الاسم الكامل"} icon={inst ? "ri-school-line" : "ri-user-3-line"} error={errOf("name")}>
                    <input value={name} onChange={(e) => setName(e.target.value)} autoComplete={inst ? "organization" : "name"} className={inputCls} />
                  </Field>
                  {inst ? (
                    <Field i={3} label="اسم المسؤول" icon="ri-user-star-line" error={errOf("responsible")}>
                      <input value={responsible} onChange={(e) => setResponsible(e.target.value)} autoComplete="name" className={inputCls} />
                    </Field>
                  ) : null}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field i={4} label="رقم الجوال" icon="ri-smartphone-line" error={errOf("mobile")}>
                      <input value={mobile} onChange={(e) => setMobile(e.target.value)} type="tel" inputMode="tel" autoComplete="tel" placeholder="05xxxxxxxx" className={inputCls} style={ltr} />
                    </Field>
                    <Field i={4} label="البريد الإلكتروني" icon="ri-mail-line" error={errOf("email")}>
                      <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" placeholder="name@example.com" className={inputCls} style={ltr} />
                    </Field>
                  </div>
                  <Field i={5} label="كلمة المرور" icon="ri-lock-2-line" error={errOf("password")} hint={PASSWORD_HINT}>
                    <PasswordInput value={password2} onChange={setPassword2} autoComplete="new-password" />
                  </Field>
                  <Field i={6} label="تأكيد كلمة المرور" icon="ri-lock-password-line" error={errOf("confirm")}>
                    <PasswordInput value={confirm} onChange={setConfirm} autoComplete="new-password" />
                  </Field>
                  <Submit busy={busy} icon="ri-user-add-line">
                    إنشاء الحساب
                  </Submit>
                </div>
              </form>
            ) : null}

            {mode === "reset" ? (
              <form onSubmit={submitReset} noValidate>
                <button type="button" onClick={() => setMode("login")} className="auth-fade mb-5 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-foreground-600 hover:text-foreground-900 cursor-pointer">
                  <i className="ri-arrow-right-line" aria-hidden="true" />
                  العودة لتسجيل الدخول
                </button>
                <h1 className="auth-fade font-heading text-3xl font-bold leading-tight text-foreground-900 md:text-[2.1rem]">استعادة كلمة المرور</h1>
                <p className="auth-fade mt-2 text-sm leading-relaxed text-foreground-600" style={delay(1)}>أدخل بريدك أو جوالك، ثم أكّد الطرف الآخر المسجّل في حسابك لتختار كلمة مرور جديدة.</p>
                <div className="mt-6 flex flex-col gap-4">
                  <Field i={2} label="البريد الإلكتروني أو رقم الجوال" icon="ri-user-3-line">
                    <input value={resetId} onChange={(e) => setResetId(e.target.value)} className={inputCls} style={ltr} />
                  </Field>
                  <Field i={3} label={resetByEmail ? "رقم الجوال المسجّل" : "البريد الإلكتروني المسجّل"} icon={resetByEmail ? "ri-smartphone-line" : "ri-mail-line"}>
                    <input value={resetWith} onChange={(e) => setResetWith(e.target.value)} className={inputCls} style={ltr} />
                  </Field>
                  <Field i={4} label="كلمة المرور الجديدة" icon="ri-lock-2-line" error={errOf("password")} hint={PASSWORD_HINT}>
                    <PasswordInput value={password2} onChange={setPassword2} autoComplete="new-password" />
                  </Field>
                  <Field i={5} label="تأكيد كلمة المرور" icon="ri-lock-password-line" error={errOf("confirm")}>
                    <PasswordInput value={confirm} onChange={setConfirm} autoComplete="new-password" />
                  </Field>
                  {error && !error.field ? (
                    <p role="alert" className="flex items-center gap-2 rounded-2xl bg-secondary-50 px-4 py-3 text-sm font-bold text-secondary-800">
                      <i className="ri-error-warning-line text-lg" aria-hidden="true" />
                      {error.text}
                    </p>
                  ) : null}
                  <Submit busy={busy} icon="ri-key-2-line">
                    تغيير كلمة المرور
                  </Submit>
                </div>
              </form>
            ) : null}

            {mode === "reset-done" ? (
              <div className="text-center">
                <span className="auth-fade mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-leaf-100 text-4xl text-leaf-600">
                  <i className="ri-check-double-line" aria-hidden="true" />
                </span>
                <h1 className="auth-fade mt-5 font-heading text-3xl font-bold text-foreground-900" style={delay(1)}>تم تغيير كلمة المرور</h1>
                <p className="auth-fade mt-2 text-sm leading-relaxed text-foreground-600" style={delay(2)}>يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.</p>
                <button type="button" onClick={() => setMode("login")} className="btn btn-primary btn-lg auth-fade mt-7 w-full" style={delay(3)}>
                  <i className="ri-login-circle-line" />
                  تسجيل الدخول
                </button>
              </div>
            ) : null}

            {showTabs ? (
              <div className="auth-fade mt-7" style={delay(8)}>
                <div className="flex items-center gap-3 text-xs font-medium text-foreground-400">
                  <span className="h-px flex-1 bg-background-300" />
                  أو
                  <span className="h-px flex-1 bg-background-300" />
                </div>
                <Link to="/" className="btn btn-ghost mt-4 w-full">
                  <i className="ri-compass-3-line" />
                  تصفّح كزائر بلا حساب
                </Link>
                <p className="mt-5 flex items-start gap-2 text-xs font-medium leading-relaxed text-foreground-500">
                  <i className="ri-shield-check-line mt-0.5 text-base text-accent-600" aria-hidden="true" />
                  لا يوجد حساب منفصل للطفل: يحصل الطفل على ملف داخل حساب ولي الأمر، ويدخله ولي الأمر بنفسه.
                </p>
              </div>
            ) : null}
          </div>
        </section>

        {/* ----------------------------- brand panel ----------------------------- */}
        <aside className="relative isolate hidden overflow-hidden bg-gradient-to-br from-[#1B1966] via-[#2B2890] to-[#3B3CB2] text-background-50 lg:block" aria-label="عن جمّول">
          {/* slow light and a quiet grid */}
          <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-[0.16] [background-image:linear-gradient(rgb(255_255_255/0.5)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.5)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
          <div aria-hidden="true" className="auth-anim absolute -top-24 start-[-10%] -z-10 h-[26rem] w-[26rem] rounded-full bg-primary-400/25 blur-3xl animate-[authDrift_16s_ease-in-out_infinite]" />
          <div aria-hidden="true" className="auth-anim absolute -bottom-32 end-[-8%] -z-10 h-[30rem] w-[30rem] rounded-full bg-sky-400/25 blur-3xl animate-[authDrift_19s_ease-in-out_infinite_reverse]" />
          {([[12, 22, 12], [78, 14, 16], [88, 52, 10], [20, 64, 9], [64, 82, 13]] as const).map(([x, y, s], i) => (
            <i key={i} aria-hidden="true" className="ri-sparkling-2-fill absolute text-primary-300/80 motion-safe:animate-twinkle" style={{ insetInlineStart: `${x}%`, top: `${y}%`, fontSize: s, animationDelay: `${i * 0.6}s` }} />
          ))}

          <div className="relative flex h-full flex-col justify-between px-12 pb-0 pt-14 xl:px-16">
            <div key={mode}>
              <span className="auth-fade inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-primary-200 ring-1 ring-white/20 backdrop-blur">
                <i className="ri-shield-star-line" aria-hidden="true" />
                {registering ? "ابدأ في ثلاث خطوات" : "مساحة ولي الأمر"}
              </span>
              <h2 className="auth-fade mt-5 max-w-lg font-heading text-4xl font-bold leading-[1.3] !text-white xl:text-[2.6rem]" style={delay(1)}>
                {registering ? "حسابٌ واحد، وعالمٌ لكل طفل" : "عالم آمن لطفلك، وتحكّم كامل لك"}
              </h2>
              <p className="auth-fade mt-3 max-w-md text-base leading-relaxed text-background-100/75" style={delay(2)}>
                {registering ? "أنشئ حسابك وأضف ملفات أطفالك، واختر لكل طفل رحلته." : "قصص وحروف وسور وألعاب ورسم، بصوت جمّول وأصدقائه، بإشرافك أنت."}
              </p>

              <ul className="mt-8 flex max-w-md flex-col gap-3">
                {(registering ? STEPS : TRUST).map((f, i) => (
                  <li key={f.title} className="auth-fade flex items-start gap-4 rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/10 backdrop-blur-sm transition-colors hover:bg-white/[0.11]" style={delay(3 + i)}>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-400/90 text-xl text-foreground-900 shadow-[0_3px_0_rgb(160_105_0/0.55)]">
                      <i className={f.icon} aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block font-heading text-[0.95rem] font-bold">
                        {registering ? <span className="me-2 text-primary-300">{(i + 1).toLocaleString("ar-EG")}.</span> : null}
                        {f.title}
                      </span>
                      <span className="mt-0.5 block text-sm leading-relaxed text-background-100/70">{f.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Jamool stands on a slowly turning ring */}
            <div aria-hidden="true" className="pointer-events-none relative mt-6 flex h-[18.5rem] items-end justify-end">
              <div className="relative h-[18rem] w-[18rem]">
                <svg viewBox="0 0 100 100" className="auth-anim absolute inset-0 h-full w-full text-primary-300/40 animate-[authRing_90s_linear_infinite]">
                  <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1.5 3" />
                </svg>
                <div className="absolute inset-[8%] rounded-full bg-gradient-to-b from-white/15 to-white/0 ring-1 ring-white/15" />
                <div className="absolute inset-x-0 bottom-0 flex justify-center">
                  <Character name="jamool" size="xl" motion="float" priority decorative className="drop-shadow-[0_18px_18px_rgba(10,8,60,0.45)]" />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* phones: a slim brand strip under the form */}
        <div className="flex items-center gap-4 bg-gradient-to-l from-[#1B1966] to-[#3B3CB2] px-5 py-5 text-background-50 lg:hidden">
          <Character name="jamool" size="sm" small decorative motion="float" className="shrink-0" />
          <p className="text-sm font-medium leading-relaxed text-background-100/85">عالم آمن لطفلك، وتحكّم كامل لك: ملفات بلا كلمات مرور، ووقت ومزايا بيدك.</p>
        </div>
      </main>
    </div>
  );
}
