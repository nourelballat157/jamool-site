import { useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import ModuleHero from "@/components/feature/ModuleHero";
import CategoryTile from "@/components/brand/CategoryTile";
import useScrollTop from "@/hooks/useScrollTop";
import useProgress, { GUEST_ID } from "@/store/progress";
import useAuth from "@/store/auth";
import useContests, { castVote, clearVote, lastResult, myEntry, myVote, standings, submitEntry, withdrawEntry, winnerOf, type Standing } from "@/store/contests";
import { contestById, roundAt, roundOf, type Contest } from "@/data/contests";
import { arNum, dateLabel, readEntryFile, roundProgress, timeLeft, useHashScroll, useNow } from "./helpers";

const field = "mt-1.5 h-12 w-full rounded-2xl border border-background-300 bg-white px-4 text-sm font-bold text-foreground-900 transition-all focus:border-primary-500 focus:shadow-[0_0_0_4px_rgb(255_193_61/0.28)] focus:outline-none";

/** one entry: its picture or text, who sent it, its votes and the vote button */
function EntryCard({ entry, topVotes, showVotes, canVote, voted, mine, onVote, onGate }: { entry: Standing; topVotes: number; showVotes: boolean; canVote: boolean; voted: boolean; mine: boolean; onVote: () => void; onGate: () => void }) {
  return (
    <li className={`card flex flex-col overflow-hidden ${voted ? "ring-2 ring-primary-500" : ""}`}>
      <div className="relative">
        {entry.kind === "image" ? (
          <img src={entry.src} alt={entry.title} loading="lazy" className="aspect-[4/3] w-full bg-background-100 object-cover" />
        ) : (
          <div className="flex aspect-[4/3] w-full items-center bg-gradient-to-br from-amber-50 to-primary-100 p-5">
            <p className="line-clamp-6 text-sm font-medium leading-relaxed text-foreground-800">{entry.text}</p>
          </div>
        )}
        {showVotes ? (
          <span className="absolute start-3 top-3 inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-white/95 px-2 font-heading text-sm font-bold text-foreground-900 shadow-md">
            {entry.rank === 1 ? <i className="ri-trophy-fill me-1 text-primary-500" aria-hidden="true" /> : null}
            {arNum(entry.rank)}
          </span>
        ) : null}
        {entry.sample ? <span className="absolute end-3 top-3 rounded-full bg-foreground-900/70 px-2.5 py-1 text-[0.65rem] font-bold text-background-50">مشاركة تجريبية</span> : null}
        {mine ? <span className="absolute bottom-3 end-3 rounded-full bg-leaf-600 px-2.5 py-1 text-xs font-bold text-background-50">مشاركتي</span> : null}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center gap-2.5">
          <img src={entry.avatar} alt="" className="h-9 w-9 rounded-full border-2 border-background-200 object-cover" />
          <div className="min-w-0">
            <h3 className="truncate font-heading text-base font-bold text-foreground-900">{entry.title}</h3>
            <p className="text-xs font-medium text-foreground-500">{entry.author}</p>
          </div>
        </div>
        {showVotes ? (
          <div>
            <div className="flex items-baseline justify-between text-xs font-bold text-foreground-600">
              <span>الأصوات</span>
              <span className="font-heading text-lg text-foreground-900">{arNum(entry.votes)}</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-background-200" role="presentation">
              <div className="h-full rounded-full bg-primary-500 transition-[width] duration-500" style={{ width: `${Math.max(4, (entry.votes / Math.max(1, topVotes)) * 100)}%` }} />
            </div>
          </div>
        ) : null}
        <div className="mt-auto">
          {mine ? (
            <p className="rounded-full bg-background-100 px-4 py-2 text-center text-xs font-bold text-foreground-600">لا يمكنك التصويت لمشاركتك</p>
          ) : (
            <button type="button" onClick={canVote ? onVote : onGate} aria-pressed={voted} className={`btn btn-sm w-full ${voted ? "btn-secondary" : "btn-primary"}`}>
              <i className={voted ? "ri-heart-fill" : "ri-heart-line"} aria-hidden="true" />
              {voted ? "صوّتَّ لها" : "صوّت لها"}
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

function Inner({ contest }: { contest: Contest }) {
  const saved = useContests();
  const { child, data, state } = useProgress();
  const { account } = useAuth();
  const now = useNow();
  const round = roundAt(contest, now);
  const inChild = child.id !== GUEST_ID;
  const ownerKey = account && inChild ? `${account.id}:${child.id}` : null;
  const contestsOn = state.settings.features.competitions;
  const uploadsOn = state.settings.features.uploads;

  const list = useMemo(() => standings(saved, contest, round.index), [saved, contest, round.index]);
  const top = list[0]?.votes ?? 1;
  const mine = myEntry(saved, contest, round.index, ownerKey);
  const votedId = myVote(saved, contest, round.index, ownerKey);
  const prevRound = roundOf(contest, round.index - 1);
  const prevList = useMemo(() => standings(saved, contest, prevRound.index), [saved, contest, prevRound.index]);
  const prevWinner = winnerOf(prevList);
  const result = lastResult(saved, contest, ownerKey);
  const mineStanding = list.find((e) => e.id === mine?.id);

  /* the form */
  const [tab, setTab] = useState<"mine" | "file">("mine");
  const [pick, setPick] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{ name: string; kind: "image" | "text"; src?: string; text?: string } | null>(null);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [voteMsg, setVoteMsg] = useState("");
  const [gate, setGate] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const eligible = data.creations.filter((c) => contest.creationKinds.includes(c.kind));
  const chosenCreation = eligible.find((c) => c.id === pick) ?? null;

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setError("");
    setBusy(true);
    const r = await readEntryFile(f, contest);
    setBusy(false);
    if (!r.ok) {
      setFileInfo(null);
      return setError(r.error);
    }
    setFileInfo({ name: f.name, kind: r.kind, src: r.src, text: r.text });
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, "").slice(0, 40));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!ownerKey) return;
    setError("");
    let payload: { kind: "image" | "text"; src?: string; text?: string } | null = null;
    if (tab === "mine" && chosenCreation) payload = { kind: "image", src: chosenCreation.image };
    if (tab === "file" && fileInfo) payload = { kind: fileInfo.kind, src: fileInfo.src, text: fileInfo.text };
    if (!payload) return setError(tab === "mine" ? "اختر واحدة من إبداعاتك." : "اختر ملفًا لترسله.");
    const r = submitEntry({ contest, ownerKey, author: child.name, avatar: child.avatar, title, ...payload });
    if (!r.ok) setError(r.error);
    else {
      setPick(null);
      setFileInfo(null);
      setTitle("");
    }
  };

  const vote = (entry: Standing) => {
    if (!ownerKey) return;
    setVoteMsg("");
    if (votedId === entry.id) {
      clearVote(contest, ownerKey);
      return setVoteMsg("تم سحب صوتك. يمكنك التصويت لمشاركة أخرى.");
    }
    const r = castVote(contest, ownerKey, entry.id);
    setVoteMsg(r.ok ? `سجّلنا صوتك لمشاركة «${entry.title}». شكرًا لك!` : r.error);
  };

  const canVote = Boolean(ownerKey) && contestsOn;
  const gateText = !account ? "سجّل دخول ولي الأمر ثم افتح ملف الطفل لتشارك وتصوّت." : !inChild ? "افتح ملف الطفل من «اختيار الطفل» لتشارك وتصوّت." : "أوقف ولي الأمر المسابقات حاليًا.";

  return (
    <>
      <ModuleHero
        category="competitions"
        badge={`مسابقة مستمرة · الجولة ${arNum(round.number)}`}
        badgeIcon="ri-trophy-line"
        title={contest.title}
        description={contest.tagline}
        actions={
          <>
            <a href="#join" className="btn btn-primary btn-lg">
              <i className="ri-send-plane-line" />
              شارك الآن
            </a>
            <a href="#entries" className="btn btn-ghost btn-lg">
              <i className="ri-heart-3-line" />
              شاهد المشاركات وصوّت
            </a>
          </>
        }
      />

      {/* details: what, conditions, how long */}
      <section id="details" className="w-full bg-background-50 py-10 md:py-14">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 px-4 md:px-6 lg:grid-cols-3">
          <article className="card p-5 md:p-6">
            <CategoryTile icon="ri-information-line" tone="sky" size="md" />
            <h2 className="mt-3 font-heading text-xl font-bold text-foreground-900">تفاصيل المسابقة</h2>
            <p className="mt-2 text-sm font-medium leading-relaxed text-foreground-600">{contest.details}</p>
          </article>
          <article className="card p-5 md:p-6">
            <CategoryTile icon="ri-list-check-2" tone="accent" size="md" />
            <h2 className="mt-3 font-heading text-xl font-bold text-foreground-900">شروط المشاركة</h2>
            <ul className="mt-2 flex flex-col gap-2">
              {contest.conditions.map((c) => (
                <li key={c} className="flex items-start gap-2 text-sm font-medium leading-relaxed text-foreground-700">
                  <i className="ri-check-line mt-0.5 text-base text-accent-600" aria-hidden="true" />
                  {c}
                </li>
              ))}
            </ul>
          </article>
          <article className="card p-5 md:p-6">
            <CategoryTile icon="ri-timer-line" tone="primary" size="md" />
            <h2 className="mt-3 font-heading text-xl font-bold text-foreground-900">مدة المشاركة</h2>
            <p className="mt-2 text-sm font-medium text-foreground-600">
              الجولة {arNum(round.number)}: من {dateLabel(round.start)} إلى {dateLabel(round.end)} ({arNum(contest.periodDays)} يومًا)
            </p>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-background-200" role="progressbar" aria-label="تقدّم الجولة" aria-valuenow={Math.round(roundProgress(round.start, round.end, now))} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full bg-primary-500" style={{ width: `${roundProgress(round.start, round.end, now)}%` }} />
            </div>
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-sm font-bold text-primary-800">
              <i className="ri-hourglass-2-line" aria-hidden="true" />
              {timeLeft(round.end, now)}
            </p>
            <p className="mt-3 text-xs font-medium leading-relaxed text-foreground-500">عند انتهاء الجولة تفوز المشاركة التي حصلت على أكثر الأصوات، ثم تبدأ جولة جديدة.</p>
          </article>
        </div>
      </section>

      {/* join */}
      <section id="join" className="w-full scroll-mt-20 bg-background-100 py-10 md:py-14">
        <div className="mx-auto w-full max-w-3xl px-4 md:px-6">
          <h2 className="font-heading text-2xl font-bold text-foreground-900 md:text-3xl">شاركنا في المسابقة</h2>

          {!canVote ? (
            <div className="card mt-5 flex flex-col items-center gap-3 p-6 text-center">
              <CategoryTile icon="ri-lock-line" tone="primary" size="lg" />
              <p className="text-sm font-medium leading-relaxed text-foreground-700">{gateText}</p>
              {!account ? (
                <div className="flex flex-wrap justify-center gap-2">
                  <Link to="/login" className="btn btn-primary btn-sm">
                    تسجيل دخول ولي الأمر
                  </Link>
                  <Link to="/login?tab=register" className="btn btn-ghost btn-sm">
                    إنشاء حساب
                  </Link>
                </div>
              ) : !inChild ? (
                <Link to="/child-select" className="btn btn-primary btn-sm">
                  <i className="ri-group-line" />
                  اختيار الطفل
                </Link>
              ) : null}
            </div>
          ) : mine ? (
            <div className="card mt-5 p-5 md:p-6">
              <div className="flex flex-wrap items-center gap-4">
                {mine.kind === "image" ? (
                  <img src={mine.src} alt={mine.title} className="h-24 w-32 rounded-2xl bg-background-100 object-cover" />
                ) : (
                  <p className="line-clamp-4 max-w-xs rounded-2xl bg-amber-50 p-3 text-xs font-medium leading-relaxed text-foreground-700">{mine.text}</p>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-foreground-500">مشاركتي</p>
                  <h3 className="font-heading text-xl font-bold text-foreground-900">{mine.title}</h3>
                </div>
                <button type="button" onClick={() => withdrawEntry(mine.id)} className="text-xs font-bold text-foreground-500 underline underline-offset-2 hover:text-secondary-700 cursor-pointer">
                  سحب المشاركة
                </button>
              </div>
              <ol className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="حالة المشاركة">
                {[
                  { icon: "ri-send-plane-2-line", title: "تم الإرسال", text: "استلمنا مشاركتك.", done: true },
                  { icon: "ri-heart-3-line", title: "قيد التصويت", text: `${arNum(mineStanding?.votes ?? 0)} صوتًا · المركز ${arNum(mineStanding?.rank ?? 1)} من ${arNum(list.length)}`, done: true, current: true },
                  { icon: "ri-trophy-line", title: "النتيجة", text: `تُعلن ${dateLabel(round.end)}`, done: false },
                ].map((s) => (
                  <li key={s.title} className={`flex items-start gap-3 rounded-2xl p-3 ${s.current ? "bg-primary-100 ring-1 ring-primary-300" : s.done ? "bg-accent-50" : "bg-background-50 ring-1 ring-background-200"}`}>
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg ${s.done ? "bg-accent-500 text-background-50" : "bg-background-200 text-foreground-500"}`}>
                      <i className={s.icon} aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block font-heading text-sm font-bold text-foreground-900">{s.title}</span>
                      <span className="block text-xs font-medium text-foreground-600">{s.text}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <form onSubmit={submit} className="card mt-5 p-5 md:p-6" noValidate>
              <div role="tablist" aria-label="طريقة المشاركة" className="grid grid-cols-2 gap-1 rounded-full bg-background-200/70 p-1">
                {([
                  { id: "mine", label: "من إبداعاتي", icon: "ri-gallery-line" },
                  { id: "file", label: "رفع ملف", icon: "ri-upload-2-line" },
                ] as const).map((t) => (
                  <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => { setTab(t.id); setError(""); }} className={`flex min-h-11 items-center justify-center gap-2 rounded-full font-heading text-sm font-bold transition-colors cursor-pointer ${tab === t.id ? "bg-white text-foreground-900 shadow-sm" : "text-foreground-500"}`}>
                    <i className={t.icon} aria-hidden="true" />
                    {t.label}
                  </button>
                ))}
              </div>

              {tab === "mine" ? (
                eligible.length ? (
                  <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3" aria-label="إبداعاتي">
                    {eligible.map((c) => (
                      <li key={c.id}>
                        <button type="button" onClick={() => setPick(c.id)} aria-pressed={pick === c.id} className={`block w-full overflow-hidden rounded-2xl border-2 bg-white text-start transition-all cursor-pointer ${pick === c.id ? "border-primary-500 shadow-[0_0_0_4px_rgb(255_193_61/0.28)]" : "border-background-200 hover:border-background-300"}`}>
                          <img src={c.image} alt="" className="aspect-[4/3] w-full object-cover" />
                          <span className="block truncate px-3 py-2 text-xs font-bold text-foreground-800">{c.title}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-5 rounded-2xl bg-background-50 p-5 text-center ring-1 ring-background-200">
                    <p className="text-sm font-medium leading-relaxed text-foreground-600">
                      {contest.kind === "drawing" ? "لم تحفظ رسمة في غرفتك بعد." : "لا توجد قصص محفوظة في غرفتك بعد."}
                    </p>
                    {contest.kind === "drawing" ? (
                      <Link to="/drawing" className="btn btn-primary btn-sm mt-3">
                        <i className="ri-brush-line" />
                        ارسم الآن
                      </Link>
                    ) : (
                      <button type="button" onClick={() => setTab("file")} className="btn btn-primary btn-sm mt-3">
                        <i className="ri-upload-2-line" />
                        ارفع قصتك
                      </button>
                    )}
                  </div>
                )
              ) : uploadsOn ? (
                <div className="mt-5">
                  <input ref={fileRef} type="file" accept={contest.files.text ? ".txt,text/plain,image/png,image/jpeg,image/webp" : "image/png,image/jpeg,image/webp"} onChange={onFile} className="sr-only" id="entry-file" />
                  <label htmlFor="entry-file" className="flex min-h-[8.5rem] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-background-300 bg-background-50 p-5 text-center transition-colors hover:border-primary-400 hover:bg-primary-50">
                    {fileInfo?.kind === "image" ? (
                      <img src={fileInfo.src} alt="" className="max-h-32 rounded-xl object-contain" />
                    ) : fileInfo?.kind === "text" ? (
                      <p className="line-clamp-4 max-w-sm text-xs font-medium leading-relaxed text-foreground-700">{fileInfo.text}</p>
                    ) : (
                      <i className="ri-upload-cloud-2-line text-4xl text-primary-600" aria-hidden="true" />
                    )}
                    <span className="text-sm font-bold text-foreground-800">{fileInfo ? fileInfo.name : busy ? "جارٍ تجهيز الملف..." : "اضغط لاختيار ملف"}</span>
                    <span className="text-xs font-medium text-foreground-500">{contest.files.text ? "TXT أو PNG أو JPG أو WEBP" : "PNG أو JPG أو WEBP"}</span>
                  </label>
                </div>
              ) : (
                <p className="mt-5 rounded-2xl bg-background-50 p-4 text-center text-sm font-medium text-foreground-600 ring-1 ring-background-200">أوقف ولي الأمر رفع الملفات، يمكنك المشاركة من إبداعاتك.</p>
              )}

              <label className="mt-5 block">
                <span className="text-xs font-bold text-foreground-700">عنوان المشاركة</span>
                <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={40} placeholder={contest.kind === "drawing" ? "مثال: قلعتي السحرية" : "مثال: الجمل الصغير والنجمة"} className={field} />
              </label>

              {error ? (
                <p role="alert" className="mt-3 flex items-center gap-2 rounded-2xl bg-secondary-50 px-4 py-3 text-sm font-bold text-secondary-800">
                  <i className="ri-error-warning-line text-lg" aria-hidden="true" />
                  {error}
                </p>
              ) : null}
              <button type="submit" disabled={busy} className="btn btn-primary btn-lg mt-5 w-full">
                <i className="ri-send-plane-fill" />
                أرسل مشاركتي
              </button>
            </form>
          )}
        </div>
      </section>

      {/* entries and voting */}
      <section id="entries" className="w-full scroll-mt-20 bg-background-50 py-10 md:py-14">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground-900 md:text-3xl">المشاركات والتصويت</h2>
              <p className="mt-1 text-sm font-medium text-foreground-600">لكل طفل صوت واحد في هذه المسابقة. {contest.showVotes ? "تظهر هنا أصوات كل مشاركة." : ""}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-4 py-2 text-sm font-bold text-primary-800">
              <i className="ri-hourglass-2-line" aria-hidden="true" />
              {timeLeft(round.end, now)}
            </span>
          </div>

          <div aria-live="polite" className="min-h-6 text-sm font-bold text-accent-800">
            {voteMsg}
          </div>
          {gate && !canVote ? (
            <p role="alert" className="mb-4 flex items-center gap-2 rounded-2xl bg-primary-100 px-4 py-3 text-sm font-bold text-foreground-800">
              <i className="ri-lock-line text-lg" aria-hidden="true" />
              {gateText}
            </p>
          ) : null}

          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((e) => (
              <EntryCard key={e.id} entry={e} topVotes={top} showVotes={contest.showVotes} canVote={canVote} voted={votedId === e.id} mine={Boolean(ownerKey) && e.ownerKey === ownerKey} onVote={() => vote(e)} onGate={() => setGate(true)} />
            ))}
          </ul>
        </div>
      </section>

      {/* results of the round that has ended */}
      <section id="results" className="w-full scroll-mt-20 bg-background-100 py-10 md:py-14">
        <div className="mx-auto w-full max-w-3xl px-4 md:px-6">
          <h2 className="font-heading text-2xl font-bold text-foreground-900 md:text-3xl">نتيجة الجولة السابقة</h2>
          <p className="mt-1 text-sm font-medium text-foreground-600">
            الجولة {arNum(prevRound.number)} (من {dateLabel(prevRound.start)} إلى {dateLabel(prevRound.end)}): فازت المشاركة صاحبة أكثر الأصوات.
          </p>

          {result ? (
            <div className={`mt-5 flex items-center gap-4 rounded-3xl p-5 ${result.won ? "bg-primary-100 ring-2 ring-primary-400" : "bg-white ring-1 ring-background-200"}`} role="status">
              <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-3xl ${result.won ? "bg-primary-500 text-foreground-900" : "bg-background-200 text-foreground-600"}`}>
                <i className={result.won ? "ri-trophy-fill" : "ri-medal-line"} aria-hidden="true" />
              </span>
              <div>
                <p className="font-heading text-lg font-bold text-foreground-900">{result.won ? "مبروك! فازت مشاركتك" : "شكرًا لمشاركتك!"}</p>
                <p className="text-sm font-medium text-foreground-600">
                  «{result.entry.title}» حصلت على {arNum(result.entry.votes)} صوتًا وجاءت في المركز {arNum(result.entry.rank)} من {arNum(result.total)}.
                </p>
              </div>
            </div>
          ) : null}

          {prevWinner ? (
            <article className="card mt-5 flex flex-col overflow-hidden sm:flex-row">
              {prevWinner.kind === "image" ? (
                <img src={prevWinner.src} alt={prevWinner.title} loading="lazy" className="aspect-[4/3] w-full bg-background-100 object-cover sm:w-64" />
              ) : (
                <div className="flex w-full items-center bg-gradient-to-br from-amber-50 to-primary-100 p-5 sm:w-64">
                  <p className="line-clamp-6 text-sm font-medium leading-relaxed text-foreground-800">{prevWinner.text}</p>
                </div>
              )}
              <div className="flex flex-1 flex-col justify-center gap-2 p-5">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary-500 px-3 py-1 text-xs font-bold text-foreground-900">
                  <i className="ri-trophy-fill" aria-hidden="true" />
                  الفائزة
                </span>
                <h3 className="font-heading text-xl font-bold text-foreground-900">{prevWinner.title}</h3>
                <p className="flex items-center gap-2 text-sm font-medium text-foreground-600">
                  <img src={prevWinner.avatar} alt="" className="h-7 w-7 rounded-full object-cover" />
                  {prevWinner.author} · {arNum(prevWinner.votes)} صوتًا
                </p>
              </div>
            </article>
          ) : null}
        </div>
      </section>
    </>
  );
}

export default function ContestPage() {
  useScrollTop();
  useHashScroll();
  const { id } = useParams<{ id: string }>();
  const contest = contestById(id);
  return (
    <div className="flex min-h-screen flex-col bg-background-50">
      <Navbar />
      <main className="flex-1">
        {contest ? (
          <Inner contest={contest} />
        ) : (
          <section className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
            <CategoryTile icon="ri-trophy-line" tone="primary" size="lg" />
            <h1 className="mt-4 font-heading text-2xl font-bold text-foreground-900">لم نجد هذه المسابقة</h1>
            <Link to="/competitions#contests" className="btn btn-primary mt-5">
              كل المسابقات
            </Link>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
