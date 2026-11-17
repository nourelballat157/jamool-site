import { Link } from "react-router-dom";
import Character from "@/components/brand/Character";
import CategoryTile from "@/components/brand/CategoryTile";
import type { childStories } from "@/mocks/child";

type ChildStory = (typeof childStories)[number];

type StoryResultProps = {
  story: ChildStory;
  stars: number;
  firstTime: boolean;
  points: number;
  childName: string;
  moral: string;
  moralIcon: string;
  suggestions: ChildStory[];
  onReread: () => void;
};

const MESSAGES = ["قراءة جميلة، وسنقرأ معا أكثر!", "أحسنت! فهمت القصة جيدا", "مذهل! قراءتك رائعة"];

export default function StoryResult({
  story,
  stars,
  firstTime,
  points,
  childName,
  moral,
  moralIcon,
  suggestions,
  onReread,
}: StoryResultProps) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="card relative overflow-hidden p-5 text-center sm:p-10">
        <Character name="jamool" size="lg" motion="cheer" decorative className="mx-auto" />

        <p className="mt-4 text-xs font-bold text-violet-700">أنهيت قصة «{story.title}»</p>
        <h2 className="mt-1 text-3xl font-bold md:text-[2.75rem]">أحسنت يا {childName}!</h2>

        <div className="mt-5 flex items-center justify-center gap-2" role="img" aria-label={`${stars} من ٣ نجوم`}>
          {[1, 2, 3].map((n) => (
            <i
              key={n}
              style={{ animationDelay: `${n * 0.22}s` }}
              className={`story-star text-5xl md:text-6xl ${
                n <= stars ? "ri-star-fill text-primary-500" : "ri-star-line text-background-400"
              }`}
            />
          ))}
        </div>
        <p className="mt-3 text-base font-medium text-foreground-600 md:text-lg">{MESSAGES[stars - 1]}</p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {firstTime ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-500 px-4 py-1.5 text-sm font-bold text-foreground-900">
              <i className="ri-star-fill" />
              ربحت {points} نقطة
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full bg-background-100 px-4 py-1.5 text-sm font-medium text-foreground-700">
              <i className="ri-checkbox-circle-fill text-leaf-600" />
              قرأت هذه القصة من قبل
            </span>
          )}
        </div>

        <div className="mx-auto mt-6 flex max-w-md items-center gap-3 rounded-3xl bg-violet-50 p-4 text-start">
          <CategoryTile icon={moralIcon} tone="violet" size="md" />
          <div>
            <p className="text-xs font-bold text-violet-700">ماذا تعلمنا؟</p>
            <p className="mt-0.5 text-base font-bold leading-relaxed text-foreground-800">{moral}</p>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link to="/stories" className="btn btn-primary">
            <i className="ri-book-3-line" />
            كل القصص
          </Link>
          <button type="button" onClick={onReread} className="btn btn-ghost">
            <i className="ri-restart-line" />
            اقرأها من جديد
          </button>
        </div>
      </div>

      {suggestions.length > 0 ? (
        <div className="mt-10">
          <h3 className="text-xl font-bold md:text-2xl">قصص قد تعجبك</h3>
          <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {suggestions.map((s) => (
              <li key={s.id}>
                <Link
                  to={`/stories/${s.id}`}
                  className="card card-hover group flex h-full flex-col gap-3 p-3 md:p-4"
                >
                  <span className="block aspect-[4/3] overflow-hidden rounded-2xl bg-violet-50">
                    <img
                      src={s.image}
                      alt={s.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </span>
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
                      <i className="ri-price-tag-3-line" />
                      {s.tag}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-foreground-500">
                      <i className="ri-user-smile-line text-base text-violet-600" />
                      {s.age}
                    </span>
                  </span>
                  <span className="flex items-center justify-between gap-3">
                    <span className="font-heading text-lg font-bold text-foreground-900">{s.title}</span>
                    <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-violet-700">
                      <i className="ri-book-open-line" />
                      اقرأ
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
