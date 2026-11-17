import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Character from "@/components/brand/Character";

const fieldCls =
  "flex h-12 items-center gap-2 rounded-2xl border-2 border-background-300 bg-background-50 px-4 transition-colors focus-within:border-foreground-700 focus-within:ring-2 focus-within:ring-primary-300";
const inputCls = "h-12 min-w-0 flex-1 bg-transparent text-sm text-foreground-900 placeholder:text-foreground-400 focus:outline-none";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);

  const handleEnter = () => {
    navigate("/child-select");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background-50">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-8 md:px-6 md:py-16">
        <div className="card grid w-full max-w-5xl grid-cols-1 overflow-hidden lg:grid-cols-2">
          {/* Welcome side: Jamool greets, in flow */}
          <div className="flex flex-col items-center justify-end gap-3 bg-amber-50 px-6 pt-6 text-center lg:min-h-[28rem] lg:gap-4 lg:px-10 lg:pt-10">
            <div className="card rounded-3xl p-4 lg:max-w-xs">
              <p className="font-heading text-xl font-bold text-foreground-900 lg:text-2xl">أهلًا بعودتك!</p>
              <p className="mt-1 text-sm font-medium leading-relaxed text-foreground-600">سجّل دخولك لتختار ملف طفلك وتفتح له عالمه الممتع.</p>
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
              <h1 className="mt-4 font-heading text-3xl font-bold text-foreground-900">تسجيل الدخول</h1>
              <p className="mt-2 text-sm leading-relaxed text-foreground-600">أدخل بيانات حسابك للوصول إلى ملفات أطفالك.</p>

              <div className="mt-7 flex flex-col gap-4">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold text-foreground-800">البريد الإلكتروني أو رقم الجوال</span>
                  <span className={fieldCls}>
                    <i className="ri-mail-line text-foreground-400" />
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleEnter()}
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="name@example.com"
                      className={inputCls}
                    />
                  </span>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold text-foreground-800">كلمة المرور</span>
                  <span className={fieldCls}>
                    <i className="ri-lock-line text-foreground-400" />
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleEnter()}
                      type="password"
                      name="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className={inputCls}
                    />
                  </span>
                </label>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={remember}
                    onClick={() => setRemember((v) => !v)}
                    className="flex min-h-11 items-center gap-2 text-sm font-medium text-foreground-700 cursor-pointer"
                  >
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-md border-2 ${
                        remember ? "border-primary-500 bg-primary-500 text-foreground-900" : "border-background-300 bg-background-50"
                      }`}
                    >
                      {remember ? <i className="ri-check-line text-sm" /> : null}
                    </span>
                    تذكّرني
                  </button>
                  <Link to="/login" className="text-sm font-bold text-foreground-800 underline underline-offset-2 hover:text-foreground-900">
                    نسيت كلمة المرور؟
                  </Link>
                </div>

                <button type="button" onClick={handleEnter} className="btn btn-primary btn-lg w-full">
                  <i className="ri-login-circle-line" />
                  دخول
                </button>
              </div>

              <div className="mt-5 flex items-start gap-2 rounded-2xl bg-accent-50 p-3">
                <i className="ri-information-line mt-0.5 text-accent-700" />
                <p className="text-xs font-medium leading-relaxed text-foreground-700">
                  لا يوجد حساب منفصل للطفل — يحصل الطفل على ملف داخل حساب ولي الأمر فقط.
                </p>
              </div>

              <p className="mt-5 text-center text-sm font-medium text-foreground-600">
                ليس لديك حساب؟{" "}
                <Link to="/login" className="font-bold text-foreground-900 underline underline-offset-2">
                  أنشئ حسابًا
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
