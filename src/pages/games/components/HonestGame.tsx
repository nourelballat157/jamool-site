import { useMemo, useState } from "react";
import useGameSounds from "@/hooks/useGameSounds";
import useArabicSpeech from "@/hooks/useArabicSpeech";
import { completeActivity } from "@/hooks/useActivityProgress";
import { useRewards } from "@/components/feature/RewardProvider";
import { useCelebration } from "@/pages/games/components/celebration";
import { FinishCard, NextButton, Notice, RoundBar, shuffleList, toAr } from "@/pages/games/components/gameParts";

type Choice = { text: string; icon: string; good: boolean; think?: string; after?: string };

type Moment = {
  value: string;
  valueIcon: string;
  scene: [string, string];
  sceneTone: string;
  story: string;
  question: string;
  choices: Choice[];
};

const MOMENTS: Moment[] = [
  {
    value: "الصدق",
    valueIcon: "ri-shield-check-fill",
    scene: ["ri-cup-fill", "ri-question-mark"],
    sceneTone: "bg-primary-100 text-primary-700",
    story: "أنت تلعب في المطبخ فيقع كوب وينكسر. تسأل ماما: «من كسر الكوب؟»",
    question: "ماذا يفعل الصادق؟",
    choices: [
      { text: "أقول: أنا كسرته، وأعتذر يا ماما", icon: "ri-emotion-happy-line", good: true, after: "أحسنت! الصدق يريح القلب، وماما ستسامحك بسهولة." },
      { text: "أقول: لا أعرف من كسره", icon: "ri-eye-off-line", good: false, think: "هل نقول الحقيقة حتى لو أخطأنا؟ فكّر مرة أخرى." },
      { text: "أقول: أخي هو الذي كسره", icon: "ri-user-unfollow-line", good: false, think: "هل هذا ما حدث فعلًا؟ فكّر مرة أخرى." },
    ],
  },
  {
    value: "اللطف",
    valueIcon: "ri-heart-3-fill",
    scene: ["ri-user-smile-line", "ri-emotion-sad-line"],
    sceneTone: "bg-secondary-100 text-secondary-700",
    story: "في الحديقة، طفل جديد يجلس وحده ويبدو حزينًا.",
    question: "ماذا يفعل اللطيف؟",
    choices: [
      { text: "أدعوه ليلعب معنا", icon: "ri-team-line", good: true, after: "جميل! كلمة طيبة تجعل الصديق الجديد يبتسم." },
      { text: "أكمل لعبي وأتركه وحده", icon: "ri-walk-line", good: false, think: "كيف سيشعر الطفل الجديد؟ فكّر مرة أخرى." },
    ],
  },
  {
    value: "المشاركة",
    valueIcon: "ri-hand-heart-fill",
    scene: ["ri-cake-3-fill", "ri-group-line"],
    sceneTone: "bg-leaf-100 text-leaf-700",
    story: "معك قطعة حلوى لذيذة، وصديقك ينظر إليها بشوق.",
    question: "ماذا يفعل الكريم؟",
    choices: [
      { text: "أعطيه نصفها", icon: "ri-hand-heart-line", good: true, after: "ما أجمل المشاركة! الفرحة تكبر عندما نتقاسمها." },
      { text: "آكلها كلها بسرعة", icon: "ri-restaurant-line", good: false, think: "هل سيفرح صديقك؟ فكّر مرة أخرى." },
      { text: "أخبّئها في جيبي", icon: "ri-lock-line", good: false, think: "ماذا لو شاركناها؟ فكّر مرة أخرى." },
    ],
  },
  {
    value: "النظافة",
    valueIcon: "ri-hand-sanitizer-fill",
    scene: ["ri-hand-sanitizer-fill", "ri-restaurant-fill"],
    sceneTone: "bg-leaf-100 text-leaf-700",
    story: "عدت من اللعب في الحديقة، ويداك متّسختان، والغداء جاهز.",
    question: "ماذا يفعل النظيف؟",
    choices: [
      { text: "أغسل يديّ بالماء والصابون", icon: "ri-drop-line", good: true, after: "ممتاز! اليدان النظيفتان تحميان جسمك من الجراثيم." },
      { text: "آكل مباشرة لأني جائع", icon: "ri-restaurant-line", good: false, think: "هل يداك نظيفتان؟ فكّر مرة أخرى." },
      { text: "أمسح يديّ في ملابسي", icon: "ri-t-shirt-line", good: false, think: "هل تكفي هذه الطريقة؟ فكّر مرة أخرى." },
    ],
  },
  {
    value: "برّ الوالدين",
    valueIcon: "ri-home-heart-fill",
    scene: ["ri-parent-line", "ri-chat-voice-line"],
    sceneTone: "bg-primary-100 text-primary-700",
    story: "أنت تلعب بسعادة، فينادي أبوك: «تعال ساعدني من فضلك».",
    question: "ماذا يفعل المطيع؟",
    choices: [
      { text: "أترك لعبتي وأقول: حاضر يا أبي", icon: "ri-user-heart-line", good: true, after: "ما أجمل طاعتك! برّ الوالدين يُسعد الله ويُسعدهما." },
      { text: "أتظاهر أني لم أسمع", icon: "ri-volume-mute-line", good: false, think: "هل سيفرح أبوك؟ فكّر مرة أخرى." },
      { text: "أقول: بعد قليل!", icon: "ri-time-line", good: false, think: "أبوك يحتاج مساعدتك الآن. فكّر مرة أخرى." },
    ],
  },
];

type NoticeState = { tone: "good" | "again" | "info"; text: string } | null;

export default function HonestGame({ soundOn = true }: { soundOn?: boolean }) {
  const { playCorrect, playWrong, playWin } = useGameSounds();
  const { supported, speaking, speakSequence, stop } = useArabicSpeech();
  const { celebrate } = useCelebration();
  const { earn } = useRewards();

  const [index, setIndex] = useState(0);
  const [run, setRun] = useState(0);
  const [tried, setTried] = useState<number[]>([]);
  const [solved, setSolved] = useState<number | null>(null);
  const [notice, setNotice] = useState<NoticeState>(null);
  const [gained, setGained] = useState<number | null>(null);

  const finished = gained !== null;
  const moment = MOMENTS[Math.min(index, MOMENTS.length - 1)];
  // shuffled once per moment (and per replay) so the good choice is not always in the same place
  const choices = useMemo(() => shuffleList(moment.choices), [moment, run]);

  const listen = () => {
    if (speaking) {
      stop();
      return;
    }
    speakSequence([moment.story, moment.question, ...choices.map((choice) => choice.text)]);
  };

  const choose = (choice: Choice, choiceIndex: number) => {
    if (solved !== null || tried.includes(choiceIndex)) return;
    if (!choice.good) {
      setTried((prev) => [...prev, choiceIndex]);
      setNotice({ tone: "again", text: choice.think ?? "فكّر مرة أخرى." });
      if (soundOn) playWrong();
      return;
    }
    setSolved(choiceIndex);
    setNotice({ tone: "good", text: choice.after ?? "اختيار جميل!" });
    if (soundOn) playCorrect();
  };

  const next = () => {
    stop();
    if (index + 1 < MOMENTS.length) {
      setIndex(index + 1);
      setTried([]);
      setSolved(null);
      setNotice(null);
      return;
    }
    if (soundOn) playWin();
    celebrate();
    const result = earn("game:honest", 10, "أنهيت لعبة ماذا يفعل الصادق؟");
    completeActivity("game:honest");
    setNotice(null);
    setGained(result.gained);
    setIndex(MOMENTS.length);
  };

  const restart = () => {
    stop();
    setIndex(0);
    setRun((value) => value + 1);
    setTried([]);
    setSolved(null);
    setNotice(null);
    setGained(null);
  };

  if (finished) {
    return (
      <div className="flex flex-col gap-4">
        <RoundBar icon="ri-heart-3-line" label="مواقف جميلة" round={MOMENTS.length} total={MOMENTS.length} done={MOMENTS.length} unit="الموقف" />
        <FinishCard
          title="قلبك طيّب!"
          text="اخترت التصرف الجميل في كل المواقف. القيم الحلوة تجعلنا نحب بعضنا."
          gained={gained ?? 0}
          onAgain={restart}
          character="jamool"
        >
          <ul className="flex flex-wrap items-center justify-center gap-2">
            {MOMENTS.map((item) => (
              <li
                key={item.value}
                className="inline-flex items-center gap-1.5 rounded-full bg-background-50 px-3 py-1.5 text-xs font-bold text-foreground-800"
              >
                <i className={`${item.valueIcon} text-leaf-600`} />
                {item.value}
              </li>
            ))}
          </ul>
        </FinishCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <RoundBar
        icon="ri-heart-3-line"
        label="مواقف جميلة"
        unit="الموقف"
        round={index + 1}
        total={MOMENTS.length}
        done={index + (solved !== null ? 1 : 0)}
      />

      <div key={index} className="animate-rise-in flex flex-col items-center gap-3 rounded-3xl bg-primary-50 px-4 pb-5 pt-5 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-background-50 px-3 py-1 text-xs font-bold text-leaf-800">
          <i className={moment.valueIcon} />
          قيمة اليوم: {moment.value}
        </span>

        <div className="relative flex h-24 w-32 items-center justify-center" aria-hidden="true">
          <span className={`flex h-20 w-20 items-center justify-center rounded-full text-4xl ${moment.sceneTone}`}>
            <i className={moment.scene[0]} />
          </span>
          <span className="absolute -end-1 -top-1 flex h-12 w-12 items-center justify-center rounded-full bg-background-50 text-2xl text-foreground-700 motion-safe:animate-floaty">
            <i className={moment.scene[1]} />
          </span>
        </div>

        <p className="max-w-sm text-base font-bold leading-relaxed text-foreground-900">{moment.story}</p>
        <h4 className="font-heading text-xl font-bold text-foreground-950">{moment.question}</h4>

        {supported ? (
          <button
            type="button"
            onClick={listen}
            aria-label={speaking ? "إيقاف الاستماع" : "استمع إلى الموقف والخيارات"}
            className="btn btn-primary btn-sm"
          >
            <i className={speaking ? "ri-stop-circle-line" : "ri-volume-up-line"} />
            {speaking ? "إيقاف" : "استمع"}
          </button>
        ) : null}
      </div>

      <ul className="flex flex-col gap-2.5" aria-label="الخيارات">
        {choices.map((choice) => {
          const originalIndex = moment.choices.indexOf(choice);
          const isSolved = solved === originalIndex;
          const wasTried = tried.includes(originalIndex);
          return (
            <li key={choice.text}>
              <button
                type="button"
                onClick={() => choose(choice, originalIndex)}
                disabled={solved !== null || wasTried}
                className={`flex min-h-14 w-full items-center gap-3 rounded-2xl px-4 py-3 text-start text-base font-bold leading-snug transition-colors duration-200 cursor-pointer disabled:cursor-default ${
                  isSolved
                    ? "bg-leaf-100 text-leaf-800"
                    : wasTried
                      ? "bg-background-100 text-foreground-400"
                      : solved !== null
                        ? "bg-background-100 text-foreground-400"
                        : "bg-background-100 text-foreground-800 hover:bg-background-200"
                } ${isSolved ? "xg-pop" : ""}`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl ${
                    isSolved ? "bg-leaf-500 text-white" : "bg-background-50 text-foreground-600"
                  }`}
                >
                  <i className={isSolved ? "ri-check-line" : choice.icon} />
                </span>
                <span className="flex-1">{choice.text}</span>
                {wasTried ? <i className="ri-lightbulb-flash-line text-lg text-primary-500" aria-hidden="true" /> : null}
              </button>
            </li>
          );
        })}
      </ul>

      <Notice tone={notice?.tone} text={notice?.text} />

      {solved !== null ? (
        <NextButton onClick={next}>
          {index + 1 < MOMENTS.length ? `الموقف ${toAr(index + 2)}` : "أنهِ اللعبة"}
        </NextButton>
      ) : null}
    </div>
  );
}
