import { Link } from "react-router-dom";
import Character from "@/components/brand/Character";
import type { childStories } from "@/mocks/child";
import HeartButton from "./HeartButton";
import HeroSwitch from "./HeroSwitch";
import { arDigits } from "./parse";

type ChildStory = (typeof childStories)[number];

type StoryCoverProps = {
  story: ChildStory;
  total: number;
  /** saved page (0-based) when the child stopped in the middle, otherwise 0 */
  savedPage: number;
  done: boolean;
  bestStars: number;
  isFav: boolean;
  onToggleFav: () => void;
  heroOn: boolean;
  onToggleHero: () => void;
  childName: string;
  childIsGirl?: boolean;
  canSpeak: boolean;
  onStart: (from: number, readAloud: boolean) => void;
};

export default function StoryCover({
  story,
  total,
  savedPage,
  done,
  bestStars,
  isFav,
  onToggleFav,
  heroOn,
  onToggleHero,
  childName,
  childIsGirl = false,
  canSpeak,
  onStart,
}: StoryCoverProps) {
  const resumable = savedPage >= 1 && savedPage <= total;

  return (
    <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
      <div className="card animate-rise-in relative overflow-hidden p-3 md:p-4">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-violet-50">
          <img
            src={story.image}
            alt={story.title}
            title={`${story.title} - قصة للأطفال`}
            className="h-full w-full object-cover"
          />
          <span className="absolute bottom-3 start-3 inline-flex items-center gap-2 rounded-full bg-background-50/95 px-4 py-1.5 text-xs font-bold text-violet-700">
            <i className="ri-book-open-line" />
            {arDigits(total)} صفحات ثم ٣ أسئلة
          </span>
        </div>
      </div>

      <div className="animate-rise-in">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
            <i className="ri-price-tag-3-line" />
            {story.tag}
          </span>
          {done ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-leaf-100 px-3 py-1 text-xs font-bold text-leaf-700">
              <i className="ri-checkbox-circle-fill" />
              أنهيتها
              <span className="flex items-center text-primary-500" role="img" aria-label={`${bestStars} من ٣ نجوم`}>
                {[1, 2, 3].map((n) => (
                  <i key={n} className={n <= bestStars ? "ri-star-fill" : "ri-star-line text-foreground-300"} />
                ))}
              </span>
            </span>
          ) : null}
        </div>

        <h1 className="mt-4 text-3xl font-bold md:text-[2.75rem]">{story.title}</h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-foreground-600 md:text-lg">{story.subtitle}</p>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-foreground-500">
          <span className="flex items-center gap-1.5">
            <i className="ri-user-smile-line text-base text-violet-600" />
            {story.age}
          </span>
          <span className="flex items-center gap-1.5">
            <i className="ri-time-line text-base text-violet-600" />
            {story.minutes}
          </span>
        </div>

        {resumable ? (
          <div className="card animate-rise-in mt-6 flex flex-col gap-3 bg-violet-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-100 text-2xl text-violet-700">
                <i className="ri-history-line" />
              </span>
              <div>
                <p className="font-heading text-base font-bold">أكمل من حيث توقفت</p>
                <p className="text-xs font-medium text-foreground-600">
                  وصلت إلى {savedPage >= total ? "نهاية القصة" : `الصفحة ${arDigits(savedPage + 1)} من ${arDigits(total)}`}
                </p>
              </div>
            </div>
            <button type="button" onClick={() => onStart(savedPage, false)} className="btn btn-primary btn-sm min-h-[2.75rem]">
              <i className="ri-play-circle-line" />
              أكمل القراءة
            </button>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onStart(0, false)}
            className={`btn btn-lg ${resumable ? "btn-ghost" : "btn-primary"}`}
          >
            <i className={resumable ? "ri-restart-line" : "ri-play-circle-line"} />
            {resumable ? "ابدأ من جديد" : "ابدأ القراءة"}
          </button>
          <button type="button" onClick={() => onStart(0, true)} disabled={!canSpeak} className="btn btn-secondary btn-lg">
            <i className="ri-volume-up-line" />
            اقرأ لي
          </button>
          <HeartButton active={isFav} onToggle={onToggleFav} />
        </div>

        {!canSpeak ? (
          <p className="mt-3 flex items-center gap-2 text-xs font-medium text-foreground-500">
            <i className="ri-information-line text-sky-600" />
            القراءة الصوتية غير متاحة في هذا المتصفح، لكن يمكنك قراءة القصة بنفسك.
          </p>
        ) : null}

        <div className="mt-6">
          <HeroSwitch on={heroOn} onToggle={onToggleHero} childName={childName} girl={childIsGirl} />
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Character name="jamool" size="sm" motion="wave" decorative className="shrink-0" />
          <p className="rounded-3xl bg-background-50 px-4 py-3 text-sm font-bold text-foreground-700 card">
            {childIsGirl ? "جاهزة للمغامرة؟ جمّول مستنيكِ!" : "جاهز للمغامرة؟ جمّول مستنيك!"}
          </p>
        </div>

        <Link
          to="/stories"
          className="mt-4 inline-flex min-h-[2.75rem] items-center gap-2 text-sm font-bold text-foreground-600 transition-colors hover:text-violet-700"
        >
          <i className="ri-arrow-right-line" />
          كل القصص
        </Link>
      </div>
    </div>
  );
}
