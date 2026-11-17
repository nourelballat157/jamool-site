import { Link } from "react-router-dom";
import CategoryTile from "@/components/brand/CategoryTile";
import useProgress from "@/store/progress";
import { QUIZ_BASE_POINTS, QUIZ_MAX_BONUS, QUIZ_SECONDS, type Quiz } from "@/data/quizQuestions";
import { toAr } from "./format";

/** A card for one quick quiz (activity card): shows only the child's own best, never a comparison. */
export default function QuizCard({ quiz }: { quiz: Quiz }) {
  const { data } = useProgress();
  const best = data.marks[`quiz:${quiz.id}:best`];
  const max = quiz.questions.length * (QUIZ_BASE_POINTS + QUIZ_MAX_BONUS);

  return (
    <Link
      to={`/competitions/quiz?id=${quiz.id}`}
      className="card card-hover group flex h-full items-start gap-4 p-5 md:p-6"
    >
      <CategoryTile icon={quiz.icon} tone="primary" size="lg" />
      <div className="min-w-0 flex-1">
        {quiz.daily ? (
          <span className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-primary-500 px-3 py-0.5 text-xs font-bold text-foreground-900">
            <i className="ri-sparkling-2-fill" />
            جديد اليوم
          </span>
        ) : null}
        <h3 className="font-heading text-lg font-bold text-foreground-900 md:text-xl">{quiz.title}</h3>
        <p className="mt-1 text-base leading-relaxed text-foreground-600">{quiz.desc}</p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-primary-800">
            <i className="ri-questionnaire-line" />
            {toAr(quiz.questions.length)} أسئلة
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-primary-800">
            <i className="ri-timer-line" />
            {toAr(QUIZ_SECONDS)} ثانية لكل سؤال
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {best ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background-100 px-3 py-1 text-xs font-bold text-foreground-800">
              <i className="ri-star-fill text-primary-500" />
              أفضل نتيجة لك: {toAr(best)} / {toAr(max)}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background-100 px-3 py-1 text-xs font-bold text-foreground-600">
              <i className="ri-flag-line" />
              لم تلعبها بعد
            </span>
          )}
          <span className="btn btn-primary btn-sm" aria-hidden="true">
            <i className="ri-play-fill" />
            {best ? "العب مجددًا" : "ابدأ"}
          </span>
        </div>
      </div>
    </Link>
  );
}
