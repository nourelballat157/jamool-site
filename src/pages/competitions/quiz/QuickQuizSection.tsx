import { useMemo } from "react";
import { allQuizzes } from "@/data/quizQuestions";
import QuizCard from "./QuizCard";

/** "مسابقات سريعة" section for the competitions page (saffron world, cream surface). */
export default function QuickQuizSection() {
  const list = useMemo(() => allQuizzes(), []);

  return (
    <section id="quick-quizzes" className="w-full bg-background-50 py-10 md:py-14">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <div className="mb-6 text-center md:mb-8">
          <h2 className="font-heading text-2xl font-bold text-foreground-900 md:text-4xl">مسابقات سريعة</h2>
          <p className="mx-auto mt-2 max-w-xl text-base leading-relaxed text-foreground-600">
            أسئلة قصيرة تلعبها وحدك في دقائق، ولكل سؤال ساعة صغيرة تعدّ الوقت بهدوء.
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
          {list.map((quiz) => (
            <li key={quiz.id}>
              <QuizCard quiz={quiz} />
            </li>
          ))}
        </ul>

        <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs font-medium text-foreground-500">
          <i className="ri-information-line text-primary-700" />
          هذه المسابقات لك وحدك — بلا لعب مباشر مع الآخرين وبلا مقارنة بين الأطفال.
        </p>
      </div>
    </section>
  );
}
