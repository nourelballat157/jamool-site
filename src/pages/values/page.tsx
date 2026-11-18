import { Link } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import ModuleHero from "@/components/feature/ModuleHero";
import CategoryTile from "@/components/brand/CategoryTile";
import ProgressBar from "@/components/brand/ProgressBar";
import useScrollTop from "@/hooks/useScrollTop";
import { valueActivities } from "@/mocks/child";
import { values } from "@/mocks/home";
import useProgress from "@/store/progress";
import { getJourney, stepKey } from "@/data/valueJourneys";

export default function Values() {
  useScrollTop();
  const { isDone } = useProgress();

  return (
    <div className="flex min-h-screen flex-col bg-background-50">
      <Navbar />
      <main className="flex-1">
        <ModuleHero
          category="values"
          badge="حديقة القيم"
          badgeIcon="ri-plant-line"
          title="نزرع الخير في كل يوم"
          description="مع نور نزرع قيمة جميلة، ونجرّبها في يومنا، ونرى شجرتنا تكبر."
          actions={
            <a href="#garden" className="btn btn-primary btn-lg">
              <i className="ri-seedling-line text-xl" />
              هيا نزرع
            </a>
          }
        />

        <section className="relative w-full bg-background-50 py-10 md:py-14">
          <div className="mx-auto w-full max-w-5xl px-4 md:px-6">
            <div className="card flex flex-col items-center gap-4 bg-leaf-50 p-5 text-center md:flex-row md:p-6 md:text-start">
              <CategoryTile icon="ri-compass-3-line" tone="leaf" size="lg" />
              <div className="flex-1">
                <p className="font-heading text-lg font-bold text-foreground-900 md:text-xl">مرحبًا، أنا نور!</p>
                <p className="mt-1 max-w-2xl text-base leading-relaxed text-foreground-600">
                  أرافقك في الحديقة خطوة بخطوة، وأخبرك بما يمكنك فعله بعد ذلك، وأفرح معك بعد كل قيمة تتعلّمها.
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-leaf-100 px-4 py-1.5 text-xs font-bold text-leaf-700">
                <i className="ri-information-line" />
                مرشدة داخل الحديقة، وليست محادثة
              </span>
            </div>
          </div>
        </section>

        <section id="garden" className="w-full scroll-mt-20 bg-background-50 pb-12 md:pb-16">
          <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
            <div className="mb-8 text-center">
              <h2 className="font-heading text-2xl font-bold text-foreground-900 md:text-4xl">قيم نزرعها معًا</h2>
              <p className="mx-auto mt-2 max-w-xl text-base leading-relaxed text-foreground-600">
                اختر قيمة وابدأ رحلتها: ثلاث محطات وشجرة تزهر.
              </p>
            </div>

            <ul className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
              {values.map((value) => {
                const stations = getJourney(value.id)?.stations ?? [];
                const stage = stations.filter((station) => isDone(stepKey(value.id, station.id))).length;
                const bloomed = stage === stations.length && stations.length > 0;
                const pct = stations.length ? (stage / stations.length) * 100 : 0;
                return (
                  <li key={value.id}>
                    <Link
                      to={`/values/${value.id}`}
                      aria-label={`رحلة ${value.title}: ${stage} من ${stations.length} محطات`}
                      className="card group flex h-full flex-col overflow-hidden text-center transition-shadow duration-300 hover:shadow-[0_26px_44px_-22px_rgb(31_26_107/0.5)]"
                    >
                      <span className="relative block aspect-[4/3] w-full overflow-hidden bg-leaf-100">
                        <img src={`/img/values/${value.id}.webp`} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]" />
                        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent" />
                        <span aria-hidden="true" className={`absolute end-2 top-2 inline-flex h-10 w-10 items-center justify-center rounded-full text-xl shadow-md ${bloomed ? "bg-leaf-500 text-white" : "bg-white/95 text-leaf-700"}`}>
                          <i className={bloomed ? "ri-plant-fill" : value.icon} />
                        </span>
                      </span>
                      <h3 className="mt-4 px-4 font-heading text-lg font-bold text-foreground-900 md:text-xl">{value.title}</h3>
                      <p className="mt-1 px-4 text-sm leading-relaxed text-foreground-600">{value.desc}</p>
                      <div className="mt-auto w-full px-5 pt-4">
                        <ProgressBar value={pct} tone="leaf" label={`تقدّم رحلة ${value.title}`} height="h-2" />
                      </div>
                      <span className="mb-2 mt-2 inline-flex min-h-[2.75rem] items-center justify-center gap-1.5 text-sm font-bold text-leaf-700">
                        {stage === 0 ? "ابدأ الرحلة" : stage < stations.length ? "أكمل الرحلة" : "شجرة مزهرة"}
                        <i
                          className={`${bloomed ? "ri-plant-fill" : "ri-arrow-left-line"} transition-transform group-hover:-translate-x-0.5`}
                        />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section className="relative w-full bg-leaf-50 pb-14 md:pb-20">
          <div aria-hidden="true" className="najdi-zigzag hidden md:block" />
          <div className="mx-auto w-full max-w-5xl px-4 pt-12 md:px-6 md:pt-16">
            <div className="mb-8 text-center">
              <h2 className="font-heading text-2xl font-bold text-foreground-900 md:text-4xl">مهام نور اليومية</h2>
              <p className="mx-auto mt-2 max-w-xl text-base leading-relaxed text-foreground-600">
                مهمة صغيرة لكل قيمة، نجرّبها في يومنا ثم نخبر نور أننا أنجزناها.
              </p>
            </div>

            <ul className="card flex flex-col divide-y divide-leaf-100 overflow-hidden">
              {valueActivities.map((activity) => (
                <li key={activity.id} className="flex items-center gap-3 p-4 md:gap-4 md:p-5">
                  <CategoryTile icon={activity.icon} tone="leaf" />
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-base font-bold text-foreground-900">{activity.title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-foreground-600">{activity.desc}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-leaf-100 px-3 py-1 text-xs font-bold text-leaf-800">
                    {activity.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
