import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import ModuleHero from "@/components/feature/ModuleHero";
import Character from "@/components/brand/Character";
import CategoryTile from "@/components/brand/CategoryTile";
import { useRewards } from "@/components/feature/RewardProvider";
import { gsap, useGSAP, MOTION_OK_QUERY } from "@/lib/gsap";
import useScrollTop from "@/hooks/useScrollTop";
import { characterList, tones, type CharacterId } from "@/data/brand";

type Place = { id: string; label: string; icon: string; sight: string };
const PLACES: Place[] = [
  { id: "oasis", label: "واحة خضراء", icon: "ri-plant-line", sight: "نخيل وماء صافٍ" },
  { id: "dunes", label: "كثبان ذهبية", icon: "ri-sun-line", sight: "رمال دافئة تتلألأ" },
  { id: "village", label: "قرية طينية", icon: "ri-home-line", sight: "بيوت قديمة وأبواب ملوّنة" },
  { id: "beach", label: "شاطئ البحر", icon: "ri-sailboat-line", sight: "أمواج وصدفات صغيرة" },
  { id: "mountain", label: "جبال عالية", icon: "ri-landscape-line", sight: "قمم وسحب قريبة" },
  { id: "farm", label: "مزرعة نخيل", icon: "ri-leaf-line", sight: "عذوق تمر وظلّ جميل" },
];

type Kind = "story" | "activity";

const STORY_STARTS = [
  (h: string, p: Place) => `في ${p.label}، وجد ${h} صندوقًا صغيرًا يهمس بصوت خفيف. ماذا كان بداخله؟ أكمل الحكاية بنفسك!`,
  (h: string, p: Place) => `استيقظ ${h} صباحًا فوجد خريطة مرسومة قرب ${p.sight}. إلى أين تقوده الخريطة؟`,
  (h: string, p: Place) => `كان ${h} يمشي في ${p.label} حين سمع صديقًا صغيرًا يطلب المساعدة. من يكون؟ وكيف سيساعده؟`,
  (h: string, p: Place) => `في ${p.label} نجمة صغيرة ضلّت طريقها إلى السماء. كيف سيعيدها ${h}؟`,
];

const ACTIVITIES = [
  (h: string, p: Place) => `ارسم ${h} وهو يكتشف سرًّا في ${p.label}، ثم اختر اسمًا جميلًا للوحتك.`,
  (h: string, p: Place) => `عُدّ خمسة أشياء جميلة تراها في ${p.label} وارسم كل واحدة بلون مختلف.`,
  (h: string, p: Place) => `اخترع لعبة صغيرة يلعبها ${h} مع أصدقائه في ${p.label}، وعلّمها لأحد أفراد أسرتك.`,
  (h: string, p: Place) => `ابحث حولك عن شيئين يشبهان ${p.sight} وحكِ لأسرتك لماذا أعجباك.`,
];

const nameOf = (id: CharacterId) => characterList.find((c) => c.id === id)!.name;

export default function ZizoWorld() {
  useScrollTop();
  const { earn } = useRewards();
  const [hero, setHero] = useState<CharacterId>("jamool");
  const [placeId, setPlaceId] = useState("oasis");
  const [kind, setKind] = useState<Kind>("story");
  const [idea, setIdea] = useState<{ text: string; kind: Kind } | null>(null);
  const [count, setCount] = useState(0);
  const card = useRef<HTMLDivElement>(null);
  const bot = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!idea) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK_QUERY, () => {
        gsap.fromTo(card.current, { y: 18, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 0.55 });
        gsap.fromTo(bot.current, { scale: 1 }, { scale: 1.08, duration: 0.22, yoyo: true, repeat: 1, ease: "power2.out" });
      });
      return () => mm.revert();
    },
    { dependencies: [idea, count], scope: card }
  );

  const make = () => {
    const place = PLACES.find((p) => p.id === placeId)!;
    const pool = kind === "story" ? STORY_STARTS : ACTIVITIES;
    // pick the next template so repeated taps always change the idea
    const text = pool[count % pool.length](nameOf(hero), place);
    setIdea({ text, kind });
    setCount((n) => n + 1);
    earn("zizo:first-idea", 5, "فكرة من زيزو");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background-50">
      <Navbar />
      <main className="flex-1">
        <ModuleHero
          badge="عالم زيزو"
          badgeIcon="ri-robot-2-line"
          title="مختبر أفكار زيزو"
          description="اختر بطلًا ومكانًا، وزيزو يركّب لك بداية قصة أو نشاطًا تجرّبه."
          category="ai"
        />

        <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-12 md:px-6 md:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
          {/* controls */}
          <div className="card p-5 md:p-8">
            <h2 className="font-heading text-xl font-bold text-foreground-900 md:text-2xl">من بطل قصتك؟</h2>
            <div role="radiogroup" aria-label="البطل" className="mt-4 grid grid-cols-5 gap-2 md:gap-3">
              {characterList.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={hero === c.id}
                  onClick={() => setHero(c.id)}
                  className={`flex flex-col items-center gap-1.5 rounded-3xl p-2 pb-3 transition-all ${
                    hero === c.id ? `${tones[c.tone].soft} ring-2 ${tones[c.tone].ring} -translate-y-0.5` : "bg-background-100 hover:bg-background-200"
                  }`}
                >
                  <img src={`/brand/avatar-${c.id}.webp`} alt="" className="aspect-square w-full rounded-2xl object-cover" loading="lazy" />
                  <span className="font-heading text-xs font-semibold text-foreground-800 md:text-sm">{c.name}</span>
                </button>
              ))}
            </div>

            <h2 className="mt-8 font-heading text-xl font-bold text-foreground-900 md:text-2xl">أين تدور الأحداث؟</h2>
            <div role="radiogroup" aria-label="المكان" className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {PLACES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={placeId === p.id}
                  onClick={() => setPlaceId(p.id)}
                  className={`flex min-h-[3.5rem] items-center gap-3 rounded-2xl px-3 py-2 text-start transition-colors ${
                    placeId === p.id ? "bg-foreground-900 text-background-100" : "bg-background-100 text-foreground-800 hover:bg-background-200"
                  }`}
                >
                  <CategoryTile icon={p.icon} tone={placeId === p.id ? "primary" : "sky"} size="sm" solid={placeId === p.id} />
                  <span className="font-heading text-sm font-semibold leading-tight">{p.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div role="radiogroup" aria-label="نوع الفكرة" className="inline-flex rounded-full bg-background-100 p-1.5">
                {(
                  [
                    ["story", "بداية قصة"],
                    ["activity", "نشاط ممتع"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={kind === id}
                    onClick={() => setKind(id)}
                    className={`h-11 rounded-full px-5 font-heading text-sm font-semibold transition-colors ${kind === id ? "bg-sky-500 text-white" : "text-foreground-700 hover:bg-background-200"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button type="button" onClick={make} className="btn btn-primary btn-lg">
                <i className="ri-magic-line text-xl" />
                ابتكر لي فكرة
              </button>
            </div>
          </div>

          {/* Zizo and the idea */}
          <div ref={card} className="flex flex-col gap-5">
            <div className="card relative flex items-end gap-4 overflow-hidden bg-sky-50 p-5 md:p-7">
              <div ref={bot} className="shrink-0">
                <Character name="zizo" size="lg" motion="float" small />
              </div>
              <div className="min-w-0 flex-1 pb-3">
                <p className="font-heading text-sm font-bold text-sky-700">زيزو يقول</p>
                {idea ? (
                  <p aria-live="polite" className="mt-2 text-lg font-medium leading-relaxed text-foreground-900">
                    {idea.text}
                  </p>
                ) : (
                  <p className="mt-2 text-lg font-medium leading-relaxed text-foreground-700">بيب بوب! اختر ما يعجبك، ثم اضغط الزر.</p>
                )}
                {idea ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" onClick={make} className="btn btn-ghost btn-sm">
                      <i className="ri-refresh-line" />
                      فكرة أخرى
                    </button>
                    {idea.kind === "activity" ? (
                      <Link to="/drawing" className="btn btn-secondary btn-sm">
                        <i className="ri-palette-line" />
                        ارسمها مع مها
                      </Link>
                    ) : (
                      <Link to="/stories" className="btn btn-secondary btn-sm">
                        <i className="ri-book-open-line" />
                        اقرأ قصة
                      </Link>
                    )}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="card p-5 md:p-6">
              <p className="eyebrow !bg-background-200">غير متاح بعد</p>
              <h3 className="mt-3 font-heading text-lg font-bold text-foreground-900">المحادثة مع زيزو</h3>
              <p className="mt-1 text-sm leading-relaxed text-foreground-600">
                المساعد الذكي الحقيقي لم يُربط بالمنصة حتى الآن. ما تراه هنا مولّد أفكار بسيط يعمل دون اتصال، وليس ذكاءً اصطناعيًا.
              </p>
              <button type="button" disabled className="btn btn-ghost btn-sm mt-4">
                <i className="ri-chat-voice-line" />
                اسأل زيزو
              </button>
            </div>
          </div>
        </section>

        <section className="bg-background-100 py-12 md:py-16">
          <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
            <div className="mb-8 max-w-xl">
              <span className="eyebrow">الأمان</span>
              <h2 className="mt-3 font-heading text-2xl font-bold text-foreground-900 md:text-3xl">كيف نحافظ على سلامة طفلك؟</h2>
            </div>
            <ul className="grid gap-4 md:grid-cols-3">
              {[
                { icon: "ri-shield-check-line", title: "أفكار مُراجَعة", desc: "كل ما يقترحه زيزو الآن مكتوب ومُراجَع مسبقًا، ويُركَّب على جهازك." },
                { icon: "ri-lock-line", title: "بلا بيانات شخصية", desc: "لا نطلب اسمًا ولا صورة ولا أي معلومة عن الطفل." },
                { icon: "ri-parent-line", title: "ولي الأمر أولًا", desc: "المحادثة الذكية لن تُفعَّل إلا بموافقة ولي الأمر وضوابط واضحة." },
              ].map((i) => (
                <li key={i.title} className="card flex gap-4 p-5">
                  <CategoryTile icon={i.icon} tone="accent" />
                  <div>
                    <h3 className="font-heading text-base font-bold text-foreground-900">{i.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-foreground-600">{i.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
