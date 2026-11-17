import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import Character from "@/components/brand/Character";
import useScrollTop from "@/hooks/useScrollTop";
import useProgress from "@/store/progress";
import { CelebrationProvider } from "@/pages/games/components/celebration";
import { allQuizzes, findQuiz } from "@/data/quizQuestions";
import QuizRunner from "./QuizRunner";
import QuizCard from "./QuizCard";
import "./quiz.css";

function BackLink() {
  return (
    <Link to="/competitions" className="btn btn-ghost btn-sm mb-5">
      <i className="ri-arrow-right-line" />
      العودة إلى المسابقات
    </Link>
  );
}

function PausedCard() {
  return (
    <div className="card qz-slide flex flex-col items-center p-8 text-center md:p-12">
      <Character name="thaloob" size="md" motion="still" decorative small />
      <h1 className="mt-4 font-heading text-2xl font-bold text-foreground-900 md:text-3xl">هذه المسابقات متوقفة الآن</h1>
      <p className="mt-2 max-w-md text-base leading-relaxed text-foreground-600">
        أوقف ولي الأمر المسابقات مؤقتًا. يمكنك اللعب والتعلّم في بقية العالم، وسنفتحها لك قريبًا.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link to="/competitions" className="btn btn-primary">
          <i className="ri-arrow-right-line" />
          العودة إلى المسابقات
        </Link>
        <Link to="/games" className="btn btn-ghost">
          <i className="ri-gamepad-line" />
          اذهب إلى الألعاب
        </Link>
      </div>
    </div>
  );
}

function Picker({ unknown }: { unknown: boolean }) {
  const list = useMemo(() => allQuizzes(), []);
  return (
    <div className="qz-slide">
      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-1.5 text-xs font-bold text-primary-800">
          <i className="ri-trophy-line" />
          مسابقات سريعة
        </span>
        <h1 className="mt-3 font-heading text-3xl font-bold text-foreground-900 md:text-[2.75rem]">اختر مسابقتك</h1>
        <p className="mx-auto mt-2 max-w-md text-base leading-relaxed text-foreground-600">
          {unknown
            ? "لم نجد هذه المسابقة، لكن عندنا مسابقات جميلة أخرى."
            : "ثماني أسئلة قصيرة في كل مسابقة، وتلعبها وحدك بهدوء."}
        </p>
      </div>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5">
        {list.map((quiz) => (
          <li key={quiz.id}>
            <QuizCard quiz={quiz} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function QuizPage() {
  useScrollTop();
  const [params] = useSearchParams();
  const { state } = useProgress();
  const enabled = state.settings.features.competitions;
  const id = params.get("id");
  const quiz = useMemo(() => findQuiz(id), [id]);

  return (
    <CelebrationProvider>
      <div className="flex min-h-screen flex-col bg-background-50">
        <Navbar />
        <main className="flex-1">
          <section className="w-full bg-primary-50 py-8 md:py-14">
            <div className="mx-auto w-full max-w-3xl px-4 md:px-6">
              <BackLink />
              {!enabled ? (
                <PausedCard />
              ) : quiz ? (
                <QuizRunner key={quiz.id} quiz={quiz} />
              ) : (
                <Picker unknown={Boolean(id)} />
              )}
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </CelebrationProvider>
  );
}
