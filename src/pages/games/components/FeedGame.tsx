import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createPortal } from "react-dom";
import useGameSounds from "@/hooks/useGameSounds";
import { completeActivity } from "@/hooks/useActivityProgress";
import { useRewards } from "@/components/feature/RewardProvider";
import { useCelebration } from "@/pages/games/components/celebration";
import { AnimalFace, BowlArt, FoodArt, type AnimalKind, type FoodKind } from "@/pages/games/components/FeedArt";
import { FinishCard, NextButton, Notice, RoundBar, shuffleList, toAr, useLater } from "@/pages/games/components/gameParts";

type Animal = {
  id: AnimalKind;
  name: string;
  food: FoodKind;
  likes: string;
  bowl: string;
};

const ANIMALS: Animal[] = [
  { id: "rabbit", name: "الأرنب", food: "carrot", likes: "الأرنب يحب الجزرة المقرمشة!", bowl: "fill-primary-600" },
  { id: "cat", name: "القطة", food: "fish", likes: "القطة تحب السمكة اللذيذة!", bowl: "fill-secondary-400" },
  { id: "cow", name: "البقرة", food: "grass", likes: "البقرة تحب العشب الأخضر!", bowl: "fill-leaf-500" },
  { id: "bird", name: "العصفور", food: "seeds", likes: "العصفور يحب الحبوب الصغيرة!", bowl: "fill-primary-700" },
];

const FOOD_NAME: Record<FoodKind, string> = {
  carrot: "جزرة",
  fish: "سمكة",
  grass: "عشب",
  seeds: "حبوب",
};

/** stage 2: how many scoops each animal asks for */
const SCOOPS = [2, 3, 4];

type NoticeState = { tone: "good" | "again" | "info"; text: string } | null;
type Drag = { food: FoodKind; x: number; y: number };

const animalAt = (x: number, y: number): AnimalKind | null => {
  const el = document.elementFromPoint(x, y)?.closest("[data-animal]");
  return (el?.getAttribute("data-animal") as AnimalKind | null) ?? null;
};

export default function FeedGame({ soundOn = true }: { soundOn?: boolean }) {
  const { playCorrect, playWrong, playWin } = useGameSounds();
  const { celebrate } = useCelebration();
  const { earn } = useRewards();
  const later = useLater();

  const [stage, setStage] = useState<1 | 2>(1);
  const [order, setOrder] = useState<Animal[]>(() => shuffleList(ANIMALS));
  const [foods, setFoods] = useState<FoodKind[]>(() => shuffleList(ANIMALS.map((a) => a.food)));
  const [fed, setFed] = useState<Partial<Record<AnimalKind, boolean>>>({});
  const [selected, setSelected] = useState<FoodKind | null>(null);
  const [refused, setRefused] = useState<AnimalKind | null>(null);
  const [joy, setJoy] = useState<AnimalKind | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [hover, setHover] = useState<AnimalKind | null>(null);
  const [notice, setNotice] = useState<NoticeState>({
    tone: "info",
    text: "اختر طعامًا، ثم اضغط على الحيوان الذي يأكله — أو اسحبه إليه.",
  });
  const [bowlAnimals, setBowlAnimals] = useState<Animal[]>(() => shuffleList(ANIMALS).slice(0, 3));
  const [scoops, setScoops] = useState<Partial<Record<AnimalKind, number>>>({});
  const [gained, setGained] = useState<number | null>(null);

  const dragRef = useRef<{ food: FoodKind; startX: number; startY: number; moved: boolean; pointerId: number } | null>(null);
  const suppressClick = useRef(false);

  const fedCount = Object.values(fed).filter(Boolean).length;
  const stageOneDone = fedCount === ANIMALS.length;
  const bowlsFull = bowlAnimals.every((a, i) => (scoops[a.id] ?? 0) >= SCOOPS[i]);
  const finished = gained !== null;

  const finishGame = useCallback(() => {
    if (soundOn) playWin();
    celebrate();
    const result = earn("game:feed", 10, "أنهيت لعبة أطعم الحيوانات");
    completeActivity("game:feed");
    later(() => setGained(result.gained), 800);
  }, [celebrate, earn, later, playWin, soundOn]);

  const feed = useCallback(
    (food: FoodKind, animalId: AnimalKind) => {
      const animal = ANIMALS.find((a) => a.id === animalId);
      if (!animal || fed[animalId]) return;

      if (animal.food !== food) {
        // wrong animal: it says no, the food simply stays in the tray
        setRefused(animalId);
        setSelected(null);
        later(() => setRefused(null), 1300);
        setNotice({ tone: "again", text: `هذا ليس طعام ${animal.name}. جرّب مرة أخرى!` });
        if (soundOn) playWrong();
        return;
      }

      if (soundOn) playCorrect();
      setFed((prev) => ({ ...prev, [animalId]: true }));
      setSelected(null);
      setJoy(animalId);
      later(() => setJoy(null), 1200);
      const total = fedCount + 1;
      if (total === ANIMALS.length) {
        setNotice({ tone: "good", text: "أطعمت كل الحيوانات! أحسنت. هيا نملأ الأوعية." });
        if (soundOn) later(() => playWin(), 250);
      } else {
        setNotice({ tone: "good", text: animal.likes });
      }
    },
    [fed, fedCount, later, playCorrect, playWin, playWrong, soundOn]
  );

  /* ---- pointer based dragging (taps still work through onClick) ---- */
  const feedRef = useRef(feed);
  feedRef.current = feed;

  useEffect(() => {
    const move = (event: PointerEvent) => {
      const d = dragRef.current;
      if (!d || event.pointerId !== d.pointerId) return;
      if (!d.moved && Math.hypot(event.clientX - d.startX, event.clientY - d.startY) > 10) d.moved = true;
      if (d.moved) {
        setDrag({ food: d.food, x: event.clientX, y: event.clientY });
        setHover(animalAt(event.clientX, event.clientY));
      }
    };
    const up = (event: PointerEvent) => {
      const d = dragRef.current;
      if (!d || event.pointerId !== d.pointerId) return;
      dragRef.current = null;
      if (d.moved) {
        suppressClick.current = true;
        window.setTimeout(() => {
          suppressClick.current = false;
        }, 0);
        const target = animalAt(event.clientX, event.clientY);
        setDrag(null);
        setHover(null);
        if (target) feedRef.current(d.food, target);
      }
    };
    const cancel = (event: PointerEvent) => {
      const d = dragRef.current;
      if (!d || event.pointerId !== d.pointerId) return;
      dragRef.current = null;
      setDrag(null);
      setHover(null);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
    };
  }, []);

  const onFoodDown = (event: ReactPointerEvent<HTMLButtonElement>, food: FoodKind) => {
    if (stage !== 1) return;
    dragRef.current = { food, startX: event.clientX, startY: event.clientY, moved: false, pointerId: event.pointerId };
  };

  const onFoodClick = (food: FoodKind) => {
    if (suppressClick.current) return;
    setSelected((prev) => (prev === food ? null : food));
    const name = FOOD_NAME[food];
    setNotice({ tone: "info", text: `اخترت ${name}. من يأكلها؟ اضغط على الحيوان.` });
  };

  const onAnimalClick = (animalId: AnimalKind) => {
    if (selected) {
      feed(selected, animalId);
    } else if (!fed[animalId]) {
      setNotice({ tone: "info", text: "اختر طعامًا من الأسفل أولًا." });
    }
  };

  const goStageTwo = () => {
    setStage(2);
    setBowlAnimals(shuffleList(ANIMALS).slice(0, 3));
    setScoops({});
    setNotice({ tone: "info", text: "الحيوانات جائعة! اضغط على الوعاء لتضع حصة طعام في كل مرة." });
  };

  const tapBowl = (animal: Animal, target: number) => {
    const current = scoops[animal.id] ?? 0;
    if (current >= target) return;
    const next = current + 1;
    setScoops((prev) => ({ ...prev, [animal.id]: next }));
    if (soundOn) playCorrect();
    setJoy(animal.id);
    later(() => setJoy(null), 700);
    if (next < target) {
      setNotice({ tone: "info", text: `${toAr(next)} من ${toAr(target)} — واصل!` });
      return;
    }
    const allDone = bowlAnimals.every((a, i) => (a.id === animal.id ? next : scoops[a.id] ?? 0) >= SCOOPS[i]);
    if (allDone) {
      setNotice({ tone: "good", text: "شبعت كل الحيوانات وهي سعيدة. شكرًا لك!" });
      finishGame();
    } else {
      setNotice({ tone: "good", text: `امتلأ وعاء ${animal.name}!` });
    }
  };

  const restart = () => {
    setStage(1);
    setOrder(shuffleList(ANIMALS));
    setFoods(shuffleList(ANIMALS.map((a) => a.food)));
    setFed({});
    setSelected(null);
    setRefused(null);
    setJoy(null);
    setScoops({});
    setGained(null);
    setNotice({ tone: "info", text: "اختر طعامًا، ثم اضغط على الحيوان الذي يأكله — أو اسحبه إليه." });
  };

  const bowlsDoneCount = useMemo(
    () => bowlAnimals.filter((a, i) => (scoops[a.id] ?? 0) >= SCOOPS[i]).length,
    [bowlAnimals, scoops]
  );

  const ghost =
    drag && typeof document !== "undefined"
      ? createPortal(
          <div
            className="pointer-events-none fixed z-[120] flex h-16 w-16 items-center justify-center rounded-2xl bg-background-50/95"
            style={{ left: drag.x, top: drag.y, transform: "translate(-50%, -60%) scale(1.1)" } as CSSProperties}
          >
            <FoodArt kind={drag.food} className="h-12 w-12" />
          </div>,
          document.body
        )
      : null;

  return (
    <div className="flex flex-col gap-4">
      <RoundBar
        icon="ri-bear-smile-line"
        label={stage === 1 ? "أعطِ كل حيوان طعامه" : "املأ الأوعية"}
        unit="المرحلة"
        round={stage}
        total={2}
        done={stage === 1 ? fedCount / ANIMALS.length : 1 + bowlsDoneCount / bowlAnimals.length}
      />

      {stage === 1 ? (
        <>
          <ul className="grid grid-cols-2 gap-3">
            {order.map((animal) => {
              const isFed = Boolean(fed[animal.id]);
              const isRefused = refused === animal.id;
              const isHover = hover === animal.id && !isFed;
              return (
                <li key={animal.id}>
                  <button
                    type="button"
                    data-animal={animal.id}
                    onClick={() => onAnimalClick(animal.id)}
                    aria-label={isFed ? `${animal.name} شبعان` : `أطعم ${animal.name}`}
                    className={`relative flex w-full flex-col items-center gap-1 rounded-3xl px-3 pb-3 pt-4 transition-all duration-300 cursor-pointer ${
                      isFed
                        ? "bg-leaf-100"
                        : isHover
                          ? "scale-105 bg-primary-100"
                          : selected
                            ? "bg-primary-50 hover:bg-primary-100"
                            : "bg-background-100 hover:bg-background-200"
                    } ${isRefused ? "xg-shake" : ""}`}
                  >
                    <AnimalFace kind={animal.id} mood={isFed ? "happy" : isRefused ? "no" : "idle"} className="h-20 w-20" />
                    <span className="text-sm font-bold text-foreground-900">{animal.name}</span>
                    {isRefused ? (
                      <span className="xg-bubble absolute -top-1 end-3 rounded-full bg-secondary-500 px-3 py-1 text-xs font-bold text-background-50">
                        لا، شكرًا!
                      </span>
                    ) : null}
                    {isFed ? (
                      <span className="flex items-center gap-1 rounded-full bg-leaf-500 px-2.5 py-0.5 text-xs font-bold text-background-50">
                        <i className="ri-heart-3-fill" />
                        شبعان
                      </span>
                    ) : (
                      <span className="rounded-full bg-background-50 px-2.5 py-0.5 text-xs font-bold text-foreground-500">جائع</span>
                    )}
                    {joy === animal.id ? (
                      <i className="xg-heart ri-heart-3-fill absolute start-1/2 top-3 text-2xl text-secondary-500" aria-hidden="true" />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>

          <Notice tone={notice?.tone} text={notice?.text} />

          {stageOneDone ? (
            <NextButton onClick={goStageTwo}>التالي: املأ الأوعية</NextButton>
          ) : (
            <div>
              <p className="mb-2 text-xs font-bold text-foreground-500">الأطعمة</p>
              <div className="grid grid-cols-4 gap-2.5" role="group" aria-label="الأطعمة">
                {foods.map((food) => {
                  const owner = ANIMALS.find((a) => a.food === food);
                  const eaten = owner ? Boolean(fed[owner.id]) : false;
                  const isSelected = selected === food;
                  return (
                    <button
                      key={food}
                      type="button"
                      disabled={eaten}
                      onPointerDown={(event) => onFoodDown(event, food)}
                      onClick={() => onFoodClick(food)}
                      aria-pressed={isSelected}
                      aria-label={FOOD_NAME[food]}
                      style={{ touchAction: "none" }}
                      className={`flex min-h-[5rem] select-none flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-xs font-bold transition-all duration-200 cursor-pointer disabled:cursor-default ${
                        eaten
                          ? "bg-background-100 text-foreground-300 opacity-40"
                          : isSelected
                            ? "-translate-y-1 scale-105 bg-primary-200 text-foreground-950 xg-glow"
                            : "bg-primary-100 text-foreground-800 hover:bg-primary-200"
                      } ${drag?.food === food ? "opacity-40" : ""}`}
                    >
                      <FoodArt kind={food} className="h-11 w-11" />
                      {FOOD_NAME[food]}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : finished ? (
        <>
          <ul className="grid grid-cols-3 gap-2">
            {bowlAnimals.map((animal) => (
              <li key={animal.id} className="flex justify-center rounded-3xl bg-leaf-50 py-3">
                <AnimalFace kind={animal.id} mood="happy" className="h-16 w-16" />
              </li>
            ))}
          </ul>
          <FinishCard
            title="أطعمت الجميع!"
            text="عرفت ماذا يأكل الأرنب والقطة والبقرة والعصفور، وملأت أوعيتهم بالعدّ."
            gained={gained ?? 0}
            onAgain={restart}
            character="jamool"
          />
        </>
      ) : (
        <>
          <ul className="grid grid-cols-3 gap-2.5">
            {bowlAnimals.map((animal, index) => {
              const target = SCOOPS[index];
              const count = scoops[animal.id] ?? 0;
              const full = count >= target;
              return (
                <li key={animal.id}>
                  <div className={`flex h-full flex-col items-center gap-1 rounded-3xl px-2 pb-3 pt-3 transition-colors duration-300 ${full ? "bg-leaf-100" : "bg-background-100"}`}>
                    <div className="relative">
                      <AnimalFace kind={animal.id} mood={full ? "happy" : "idle"} className="h-16 w-16" />
                      {joy === animal.id ? (
                        <i className="xg-heart ri-heart-3-fill absolute start-1/2 top-0 text-xl text-secondary-500" aria-hidden="true" />
                      ) : null}
                    </div>
                    <span className="text-xs font-bold text-foreground-900">{animal.name}</span>
                    <span className="text-xs font-bold text-foreground-600">يريد {toAr(target)} حصص</span>
                    <button
                      type="button"
                      onClick={() => tapBowl(animal, target)}
                      disabled={full}
                      aria-label={`ضع حصة في وعاء ${animal.name}، ${toAr(count)} من ${toAr(target)}`}
                      className={`mt-1 flex min-h-[44px] w-full flex-col items-center rounded-2xl bg-background-50 px-1 pb-1.5 pt-1 transition-transform cursor-pointer disabled:cursor-default ${
                        full ? "" : "hover:-translate-y-0.5 active:scale-95"
                      }`}
                    >
                      <BowlArt level={count / target} fill={animal.bowl} className="h-14 w-full" />
                      <span className="flex items-center gap-1" aria-hidden="true">
                        {Array.from({ length: target }, (_, i) => (
                          <span
                            key={i}
                            className={`h-2.5 w-2.5 rounded-full transition-colors duration-300 ${i < count ? "bg-leaf-500" : "bg-background-300"}`}
                          />
                        ))}
                      </span>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          <Notice tone={notice?.tone} text={notice?.text} />
          {bowlsFull ? null : (
            <p className="flex items-center justify-center gap-2 text-center text-xs font-bold text-foreground-500">
              <i className="ri-hand-heart-line text-secondary-500" />
              كل ضغطة تضع حصة واحدة. عدّ معي: ١، ٢، ٣…
            </p>
          )}
        </>
      )}

      {ghost}
    </div>
  );
}
