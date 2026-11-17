import { useState } from "react";
import useGameSounds from "@/hooks/useGameSounds";
import { completeActivity } from "@/hooks/useActivityProgress";
import { useRewards } from "@/components/feature/RewardProvider";
import { useCelebration } from "@/pages/games/components/celebration";
import PlantScene, { type PlantFx, type PlantKind } from "@/pages/games/components/PlantScene";
import { FinishCard, NextButton, Notice, RoundBar, shuffleList, toAr, useLater } from "@/pages/games/components/gameParts";

type ToolId = "dig" | "seed" | "sapling" | "soil" | "water" | "sun" | "wait";

type Step = { tool: ToolId; label: string; prompt: string; done: string };

type Stage = {
  kind: PlantKind;
  title: string;
  steps: Step[];
  win: string;
  stageNames: string[];
};

const STAGES: Stage[] = [
  {
    kind: "flower",
    title: "ازرع زهرة",
    steps: [
      { tool: "dig", label: "حفرة", prompt: "نبدأ بتحضير مكانٍ للبذرة. ماذا نفعل بالتراب؟", done: "حفرة صغيرة جاهزة!" },
      { tool: "seed", label: "بذرة", prompt: "الآن نضع البذرة الصغيرة في الحفرة.", done: "البذرة نائمة في مكانها." },
      { tool: "soil", label: "تراب", prompt: "نغطّي البذرة بالتراب لتبقى دافئة.", done: "غطّينا البذرة بالتراب." },
      { tool: "water", label: "ماء", prompt: "البذرة عطشانة… ماذا تحتاج لتستيقظ؟", done: "شربت البذرة وبدأت تنبت!" },
      { tool: "sun", label: "شمس", prompt: "النبتة الصغيرة تحب الدفء والضوء.", done: "الشمس تدفّئ النبتة فتكبر." },
      { tool: "wait", label: "صبر", prompt: "النباتات تحتاج وقتًا لتكبر. ننتظر بصبر…", done: "مرّت الأيام… وجاء وقت الإزهار." },
    ],
    win: "تفتّحت الزهرة! الصبر والعناية يصنعان الجمال.",
    stageNames: [
      "وعاء فيه تراب",
      "حفرة في التراب",
      "بذرة داخل الحفرة",
      "بذرة مغطاة بالتراب",
      "نبتة صغيرة خرجت من التراب",
      "نبتة أكبر وفيها برعم",
      "زهرة جميلة متفتّحة",
    ],
  },
  {
    kind: "tree",
    title: "ازرع شجرة",
    steps: [
      { tool: "dig", label: "حفرة", prompt: "الشجرة تحتاج مكانًا لجذورها. ماذا نفعل أولًا؟", done: "الحفرة جاهزة لجذور الشجرة." },
      { tool: "sapling", label: "شتلة", prompt: "نضع الشتلة الصغيرة في الحفرة.", done: "الشتلة تقف في مكانها." },
      { tool: "soil", label: "تراب", prompt: "نملأ الحفرة بالتراب حول الجذور.", done: "ثبّتنا الشتلة بالتراب." },
      { tool: "water", label: "ماء", prompt: "الجذور تحتاج إلى ماء لتشرب.", done: "شربت الشتلة وصار الجذع أقوى!" },
      { tool: "sun", label: "شمس", prompt: "الأوراق تحتاج إلى ضوء الشمس.", done: "الأوراق الخضراء تفرح بالشمس." },
      { tool: "wait", label: "صبر", prompt: "الأشجار تكبر ببطء. ننتظر بصبر…", done: "كبرت الشجرة وأثمرت!" },
    ],
    win: "كبرت شجرة التفاح! من بذرة صغيرة إلى شجرة مثمرة.",
    stageNames: [
      "وعاء فيه تراب",
      "حفرة في التراب",
      "شتلة صغيرة داخل الحفرة",
      "شتلة مغطاة جذورها بالتراب",
      "شجرة صغيرة بأوراق خضراء",
      "شجرة فتيّة بأوراق كثيرة",
      "شجرة تفاح مثمرة",
    ],
  },
];

const TOOL_TONE = "bg-background-100 text-foreground-800 hover:bg-primary-100";

const FX_FOR_TOOL: Partial<Record<ToolId, PlantFx>> = { dig: "dig", water: "water", sun: "sun", wait: "wait" };

const TOOL_GLYPH: Record<ToolId, string> = {
  dig: "ri-tools-line",
  seed: "ri-leaf-line",
  soil: "ri-landscape-line",
  sapling: "ri-seedling-fill",
  water: "ri-drop-fill",
  sun: "ri-sun-fill",
  wait: "ri-hourglass-fill",
};

function ToolIcon({ tool }: { tool: ToolId }) {
  return <i className={`${TOOL_GLYPH[tool]} text-4xl`} aria-hidden="true" />;
}
type NoticeState = { tone: "good" | "again" | "info"; text: string } | null;

export default function PlantGame({ soundOn = true }: { soundOn?: boolean }) {
  const { playCorrect, playWrong, playWin } = useGameSounds();
  const { celebrate } = useCelebration();
  const { earn } = useRewards();
  const later = useLater();

  const [stageIndex, setStageIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [tray, setTray] = useState<ToolId[]>(() => shuffleList(STAGES[0].steps.map((s) => s.tool)));
  const [wrongRun, setWrongRun] = useState(0);
  const [shaking, setShaking] = useState<ToolId | null>(null);
  const [fx, setFx] = useState<PlantFx>(null);
  const [notice, setNotice] = useState<NoticeState>({ tone: "info", text: "اختر الأداة المناسبة لنبدأ الزراعة." });
  const [gained, setGained] = useState<number | null>(null);

  const stage = STAGES[stageIndex];
  const stageDone = step >= stage.steps.length;
  const finished = gained !== null;
  const current = stage.steps[Math.min(step, stage.steps.length - 1)];

  const pick = (tool: ToolId) => {
    if (stageDone) return;
    const toolLabel = stage.steps.find((s) => s.tool === tool)?.label ?? "";

    if (tool !== current.tool) {
      // a wrong (or too early) tool: a gentle hint, never a penalty
      setWrongRun((n) => n + 1);
      setShaking(tool);
      later(() => setShaking(null), 500);
      setNotice({ tone: "again", text: `«${toolLabel}» فكرة جيدة، لكن ليس الآن. ${current.prompt}` });
      if (soundOn) playWrong();
      return;
    }

    if (soundOn) playCorrect();
    const next = step + 1;
    setStep(next);
    setWrongRun(0);
    const effect = FX_FOR_TOOL[tool] ?? null;
    if (effect) {
      setFx(effect);
      later(() => setFx(null), 1200);
    }

    if (next < stage.steps.length) {
      setNotice({ tone: "good", text: current.done });
      return;
    }

    // last step of this stage: the plant is fully grown
    setNotice({ tone: "good", text: stage.win });
    if (stageIndex === STAGES.length - 1) {
      if (soundOn) playWin();
      celebrate();
      const result = earn("game:plant", 10, "أنهيت لعبة ازرع نبتة");
      completeActivity("game:plant");
      later(() => setGained(result.gained), 900);
    } else if (soundOn) {
      later(() => playWin(), 250);
    }
  };

  const goNextStage = () => {
    const nextIndex = stageIndex + 1;
    setStageIndex(nextIndex);
    setStep(0);
    setWrongRun(0);
    setFx(null);
    setTray(shuffleList(STAGES[nextIndex].steps.map((s) => s.tool)));
    setNotice({ tone: "info", text: "مرحلة جديدة! لنزرع شجرة كبيرة هذه المرة." });
  };

  const restart = () => {
    setStageIndex(0);
    setStep(0);
    setWrongRun(0);
    setFx(null);
    setGained(null);
    setTray(shuffleList(STAGES[0].steps.map((s) => s.tool)));
    setNotice({ tone: "info", text: "اختر الأداة المناسبة لنبدأ الزراعة." });
  };

  const sceneLabel = `${stage.title}: ${stage.stageNames[Math.min(step, 6)]}`;
  const glowTool = wrongRun >= 2 && !stageDone ? current.tool : null;

  return (
    <div className="flex flex-col gap-4">
      <RoundBar
        icon="ri-seedling-line"
        label={stage.title}
        unit="المرحلة"
        round={stageIndex + 1}
        total={STAGES.length}
        done={stageIndex + step / stage.steps.length}
      />

      <div className="relative overflow-hidden rounded-3xl bg-leaf-50 px-3 pb-4 pt-5">
        <i className="ri-cloud-fill pointer-events-none absolute start-4 top-3 text-4xl text-background-50 motion-safe:animate-floaty" aria-hidden="true" />
        <i
          className="ri-cloud-fill pointer-events-none absolute end-16 top-8 text-2xl text-background-50/80 motion-safe:animate-floaty"
          style={{ animationDelay: "1.4s" }}
          aria-hidden="true"
        />
        <PlantScene kind={stage.kind} stage={Math.min(step, 6)} fx={fx} label={sceneLabel} />
        <div className="mt-1 flex items-center justify-center gap-2" aria-hidden="true">
          {stage.steps.map((item, index) => (
            <span
              key={item.tool}
              className={`h-2.5 rounded-full transition-all duration-500 ${
                index < step ? "w-6 bg-leaf-500" : index === step ? "w-6 bg-primary-400" : "w-2.5 bg-background-300"
              }`}
            />
          ))}
        </div>
        <p className="mt-2 text-center text-xs font-bold text-leaf-800">
          {stageDone ? "اكتملت الزراعة!" : `الخطوة ${toAr(step + 1)} من ${toAr(stage.steps.length)}`}
        </p>
      </div>

      <Notice tone={notice?.tone} text={notice?.text} />

      {finished ? (
        <FinishCard
          title="مزارع ماهر!"
          text="زرعت زهرة وشجرة، وعرفت أن النبتة تحتاج حفرة وبذرة وتراب وماء وشمس وصبرًا."
          gained={gained ?? 0}
          onAgain={restart}
          character="jamool"
        />
      ) : stageDone ? (
        stageIndex < STAGES.length - 1 ? (
          <NextButton onClick={goNextStage}>التالي: ازرع شجرة</NextButton>
        ) : null
      ) : (
        <div className="grid grid-cols-3 gap-2.5" role="group" aria-label="أدوات الزراعة">
          {tray.map((tool) => {
            const info = stage.steps.find((s) => s.tool === tool);
            const used = stage.steps.findIndex((s) => s.tool === tool) < step;
            return (
              <button
                key={tool}
                type="button"
                onClick={() => pick(tool)}
                disabled={used}
                aria-label={info?.label}
                className={`relative flex min-h-[5.5rem] flex-col items-center justify-center gap-1.5 rounded-2xl px-2 py-3 text-sm font-bold transition-colors duration-200 cursor-pointer disabled:cursor-default ${
                  used ? "bg-background-100 text-foreground-300" : TOOL_TONE
                } ${shaking === tool ? "xg-shake" : ""} ${glowTool === tool ? "xg-glow" : ""}`}
              >
                <ToolIcon tool={tool} />
                {info?.label}
                {used ? (
                  <i className="ri-checkbox-circle-fill absolute end-2 top-2 text-lg text-leaf-500" aria-hidden="true" />
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
