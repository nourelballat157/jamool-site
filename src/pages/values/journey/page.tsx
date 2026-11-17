import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import SoundToggle from "@/components/feature/SoundToggle";
import Character from "@/components/brand/Character";
import CategoryTile from "@/components/brand/CategoryTile";
import ProgressBar from "@/components/brand/ProgressBar";
import Medal from "@/components/brand/Medal";
import { useRewards } from "@/components/feature/RewardProvider";
import { useSound } from "@/components/feature/SoundProvider";
import { CelebrationProvider, useCelebration } from "@/pages/games/components/celebration";
import GrowthPlant, { type PlantStage } from "@/pages/values/journey/components/GrowthPlant";
import MissionPanel from "@/pages/values/journey/components/MissionPanel";
import useScrollTop from "@/hooks/useScrollTop";
import useArabicSpeech from "@/hooks/useArabicSpeech";
import { completeActivity, recordActivity } from "@/hooks/useActivityProgress";
import useProgress, { setMark } from "@/store/progress";
import { values } from "@/mocks/home";
import {
  STAGE_LABELS,
  doneKey,
  getJourney,
  stepKey,
  visitKey,
  type Journey,
  type Station,
} from "@/data/valueJourneys";
import "./journey.css";

type Value = (typeof values)[number];

const toArabic = (n: number) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);

const KIND_LABEL: Record<Station["kind"], string> = {
  story: "قصة",
  game: "لعبة",
  mission: "مهمة",
};

const primaryButton = "btn btn-primary w-full max-w-full";
const leafButton = "btn w-full max-w-full bg-leaf-500 text-white hover:bg-leaf-600";
const softButton = "btn btn-ghost w-full max-w-full";

const leftText = (left: number) => (left === 1 ? "بقيت محطة واحدة" : left === 2 ? "بقيت محطتان" : "");

/* ------------------------------ journey view ------------------------------ */

function JourneyView({ value, journey }: { value: Value; journey: Journey }) {
  const { isDone, data } = useProgress();
  const { earn } = useRewards();
  const { celebrate } = useCelebration();
  const { soundOn } = useSound();
  const { supported, speak, stop } = useArabicSpeech();

  const doneIds = journey.stations.filter((station) => isDone(stepKey(value.id, station.id))).map((s) => s.id);
  const doneCount = doneIds.length;
  const stage = Math.min(3, doneCount) as PlantStage;
  const allDone = doneCount >= journey.stations.length;

  const [shownStage, setShownStage] = useState<PlantStage>(0);
  const [burstKey, setBurstKey] = useState(0);
  const [activeMission, setActiveMission] = useState<Station["id"] | null>(null);
  const [jamoolText, setJamoolText] = useState(() =>
    allDone
      ? journey.jamoolDone
      : doneCount > 0
        ? `أهلًا بعودتك! أنجزت ${toArabic(doneCount)} من ${toArabic(3)} محطات. ${leftText(3 - doneCount)}، هيا نكمل.`
        : journey.jamoolIntro
  );

  const jamoolTextRef = useRef(jamoolText);
  jamoolTextRef.current = jamoolText;
  const spokenRef = useRef(false);
  const missionRef = useRef<HTMLDivElement | null>(null);

  const say = useCallback(
    (text: string) => {
      if (soundOn && supported) speak(text);
    },
    [soundOn, supported, speak]
  );

  /* Jamool reads the first line once, only if sound is on */
  useEffect(() => {
    if (spokenRef.current || !supported || !soundOn) return;
    const timer = window.setTimeout(() => {
      spokenRef.current = true;
      speak(jamoolTextRef.current);
    }, 700);
    return () => window.clearTimeout(timer);
  }, [supported, soundOn, speak]);

  useEffect(() => {
    if (!soundOn) stop();
  }, [soundOn, stop]);

  /* the plant follows the real progress with a small delay so growth is seen */
  useEffect(() => {
    const timer = window.setTimeout(() => setShownStage(stage), shownStage === 0 && stage > 0 ? 450 : 120);
    return () => window.clearTimeout(timer);
  }, [stage, shownStage]);

  /* home "continue where you stopped" */
  useEffect(() => {
    const key = `value:${value.id}`;
    if (allDone) {
      completeActivity(key);
      return;
    }
    recordActivity({
      key,
      title: `رحلة ${value.title}`,
      subtitle: `${toArabic(doneCount)} من ${toArabic(3)} محطات`,
      icon: value.icon,
      route: `/values/${value.id}`,
      tone: `${journey.tone.soft} ${journey.tone.strong}`,
    });
  }, [allDone, doneCount, value, journey.tone]);

  /* safety net: all stations done but the bloom reward not yet given */
  useEffect(() => {
    if (allDone && !isDone(doneKey(value.id))) {
      earn(doneKey(value.id), 50, `أزهرت شجرة ${value.title}`);
    }
  }, [allDone, earn, isDone, value]);

  const finishStation = (station: Station) => {
    const key = stepKey(value.id, station.id);
    setActiveMission(null);
    if (isDone(key)) return;

    const doneAfter = doneCount + 1;
    earn(key, 10, `محطة جديدة: ${station.title}`);
    setBurstKey((current) => current + 1);

    let text: string;
    if (doneAfter >= journey.stations.length) {
      earn(doneKey(value.id), 50, `أزهرت شجرة ${value.title}`);
      celebrate();
      completeActivity(`value:${value.id}`);
      text = journey.jamoolDone;
    } else {
      text = `أحسنت! كبرت شجرتك. ${leftText(journey.stations.length - doneAfter)}.`;
    }
    setJamoolText(text);
    say(text);
  };

  const openMission = (station: Station) => {
    setActiveMission(station.id);
    window.setTimeout(() => {
      missionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
  };

  const mission = journey.stations.find((station) => station.id === activeMission && station.mission);

  const nextValue = values[(values.findIndex((item) => item.id === value.id) + 1) % values.length];

  return (
    <>
      {/* hero strip */}
      <section className="relative w-full overflow-hidden bg-leaf-50 pb-12 pt-6 md:pb-16 md:pt-10">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 px-4 md:px-6 lg:grid-cols-2 lg:gap-14">
          <div className="animate-rise-in">
            <Link to="/values" className="btn btn-ghost btn-sm min-h-[2.75rem]">
              <i className="ri-arrow-right-line text-base" />
              حديقة القيم
            </Link>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold ${journey.tone.soft} ${journey.tone.strong}`}
              >
                <i className={value.icon} />
                رحلة القيمة
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-background-50 px-3 py-1.5 text-xs font-bold text-foreground-700">
                {Array.from({ length: 3 }, (_, i) => (
                  <span
                    key={i}
                    className={`h-2.5 w-2.5 rounded-full transition-colors duration-500 ${i < doneCount ? "bg-leaf-500" : "bg-leaf-200"}`}
                  />
                ))}
                <span className="ms-1">{toArabic(doneCount)} من {toArabic(3)} محطات</span>
              </span>
            </div>

            <h1 className="mt-4 font-heading text-3xl font-bold leading-[1.3] text-foreground-900 md:text-[2.75rem]">
              رحلة {value.title}
            </h1>
            <p className="mt-3 max-w-lg text-base leading-relaxed text-foreground-600 md:text-lg">
              {value.desc}. نزرع شجرة {value.title} بثلاث محطات صغيرة، ونبدأ بأي محطة نحبّها.
            </p>

            {/* Noor and her speech bubble */}
            <div className="mt-6 flex items-end gap-2 md:gap-4">
              <Character key={burstKey} name="noor" size="md" motion={burstKey > 0 ? "cheer" : "float"} priority className="shrink-0" />
              <div className="card relative min-w-0 flex-1 rounded-3xl p-4 md:p-5">
                <span
                  aria-hidden="true"
                  className="absolute -start-1.5 top-8 h-3.5 w-3.5 rotate-45 rounded-sm border-b border-s border-foreground-900/5 bg-background-50"
                />
                <p aria-live="polite" className="text-base font-medium leading-relaxed text-foreground-800">
                  {jamoolText}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {supported ? (
                    <button
                      type="button"
                      disabled={!soundOn}
                      onClick={() => say(jamoolText)}
                      aria-label="استمع إلى كلام نور"
                      title={soundOn ? "استمع إلى نور" : "الصوت مغلق"}
                      className="btn btn-sm min-h-[2.75rem] bg-leaf-100 text-leaf-800 hover:bg-leaf-200"
                    >
                      <i className="ri-volume-up-line text-lg" />
                      استمع
                    </button>
                  ) : null}
                  <SoundToggle />
                </div>
              </div>
            </div>
          </div>

          {/* plant card */}
          <div className="card p-5 text-center md:p-8">
            <GrowthPlant stage={shownStage} bloom={journey.bloom} burstKey={burstKey} />
            <div className="mt-3 flex flex-col items-center gap-3">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold transition-colors duration-500 ${journey.tone.soft} ${journey.tone.strong}`}
              >
                <i className={shownStage === 3 ? "ri-seedling-fill" : "ri-seedling-line"} />
                {STAGE_LABELS[shownStage]}
              </span>
              <ProgressBar
                value={(doneCount / 3) * 100}
                tone="leaf"
                label="نمو الشجرة"
                height="h-2.5"
                className="max-w-xs"
              />
            </div>
          </div>
        </div>
      </section>

      {/* stations */}
      <section className="w-full bg-background-50 py-12 md:py-16">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
          <div className="mb-8 text-center">
            <h2 className="font-heading text-2xl font-bold text-foreground-900 md:text-4xl">محطات الرحلة</h2>
            <p className="mx-auto mt-2 max-w-xl text-base leading-relaxed text-foreground-600">
              اختر أي محطة تحبّها أولًا، فكل محطة تجعل الشجرة تكبر قليلًا.
            </p>
          </div>

          <ul className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {journey.stations.map((station, position) => {
              const done = doneIds.includes(station.id);
              const visited = Boolean(data.marks[visitKey(value.id, station.id)]);
              return (
                <li
                  key={station.id}
                  className={`card card-hover flex flex-col p-5 md:p-6 ${done ? "ring-2 ring-leaf-300" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <CategoryTile icon={station.icon} tone="leaf" size="lg" solid={done} />
                    {done ? (
                      <span className="vj-pop inline-flex items-center gap-1.5 rounded-full bg-leaf-500 px-3 py-1 text-xs font-bold text-white">
                        <i className="ri-check-line text-sm" />
                        تمت المحطة
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-primary-800">
                        <i className="ri-star-fill text-sm text-primary-500" />
                        +{toArabic(10)} نقاط
                      </span>
                    )}
                  </div>

                  <p className="mt-4 text-xs font-bold text-foreground-500">
                    المحطة {toArabic(position + 1)} · {KIND_LABEL[station.kind]}
                  </p>
                  <h3 className="mt-1 font-heading text-lg font-bold text-foreground-900 md:text-xl">{station.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-foreground-600">{station.desc}</p>

                  <div className="mt-auto flex flex-col gap-2 pt-5">
                    {station.to ? (
                      <>
                        {visited && !done ? (
                          <p className="text-center text-xs font-bold text-leaf-700">أهلًا بعودتك! هل أنهيت هذه المحطة؟</p>
                        ) : null}
                        <Link
                          to={station.to}
                          onClick={() => setMark(visitKey(value.id, station.id), 1)}
                          className={done ? softButton : primaryButton}
                        >
                          {done ? "ارجع إليها" : station.cta}
                          <i className="ri-arrow-left-line text-lg" />
                        </Link>
                        {!done ? (
                          <button
                            type="button"
                            onClick={() => finishStation(station)}
                            className={visited ? leafButton : softButton}
                          >
                            <i className="ri-check-double-line text-lg" />
                            أنهيت هذه المحطة
                          </button>
                        ) : null}
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openMission(station)}
                        aria-expanded={activeMission === station.id}
                        className={done ? softButton : primaryButton}
                      >
                        <i className={done ? "ri-restart-line text-lg" : "ri-play-fill text-lg"} />
                        {done ? "أعد المهمة" : station.cta}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          <p className="mt-6 flex items-center justify-center gap-2 text-center text-sm text-foreground-500">
            <i className="ri-information-line text-leaf-600" />
            تعلّم بصدق: أخبر نور بما أنجزته فعلًا. كل محطة تمنح {toArabic(10)} نقاط، وعند الإزهار {toArabic(50)} نقطة إضافية.
          </p>

          {mission?.mission ? (
            <div ref={missionRef} className="mx-auto mt-8 w-full max-w-3xl scroll-mt-24">
              <MissionPanel
                key={mission.id}
                title={mission.title}
                mission={mission.mission}
                tone={journey.tone}
                say={say}
                onFinish={() => finishStation(mission)}
                onClose={() => setActiveMission(null)}
              />
            </div>
          ) : null}
        </div>
      </section>

      {/* bloom */}
      {allDone ? (
        <section className="w-full bg-background-50 pb-12 md:pb-16">
          <div className="mx-auto w-full max-w-3xl px-4 md:px-6">
            <div className="vj-fade-in card relative overflow-hidden bg-leaf-50 p-6 text-center md:p-10">
              <i aria-hidden="true" className="ri-sparkling-2-fill animate-twinkle absolute start-6 top-6 hidden text-2xl text-primary-500 md:block" />
              <i aria-hidden="true" className="ri-star-fill animate-twinkle absolute end-8 top-10 hidden text-xl text-primary-500 md:block" />
              <div className="flex justify-center">
                <Character name="noor" size="lg" motion="cheer" />
              </div>
              <h2 className="mt-4 font-heading text-2xl font-bold text-foreground-900 md:text-4xl">
                أزهرت شجرة {value.title}
              </h2>
              <p className="mx-auto mt-2 max-w-md text-base leading-relaxed text-foreground-700">{journey.jamoolDone}</p>
              <div className="mt-4 flex justify-center">
                <Medal id="value-bloom" size="md" title="وسام الشجرة المزهرة" />
              </div>
              <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <Link to={`/values/${nextValue.id}`} className="btn btn-primary">
                  نزرع شجرة {nextValue.title}
                  <i className="ri-arrow-left-line text-lg" />
                </Link>
                <Link to="/values" className="btn btn-ghost">
                  العودة إلى حديقة القيم
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
/* -------------------------------- not found -------------------------------- */

function JourneyNotFound() {
  return (
    <section className="w-full bg-leaf-50 py-16 md:py-24">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center px-4 text-center md:px-6">
        <Character name="noor" size="lg" motion="float" />
        <h1 className="mt-4 font-heading text-3xl font-bold text-foreground-900 md:text-[2.75rem]">
          لم أجد هذه الشجرة
        </h1>
        <p className="mt-2 text-base leading-relaxed text-foreground-600">
          يبدو أن هذه الرحلة غير موجودة. تعال نعود إلى الحديقة ونختار قيمة جميلة نزرعها معًا.
        </p>
        <Link
          to="/values"
          className="btn btn-primary mt-6"
        >
          <i className="ri-plant-line text-lg" />
          العودة إلى حديقة القيم
        </Link>
      </div>
    </section>
  );
}

/* ---------------------------------- page ---------------------------------- */

export default function ValueJourneyPage() {
  useScrollTop();
  const { id } = useParams();
  const journey = getJourney(id);
  const value = values.find((item) => item.id === id);

  return (
    <CelebrationProvider>
      <div className="flex min-h-screen flex-col bg-background-50">
        <Navbar />
        <main className="flex-1">
          {journey && value ? <JourneyView key={value.id} value={value} journey={journey} /> : <JourneyNotFound />}
        </main>
        <Footer />
      </div>
    </CelebrationProvider>
  );
}
