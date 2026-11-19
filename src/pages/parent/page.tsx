import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import PageBanner from "@/components/feature/PageBanner";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import CategoryTile from "@/components/brand/CategoryTile";
import Character from "@/components/brand/Character";
import ProgressBar from "@/components/brand/ProgressBar";
import useScrollTop from "@/hooks/useScrollTop";
import useProgress, { addChild, ageOf, levelOf, streakOf, todayISO, updateSettings } from "@/store/progress";
import GenderPick from "@/components/feature/GenderPick";
import { genderOfChild, type Gender } from "@/pages/story/components/parse";
import { avatarChoices, type CategoryId } from "@/data/brand";

const LIMITS = [
  { value: 0, label: "بدون حد" },
  { value: 15, label: "١٥ دقيقة" },
  { value: 30, label: "٣٠ دقيقة" },
  { value: 45, label: "٤٥ دقيقة" },
  { value: 60, label: "ساعة" },
  { value: 90, label: "ساعة ونصف" },
];

const FEATURES: { key: "competitions" | "uploads" | "storyReader"; title: string; desc: string; icon: string }[] = [
  { key: "storyReader", title: "قارئ القصص", desc: "قراءة القصص والاستماع إليها مع الأسئلة.", icon: "ri-book-open-line" },
  { key: "competitions", title: "المسابقات", desc: "المسابقات السريعة والتحديات.", icon: "ri-trophy-line" },
  { key: "uploads", title: "حفظ الرسومات", desc: "حفظ الرسومات والتلوين في غرفة الطفل.", icon: "ri-image-add-line" },
];

const SAFETY = [
  "جمّول مرشد بكلمات جاهزة، وليست محادثة حرة.",
  "لا رسائل ولا تواصل بين الأطفال.",
  "لا إعلانات ولا روابط خارجية في عالم الطفل.",
  "تقدّم كل طفل خاص به، بلا ترتيب عام.",
];

const inputCls =
  "mt-2 h-12 w-full rounded-full border-2 border-background-300 bg-background-50 px-5 text-sm font-bold text-foreground-900 transition-colors focus:border-accent-500";

export default function Parent() {
  useScrollTop();
  const { state } = useProgress();
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [newPin, setNewPin] = useState("");
  const [pinSaved, setPinSaved] = useState(false);
  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");
  const [avatar, setAvatar] = useState(avatarChoices[0].src);
  const [genderPick, setGenderPick] = useState<Gender | undefined>(undefined);
  const gender = genderPick ?? genderOfChild({ name, avatar });
  const [formError, setFormError] = useState("");

  const tryUnlock = (e: FormEvent) => {
    e.preventDefault();
    if (pin === state.settings.pin) {
      setUnlocked(true);
      setError("");
    } else {
      setError("الرمز غير صحيح. الرمز الافتراضي هو ١٢٣٤ حتى تغيّره.");
    }
  };

  const submitChild = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) return setFormError("اكتب اسم الطفل (حرفان على الأقل).");
    const age = ageOf(birth);
    if (!birth || age === null) return setFormError("اختر تاريخ ميلاد الطفل.");
    if (age < 3 || age > 15) return setFormError("المنصة مناسبة للأعمار من ٣ إلى ١٥ سنة.");
    addChild(trimmed, avatar, birth, gender);
    setGenderPick(undefined);
    setName("");
    setBirth("");
    setFormError("");
  };

  const today = todayISO();
  const limit = state.settings.dailyLimit;
  const rows = state.children.map((child) => {
    const d = state.data[child.id];
    const keys = Object.keys(d.earned);
    const count = (prefix: string) => keys.filter((k) => k.startsWith(prefix)).length;
    return {
      child,
      d,
      level: levelOf(d.points),
      streak: streakOf(d.days),
      minutesToday: d.minutes[today] ?? 0,
      stories: count("story:"),
      letters: count("letter:"),
      surahs: count("quran-done:"),
      games: count("game:"),
      values: count("value-done:"),
      age: ageOf(child.birth),
    };
  });

  return (
    <div className="flex min-h-screen flex-col bg-background-50">
      <Navbar />
      <main className="flex-1">
        {/* calm page header: no characters, no looping motion */}
        <PageBanner
          eyebrow="لوحة ولي الأمر"
          eyebrowIcon="ri-shield-user-line"
          title="تابع تقدّم طفلك، وأنت من يقرّر"
          description="من هنا تضبط الوقت اليومي، وتتحكّم بالمزايا، وتتابع ما أنجزه كل طفل. لا محادثات مع غرباء ولا إعلانات ولا مقارنات."
        />

        {!unlocked ? (
          <section className="w-full bg-background-50 py-12 md:py-16">
            <div className="mx-auto w-full max-w-md px-4 md:px-6">
              <form onSubmit={tryUnlock} className="card flex flex-col items-center gap-3 p-6 text-center md:p-8">
                <CategoryTile icon="ri-lock-password-line" tone="accent" size="lg" />
                <h2 className="mt-1 font-heading text-2xl font-bold text-foreground-900">أدخل رمز ولي الأمر</h2>
                <p className="text-sm font-medium text-foreground-600">هذه المنطقة للكبار فقط، حتى يبقى الإعداد آمنًا.</p>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value.replace(/\D/g, ""));
                    setError("");
                  }}
                  aria-label="رمز ولي الأمر"
                  aria-invalid={error ? true : undefined}
                  className="mt-2 h-14 w-48 rounded-full border-2 border-background-300 bg-background-50 text-center text-xl font-bold tracking-[0.6em] text-foreground-900 transition-colors focus:border-accent-500"
                />
                {error ? (
                  <p role="alert" className="text-xs font-bold text-secondary-700">
                    {error}
                  </p>
                ) : null}
                <button type="submit" className="btn btn-primary mt-1">
                  <i className="ri-key-2-line" />
                  دخول
                </button>
              </form>
            </div>
          </section>
        ) : (
          <>
            {/* Children report */}
            <section className="w-full bg-background-50 py-10 md:py-16">
              <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
                <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="font-heading text-2xl font-bold text-foreground-900 md:text-3xl">تقدّم الأطفال</h2>
                    <p className="mt-2 text-sm text-foreground-600 md:text-base">ما أكمله كل طفل، من غير مقارنة بين الإخوة.</p>
                  </div>
                  <button type="button" onClick={() => setUnlocked(false)} className="btn btn-ghost btn-sm">
                    <i className="ri-lock-line" />
                    قفل اللوحة
                  </button>
                </div>

                <ul className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {rows.map((row) => {
                    const overLimit = limit > 0 && row.minutesToday >= limit;
                    const items: { label: string; value: number; total: number; category: CategoryId }[] = [
                      { label: "القصص", value: row.stories, total: 6, category: "stories" },
                      { label: "الحروف", value: row.letters, total: 28, category: "learning" },
                      { label: "السور", value: row.surahs, total: 12, category: "surahs" },
                      { label: "الألعاب", value: row.games, total: 9, category: "games" },
                      { label: "القيم", value: row.values, total: 5, category: "values" },
                    ];
                    return (
                      <li key={row.child.id} className="card p-5 md:p-6">
                        <div className="flex items-center gap-4">
                          <img src={row.child.avatar} alt={row.child.name} className={`h-16 w-16 shrink-0 rounded-2xl border-2 bg-background-100 object-cover ${row.child.ring}`} />
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate font-heading text-lg font-bold text-foreground-900">{row.child.name}</h3>
                            <p className="text-xs font-medium text-foreground-600">
                              المستوى {row.level.level.toLocaleString("ar-EG")} · {row.level.name}
                              {row.age !== null ? ` · ${row.age.toLocaleString("ar-EG")} سنوات` : ""}
                            </p>
                          </div>
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-sm font-bold text-foreground-900">
                            <i className="ri-star-fill text-primary-500" />
                            {row.d.points.toLocaleString("ar-EG")}
                          </span>
                        </div>

                        <div className={`mt-5 rounded-2xl p-4 ${overLimit ? "bg-secondary-50" : "bg-accent-50"}`}>
                          <div className="flex items-center justify-between gap-2 text-sm font-bold text-foreground-800">
                            <span className="flex items-center gap-2">
                              <i className={`ri-time-line text-lg ${overLimit ? "text-secondary-600" : "text-accent-600"}`} />
                              وقت اليوم
                            </span>
                            <span className={overLimit ? "text-secondary-700" : "text-accent-700"}>
                              {row.minutesToday.toLocaleString("ar-EG")} دقيقة{limit ? ` من ${limit.toLocaleString("ar-EG")}` : ""}
                            </span>
                          </div>
                          {limit > 0 ? (
                            <ProgressBar
                              value={(row.minutesToday / limit) * 100}
                              tone={overLimit ? "secondary" : "accent"}
                              label={`وقت ${row.child.name} اليوم`}
                              height="h-2.5"
                              className="mt-3"
                            />
                          ) : (
                            <p className="mt-1 text-xs font-medium text-foreground-500">لا يوجد حد يومي حاليًا.</p>
                          )}
                        </div>

                        <ul className="mt-5 flex flex-col gap-3">
                          {items.map((item) => (
                            <li key={item.label} className="flex items-center gap-3">
                              <CategoryTile category={item.category} size="sm" />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-baseline justify-between gap-2 text-sm">
                                  <span className="font-bold text-foreground-800">{item.label}</span>
                                  <span className="text-xs font-bold text-foreground-500">
                                    {item.value.toLocaleString("ar-EG")} / {item.total.toLocaleString("ar-EG")}
                                  </span>
                                </div>
                                <ProgressBar value={(item.value / item.total) * 100} tone="accent" label={`${item.label}: ${row.child.name}`} height="h-2" className="mt-1.5" />
                              </div>
                            </li>
                          ))}
                        </ul>

                        <p className="mt-4 flex items-center gap-2 text-xs font-bold text-foreground-600">
                          <i className="ri-fire-fill text-base text-amber-500" />
                          {row.streak.toLocaleString("ar-EG")} {row.streak > 2 && row.streak < 11 ? "أيام" : "يومًا"} متتالية
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </section>

            {/* Time + features */}
            <section className="w-full bg-background-100 py-10 md:py-16">
              <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-4 md:px-6 lg:grid-cols-2">
                <div>
                  <h2 className="font-heading text-2xl font-bold text-foreground-900">الوقت اليومي</h2>
                  <p className="mt-2 text-sm text-foreground-600">عند انتهاء الوقت يتوقف العالم بلطف ويُحفظ مكان الطفل. يمكنك إضافة ١٥ دقيقة برمزك.</p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {LIMITS.map((opt) => (
                      <li key={opt.value}>
                        <button
                          type="button"
                          onClick={() => updateSettings({ dailyLimit: opt.value })}
                          aria-pressed={limit === opt.value}
                          className={`btn btn-sm ${limit === opt.value ? "btn-secondary" : "btn-ghost bg-background-50"}`}
                        >
                          {opt.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h2 className="font-heading text-2xl font-bold text-foreground-900">التحكّم بالمزايا</h2>
                  <p className="mt-2 text-sm text-foreground-600">شغّل أو أوقف ما يناسب أسرتك.</p>
                  <ul className="mt-5 flex flex-col gap-3">
                    {FEATURES.map((f) => {
                      const on = state.settings.features[f.key];
                      return (
                        <li key={f.key} className="card flex items-center gap-3 p-4 md:gap-4">
                          <CategoryTile icon={f.icon} tone={on ? "accent" : "primary"} />
                          <div className="min-w-0 flex-1">
                            <p className="font-heading text-base font-bold text-foreground-900">{f.title}</p>
                            <p className="text-xs font-medium text-foreground-600">{f.desc}</p>
                          </div>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={on}
                            aria-label={f.title}
                            onClick={() => updateSettings({ features: { ...state.settings.features, [f.key]: !on } })}
                            className="flex h-11 w-16 shrink-0 items-center justify-center rounded-full cursor-pointer"
                          >
                            <span className={`relative block h-8 w-14 rounded-full transition-colors ${on ? "bg-accent-500" : "bg-background-300"}`}>
                              <span className={`absolute top-1 h-6 w-6 rounded-full bg-background-50 shadow-card transition-all ${on ? "start-1" : "end-1"}`} />
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </section>

            {/* Add child + safety + PIN */}
            <section className="w-full bg-background-50 py-10 md:py-16">
              <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-4 md:px-6 lg:grid-cols-3">
                <form onSubmit={submitChild} className="card p-5 md:p-6 lg:col-span-2">
                  <h2 className="font-heading text-xl font-bold text-foreground-900">إضافة طفل جديد</h2>
                  <p className="mt-1 text-xs font-medium leading-relaxed text-foreground-600">
                    نحتاج الاسم وتاريخ الميلاد فقط، لترتيب المحتوى حسب العمر. لا يحتاج الطفل اسم مستخدم ولا كلمة مرور.
                  </p>
                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="new-child-name" className="block text-xs font-bold text-foreground-700">
                        اسم الطفل
                      </label>
                      <input id="new-child-name" value={name} maxLength={14} onChange={(e) => setName(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label htmlFor="new-child-birth" className="block text-xs font-bold text-foreground-700">
                        تاريخ الميلاد
                      </label>
                      <input id="new-child-birth" type="date" max={today} value={birth} onChange={(e) => setBirth(e.target.value)} className={inputCls} />
                      {birth && ageOf(birth) !== null ? (
                        <p className="mt-1 ps-2 text-xs font-bold text-accent-700">العمر: {ageOf(birth)?.toLocaleString("ar-EG")} سنوات</p>
                      ) : null}
                    </div>
                  </div>
                  <p className="mt-4 text-xs font-bold text-foreground-700">صورة الطفل</p>
                  <ul className="mt-2 grid grid-cols-5 gap-2 sm:flex sm:gap-3">
                    {avatarChoices.map((a) => (
                      <li key={a.id}>
                        <button
                          type="button"
                          onClick={() => setAvatar(a.src)}
                          aria-pressed={avatar === a.src}
                          aria-label={`اختيار ${a.name}`}
                          className={`block aspect-square w-full overflow-hidden rounded-full border-4 transition-colors cursor-pointer sm:h-16 sm:w-16 ${
                            avatar === a.src ? "border-accent-500" : "border-background-200 hover:border-background-300"
                          }`}
                        >
                          <img src={a.src} alt="" className="h-full w-full object-cover" />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <GenderPick value={gender} onChange={setGenderPick} />
                  {formError ? (
                    <p className="mt-3 text-xs font-bold text-secondary-700" role="alert">
                      {formError}
                    </p>
                  ) : null}
                  <button type="submit" className="btn btn-primary mt-5">
                    <i className="ri-user-add-line" />
                    إضافة الطفل
                  </button>
                </form>

                <div className="flex flex-col gap-6">
                  <div className="card bg-accent-50 p-5 md:p-6">
                    <h2 className="font-heading text-xl font-bold text-foreground-900">أمان طفلك</h2>
                    <ul className="mt-4 flex flex-col gap-3 text-sm font-medium text-foreground-700">
                      {SAFETY.map((line) => (
                        <li key={line} className="flex items-start gap-2">
                          <i className="ri-shield-check-line mt-0.5 text-lg text-accent-600" />
                          {line}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="card p-5 md:p-6">
                    <h2 className="font-heading text-lg font-bold text-foreground-900">تغيير رمز ولي الأمر</h2>
                    <div className="mt-3 flex items-center gap-2">
                      <input
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        value={newPin}
                        placeholder="٤ أرقام"
                        aria-label="الرمز الجديد"
                        onChange={(e) => {
                          setNewPin(e.target.value.replace(/\D/g, ""));
                          setPinSaved(false);
                        }}
                        className="h-11 w-28 rounded-full border-2 border-background-300 bg-background-50 text-center text-base font-bold tracking-[0.4em] transition-colors focus:border-accent-500"
                      />
                      <button
                        type="button"
                        disabled={newPin.length !== 4}
                        onClick={() => {
                          updateSettings({ pin: newPin });
                          setNewPin("");
                          setPinSaved(true);
                        }}
                        className="btn btn-secondary btn-sm"
                      >
                        حفظ
                      </button>
                    </div>
                    {pinSaved ? (
                      <p role="status" className="mt-2 text-xs font-bold text-accent-700">
                        تم تغيير الرمز.
                      </p>
                    ) : null}
                  </div>

                  {/* the only character on the parent area: one small Noor tip */}
                  <div className="card flex items-center gap-3 bg-leaf-50 p-4">
                    <Character name="noor" size="sm" small />
                    <div className="min-w-0">
                      <p className="font-heading text-sm font-bold text-foreground-900">نصيحة نور</p>
                      <p className="mt-0.5 text-xs font-medium leading-relaxed text-foreground-600">امدح الجهد لا النتيجة، وجلسة قصيرة كل يوم أفضل من جلسة طويلة مرة في الأسبوع.</p>
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-10 text-center text-xs font-bold text-foreground-500">
                <Link to="/room" className="underline underline-offset-2 hover:text-foreground-800">
                  العودة إلى غرفة الطفل
                </Link>
              </p>
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
