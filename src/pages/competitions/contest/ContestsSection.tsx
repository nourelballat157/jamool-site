import { Link } from "react-router-dom";
import CategoryTile from "@/components/brand/CategoryTile";
import useContests, { summary } from "@/store/contests";
import { CONTESTS } from "@/data/contests";
import { arNum, dateLabel, roundProgress, timeLeft, useNow } from "./helpers";

/** "المسابقات المستمرة" on the competitions page: every contest with its open round, time left and how many joined */
export default function ContestsSection() {
  const saved = useContests();
  const now = useNow();

  return (
    <section id="contests" className="w-full scroll-mt-20 bg-background-100 py-10 md:py-14">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <div className="mb-6 text-center md:mb-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-1.5 font-heading text-sm font-bold text-primary-800">
            <i className="ri-infinity-line" aria-hidden="true" />
            مفتوحة دائمًا
          </span>
          <h2 className="mt-3 font-heading text-2xl font-bold text-foreground-900 md:text-4xl">المسابقات المستمرة</h2>
          <p className="mx-auto mt-2 max-w-xl text-base leading-relaxed text-foreground-600">شارك بإبداعك، وصوّت لما يعجبك، وتفوز المشاركة التي تنال أكثر الأصوات في نهاية كل جولة.</p>
        </div>

        <ul className="mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
          {CONTESTS.map((c) => {
            const s = summary(saved, c);
            return (
              <li key={c.id} className="card card-hover flex flex-col gap-4 p-5 md:p-6">
                <div className="flex items-start gap-4">
                  <CategoryTile icon={c.icon} tone="primary" size="lg" solid />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-primary-800">الجولة {arNum(s.round.number)}</p>
                    <h3 className="font-heading text-xl font-bold text-foreground-900 md:text-2xl">{c.title}</h3>
                    <p className="mt-1 text-sm font-medium leading-relaxed text-foreground-600">{c.tagline}</p>
                  </div>
                </div>

                <div>
                  <div className="h-2 overflow-hidden rounded-full bg-background-200" role="presentation">
                    <div className="h-full rounded-full bg-primary-500" style={{ width: `${roundProgress(s.round.start, s.round.end, now)}%` }} />
                  </div>
                  <p className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-foreground-600">
                    <span className="inline-flex items-center gap-1.5">
                      <i className="ri-hourglass-2-line text-primary-600" aria-hidden="true" />
                      {timeLeft(s.round.end, now)}
                    </span>
                    <span>تنتهي {dateLabel(s.round.end)}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <span className="rounded-2xl bg-background-50 px-3 py-2.5 ring-1 ring-background-200">
                    <span className="block font-heading text-xl font-bold text-foreground-900">{arNum(s.entries)}</span>
                    <span className="text-xs font-bold text-foreground-500">مشاركة</span>
                  </span>
                  <span className="rounded-2xl bg-background-50 px-3 py-2.5 ring-1 ring-background-200">
                    <span className="block font-heading text-xl font-bold text-foreground-900">{arNum(s.votes)}</span>
                    <span className="text-xs font-bold text-foreground-500">صوت</span>
                  </span>
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-3">
                  <Link to={`/competitions/contest/${c.id}#join`} className="btn btn-primary">
                    <i className="ri-send-plane-line" aria-hidden="true" />
                    شارك
                  </Link>
                  <Link to={`/competitions/contest/${c.id}#entries`} className="btn btn-ghost">
                    <i className="ri-heart-3-line" aria-hidden="true" />
                    شاهد وصوّت
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
