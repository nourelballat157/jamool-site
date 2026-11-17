import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import PageBanner from "@/components/feature/PageBanner";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import CategoryTile from "@/components/brand/CategoryTile";
import Character from "@/components/brand/Character";
import { categories, tones } from "@/data/brand";
import { searchItems, searchSuggestions } from "@/mocks/home";

/** pick the category world of a result from the page it opens */
const categoryOfRoute = (route: string) => categories.find((c) => route === c.to || route.startsWith(`${c.to}/`) || route.startsWith(`${c.to}#`)) ?? categories[1];

export default function Search() {
  const [params, setParams] = useSearchParams();
  const initial = params.get("q") || "";
  const [query, setQuery] = useState(initial);
  const [voiceHint, setVoiceHint] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(params.get("q") || "");
  }, [params]);

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return searchItems.filter((item) => item.title.includes(q) || item.desc.includes(q) || item.type.includes(q));
  }, [query]);

  const hasQuery = query.trim().length > 0;

  const runSearch = (value: string) => {
    setQuery(value);
    setParams(value.trim() ? { q: value.trim() } : {});
  };

  const startVoice = () => {
    const w = window as unknown as {
      SpeechRecognition?: new () => unknown;
      webkitSpeechRecognition?: new () => unknown;
    };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) {
      setVoiceHint("البحث الصوتي غير مدعوم في هذا المتصفح");
      window.setTimeout(() => setVoiceHint(""), 2600);
      return;
    }
    try {
      const rec = new Ctor() as {
        lang: string;
        onresult: (ev: { results: { 0: { 0: { transcript: string } } } }) => void;
        start: () => void;
      };
      rec.lang = "ar-SA";
      rec.onresult = (ev) => runSearch(ev.results[0][0].transcript);
      rec.start();
    } catch {
      setVoiceHint("تعذّر تشغيل البحث الصوتي");
      window.setTimeout(() => setVoiceHint(""), 2600);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background-50">
      <Navbar />
      <main className="flex-1">
        <PageBanner eyebrow="ابحث بسهولة" eyebrowIcon="ri-search-2-line" title="ابحث في عالم جمّول" align="center" narrow>
          <div className="text-center">

            <div className="mx-auto flex h-14 w-full max-w-xl items-center rounded-full border-2 border-background-300 bg-background-50 ps-5 pe-2 transition-colors focus-within:border-foreground-700 focus-within:ring-2 focus-within:ring-primary-300">
              <i className="ri-search-line text-lg text-foreground-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") runSearch(query);
                }}
                type="text"
                name="q"
                aria-label="ابحث"
                placeholder="اكتب اسم قصة أو درس أو لعبة..."
                className="h-14 min-w-0 flex-1 bg-transparent px-3 text-sm text-foreground-800 placeholder:text-foreground-400 focus:outline-none"
              />
              <button type="button" onClick={startVoice} aria-label="البحث الصوتي" className="btn-icon shrink-0 text-lg">
                <i className="ri-mic-line" />
              </button>
              <button type="button" onClick={() => runSearch(query)} className="btn btn-primary btn-sm ms-1 shrink-0">
                <i className="ri-search-line" />
                ابحث
              </button>
            </div>

            {voiceHint ? (
              <p role="status" className="mx-auto mt-3 inline-block rounded-xl bg-secondary-100 px-3 py-1.5 text-xs font-bold text-secondary-700">
                {voiceHint}
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {searchSuggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => runSearch(s)}
                  className="min-h-11 rounded-full border border-background-300 bg-background-50 px-4 text-xs font-bold text-foreground-700 transition-colors hover:border-primary-300 hover:bg-primary-50 cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </PageBanner>

        <section className="mx-auto w-full max-w-4xl px-4 py-10 md:px-6 md:py-14">
          {!hasQuery ? (
            <>
              <h2 className="mb-6 font-heading text-xl font-bold text-foreground-900 md:text-2xl">مقترحات تهمّ طفلك</h2>
              <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {searchItems.slice(0, 4).map((item) => (
                  <ResultCard key={item.id} item={item} />
                ))}
              </ul>
            </>
          ) : results.length > 0 ? (
            <>
              <p className="mb-6 text-sm font-bold text-foreground-600" role="status">
                وجدنا {results.length.toLocaleString("ar-EG")} نتيجة لـ «{query.trim()}»
              </p>
              <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {results.map((item) => (
                  <ResultCard key={item.id} item={item} />
                ))}
              </ul>
            </>
          ) : (
            <div className="flex flex-col items-center rounded-3xl bg-background-100 px-6 py-10 text-center">
              <Character name="jamool" size="md" motion="still" small />
              <h2 className="mt-4 font-heading text-2xl font-bold text-foreground-900">لم نجد ما تبحث عنه</h2>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-foreground-600">
                تأكّد من الكلمة أو جرّب كلمة أبسط، مثل: «قصص» أو «حروف» أو «ألعاب».
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setParams({});
                  inputRef.current?.focus();
                }}
                className="btn btn-primary mt-6"
              >
                <i className="ri-refresh-line" />
                جرّب البحث مرة أخرى
              </button>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

function ResultCard({ item }: { item: (typeof searchItems)[number] }) {
  const cat = categoryOfRoute(item.route);
  return (
    <li>
      <Link to={item.route} className="card card-hover group flex items-center gap-4 p-4">
        <CategoryTile category={cat.id} size="lg" className="transition-transform group-hover:-translate-y-0.5" />
        <div className="min-w-0 flex-1">
          <span className={`inline-flex rounded-full px-3 py-0.5 text-[11px] font-bold ${tones[cat.tone].chip}`}>{item.type}</span>
          <h3 className="mt-1.5 font-heading text-lg font-bold text-foreground-900">{item.title}</h3>
          <p className="text-sm font-medium text-foreground-600">{item.desc}</p>
        </div>
        <i className="ri-arrow-left-s-line text-2xl text-foreground-300 transition-colors group-hover:text-foreground-700" />
      </Link>
    </li>
  );
}
