import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import ModuleHero from "@/components/feature/ModuleHero";
import Character from "@/components/brand/Character";
import ProgressBar from "@/components/brand/ProgressBar";
import useScrollTop from "@/hooks/useScrollTop";
import { childStories, storyCategories } from "@/mocks/child";
import useProgress from "@/store/progress";
import { storyPageCount } from "@/data/storyPages";
import useFavorites from "@/pages/story/favorites";
import { arDigits } from "@/pages/story/components/parse";

const FILTER_BASE =
  "inline-flex min-h-[2.75rem] items-center gap-1.5 whitespace-nowrap rounded-full px-4 text-sm font-bold transition-colors cursor-pointer";

export default function Stories() {
  useScrollTop();
  const [category, setCategory] = useState("all");
  const [favOnly, setFavOnly] = useState(false);
  const { isFav, toggle: toggleFav } = useFavorites();
  const { data, isDone } = useProgress();

  const list = childStories
    .filter((s) => category === "all" || s.category === category)
    .filter((s) => !favOnly || isFav(s.id));

  const toggleFavOnly = () => {
    setFavOnly((value) => !value);
    document.getElementById("story-list")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background-50">
      <Navbar />
      <main className="flex-1">
        <ModuleHero
          category="stories"
          badge="عالم القصص"
          badgeIcon="ri-book-3-line"
          title="قصص تفتح أبواب الخيال"
          description="جمّول مستنيك مع حكايات قصيرة وممتعة عن الغابة والفضاء والبحر."
          actions={
            <>
              <a href="#story-list" className="btn btn-primary btn-lg">
                <i className="ri-play-circle-line" />
                ابدأ القراءة
              </a>
              <button
                type="button"
                onClick={toggleFavOnly}
                aria-pressed={favOnly}
                className={`btn btn-lg ${favOnly ? "btn-secondary" : "btn-ghost"}`}
              >
                <i className={favOnly ? "ri-heart-fill" : "ri-heart-line"} />
                قصصي المفضلة
              </button>
            </>
          }
        />

        <section id="story-list" className="w-full bg-background-50 py-10 md:py-14">
          <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
            <div className="mb-8 flex flex-wrap items-center gap-2">
              <span className="me-1 text-sm font-bold text-foreground-600">تصفّح حسب:</span>
              {storyCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  aria-pressed={category === cat.id}
                  className={`${FILTER_BASE} ${
                    category === cat.id
                      ? "bg-violet-600 text-background-50"
                      : "bg-violet-50 text-violet-800 hover:bg-violet-100"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setFavOnly((value) => !value)}
                aria-pressed={favOnly}
                className={`${FILTER_BASE} ${
                  favOnly ? "bg-violet-600 text-background-50" : "bg-violet-50 text-violet-800 hover:bg-violet-100"
                }`}
              >
                <i className={favOnly ? "ri-heart-fill" : "ri-heart-line"} />
                المفضلة
              </button>
            </div>

            {list.length === 0 ? (
              <div className="card mx-auto flex max-w-md flex-col items-center bg-violet-50 p-6 text-center md:p-8">
                <Character name="jamool" size="md" motion="float" decorative />
                <h3 className="mt-4 text-lg font-bold md:text-xl">
                  {favOnly ? "لم تضف قصصًا إلى المفضلة بعد" : "لا توجد قصص هنا الآن"}
                </h3>
                <p className="mt-1 text-base leading-relaxed text-foreground-600">
                  {favOnly
                    ? "اضغط على القلب في أي قصة لتجدها هنا بسهولة."
                    : "جرّب تصنيفًا آخر لتجد قصة جميلة."}
                </p>
                <div aria-hidden="true" className="najdi-zigzag mt-4 w-24 opacity-70" />
                <button
                  type="button"
                  onClick={() => {
                    setFavOnly(false);
                    setCategory("all");
                  }}
                  className="btn btn-primary mt-5"
                >
                  <i className="ri-book-open-line" />
                  اعرض كل القصص
                </button>
              </div>
            ) : null}

            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((story) => {
                const done = isDone(`story:${story.id}`);
                const starsEarned = data.marks[`story:${story.id}:stars`] ?? 1;
                const total = storyPageCount(story.id);
                const at = data.marks[`story:${story.id}:page`] ?? 0;
                const resuming = !done && at >= 1 && total > 0;
                const pct = Math.min(100, Math.round((at / (total + 1)) * 100));
                const fav = isFav(story.id);
                return (
                  <li key={story.id} className="flex">
                    <article className="card card-hover flex w-full flex-col gap-4 p-4 md:p-5">
                      <Link
                        to={`/stories/${story.id}`}
                        aria-label={story.title}
                        className="group block aspect-[4/3] overflow-hidden rounded-2xl bg-violet-50"
                      >
                        <img
                          src={story.image}
                          alt={story.title}
                          title={`${story.title} - قصة للأطفال`}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </Link>

                      <div className="flex flex-1 flex-col">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
                            <i className="ri-price-tag-3-line" />
                            {story.tag}
                          </span>
                          {done ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-leaf-100 px-3 py-1 text-xs font-bold text-leaf-700">
                              <i className="ri-checkbox-circle-fill" />
                              أنهيتها
                              <span
                                className="flex items-center text-primary-500"
                                role="img"
                                aria-label={`${starsEarned} من ٣ نجوم`}
                              >
                                {[1, 2, 3].map((n) => (
                                  <i
                                    key={n}
                                    className={n <= starsEarned ? "ri-star-fill" : "ri-star-line text-foreground-300"}
                                  />
                                ))}
                              </span>
                            </span>
                          ) : null}
                        </div>

                        <h2 className="mt-3 text-lg font-bold md:text-xl">{story.title}</h2>
                        <p className="mt-1 line-clamp-2 text-base leading-relaxed text-foreground-600">
                          {story.subtitle}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-medium text-foreground-500">
                          <span className="flex items-center gap-1.5">
                            <i className="ri-user-smile-line text-base text-violet-600" />
                            {story.age}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <i className="ri-time-line text-base text-violet-600" />
                            {story.minutes}
                          </span>
                        </div>

                        {resuming ? (
                          <div className="mt-3">
                            <p className="text-xs font-medium text-foreground-500">
                              {at >= total ? "وصلت إلى النهاية" : `الصفحة ${arDigits(at + 1)} من ${arDigits(total)}`}
                            </p>
                            <ProgressBar
                              value={pct}
                              tone="violet"
                              label={`تقدّمك في قصة ${story.title}`}
                              height="h-2"
                              className="mt-1.5"
                            />
                          </div>
                        ) : null}

                        <div className="mt-auto flex items-center gap-3 pt-4">
                          <Link to={`/stories/${story.id}`} className="btn btn-primary flex-1">
                            <i className="ri-book-open-line" />
                            {resuming ? "أكمل القراءة" : "اقرأ القصة"}
                          </Link>
                          <button
                            type="button"
                            onClick={() => toggleFav(story.id)}
                            aria-pressed={fav}
                            aria-label={fav ? "أزل من المفضلة" : "أضف إلى المفضلة"}
                            className={`btn-icon shrink-0 ${
                              fav
                                ? "!bg-violet-600 !text-background-50"
                                : "text-violet-600 hover:!bg-violet-100"
                            }`}
                          >
                            <i className={`text-xl ${fav ? "ri-heart-fill" : "ri-heart-line"}`} />
                          </button>
                        </div>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>

            <div className="card mx-auto mt-12 flex max-w-3xl flex-col items-center gap-4 bg-violet-50 p-5 text-center sm:flex-row sm:text-start md:p-6">
              <Character name="jamool" size="md" motion="wave" decorative className="shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-bold md:text-xl">جاهز للمغامرة؟</h3>
                <p className="mt-1 text-base leading-relaxed text-foreground-600">
                  اختر بطلك وادخل عالم القصص مع جمّول.
                </p>
              </div>
              <Link to="/child-select" className="btn btn-secondary">
                <i className="ri-rocket-2-line" />
                ادخل عالم القصص
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
