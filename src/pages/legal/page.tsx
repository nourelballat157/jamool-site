import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import PageBanner from "@/components/feature/PageBanner";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import Character from "@/components/brand/Character";
import { OwnerMark } from "@/components/brand/Logo";
import CategoryTile from "@/components/brand/CategoryTile";
import useScrollTop from "@/hooks/useScrollTop";

/** Calm, text-first page shell for the institutional pages (privacy, terms, contact). Parent mood: no motion, no decoration. */
function Shell({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: ReactNode }) {
  useScrollTop();
  return (
    <div className="flex min-h-screen flex-col bg-background-50">
      <Navbar />
      <main className="flex-1">
        <PageBanner eyebrow={eyebrow} eyebrowIcon="ri-shield-check-line" title={title} description={intro} narrow />
        <div className="mx-auto w-full max-w-4xl px-4 py-10 md:px-6 md:py-14">{children}</div>
      </main>
      <Footer />
    </div>
  );
}

function Block({ icon, title, children }: { icon: string; title: string; children: ReactNode }) {
  return (
    <section className="card mb-5 flex gap-4 p-5 md:p-6">
      <CategoryTile icon={icon} tone="accent" />
      <div className="min-w-0">
        <h2 className="font-heading text-lg font-bold text-foreground-900">{title}</h2>
        <div className="mt-2 space-y-2 text-base leading-relaxed text-foreground-600">{children}</div>
      </div>
    </section>
  );
}

const Draft = () => (
  <p className="mb-6 flex items-start gap-3 rounded-2xl bg-primary-100 p-4 text-sm leading-relaxed text-foreground-800">
    <i className="ri-information-line mt-0.5 text-xl text-primary-700" />
    هذا نص تعريفي بما تفعله المنصة فعلًا الآن. تُراجعه الجهة المالكة قانونيًا وتعتمده قبل الإطلاق الرسمي.
  </p>
);

export function Privacy() {
  return (
    <Shell eyebrow="الخصوصية" title="سياسة الخصوصية" intro="جمّول بُنيت لتكون آمنة للأطفال. إليك بوضوح ما نفعله وما لا نفعله.">
      <Draft />
      <Block icon="ri-lock-line" title="ما الذي نجمعه؟">
        <p>لا نطلب اسمًا حقيقيًا ولا صورة ولا بريدًا ولا رقم هاتف. الاسم الذي يختاره الطفل لنفسه (مثل «سارة») يبقى على جهازك.</p>
      </Block>
      <Block icon="ri-shield-check-line" title="أين يُحفظ التقدّم؟">
        <p>النقاط والشارات والرسومات وإعدادات ولي الأمر تُحفظ في متصفح هذا الجهاز فقط، ولا تُرسل إلى أي خادم. إذا مسحت بيانات المتصفح اختفى التقدّم.</p>
      </Block>
      <Block icon="ri-eye-off-line" title="لا إعلانات ولا تتبّع">
        <p>لا نعرض إعلانات، ولا نستخدم أدوات تتبّع تجاري، ولا نبيع أي معلومات.</p>
      </Block>
      <Block icon="ri-parent-line" title="دور ولي الأمر">
        <p>يستطيع ولي الأمر عبر «ركن أولياء الأمور» الاطّلاع على تقدّم الطفل وضبط الوقت اليومي. المشاركة في أي مسابقة رسمية تتطلب موافقة ولي الأمر.</p>
      </Block>
      <Block icon="ri-headphone-line" title="الصوت والميكروفون">
        <p>القراءة الصوتية تعمل بصوت المتصفح. البحث الصوتي اختياري ولا يبدأ إلا بطلب المستخدم وبإذن المتصفح.</p>
      </Block>
    </Shell>
  );
}

export function Terms() {
  return (
    <Shell eyebrow="الاستخدام" title="شروط الاستخدام" intro="قواعد بسيطة تجعل التجربة آمنة وممتعة للجميع.">
      <Draft />
      <Block icon="ri-user-smile-line" title="لمن هذه المنصة؟">
        <p>للأطفال من ٣ إلى ١٢ سنة، بصحبة أو علم أحد الوالدين. المحتوى تعليمي ترفيهي ولا يغني عن التعليم المدرسي.</p>
      </Block>
      <Block icon="ri-book-2-line" title="المحتوى">
        <p>القصص والرسومات والشخصيات ملك للجهة المالكة. لا يجوز نسخها أو إعادة نشرها تجاريًا دون إذن.</p>
        <p>النص القرآني يُعرض كما ورد في المصدر المعتمد دون تعديل، ويُراجع شرعيًا قبل الإطلاق.</p>
      </Block>
      <Block icon="ri-lightbulb-line" title="الأفكار التي يقترحها زيزو">
        <p>هي أفكار مكتوبة ومُراجَعة مسبقًا للتسلية والإلهام، وليست نصائح متخصصة.</p>
      </Block>
      <Block icon="ri-tools-line" title="التطوير المستمر">
        <p>قد نضيف أقسامًا أو نعدّل أخرى لتحسين التجربة، وسنحافظ دائمًا على بيئة هادئة بلا إعلانات.</p>
      </Block>
    </Shell>
  );
}

export function Contact() {
  return (
    <Shell eyebrow="تواصل معنا" title="يسعدنا سماع رأيك" intro="ملاحظات أولياء الأمور والمعلمين تساعدنا على جعل جمّول أفضل.">
      <section className="card mb-5 flex flex-col items-center gap-5 p-6 text-center sm:flex-row sm:text-start md:p-8">
        <OwnerMark className="h-24 shrink-0" />
        <div>
          <p className="font-heading text-sm font-semibold text-foreground-500">الجهة المالكة</p>
          <h2 className="font-heading text-xl font-bold text-foreground-900">الجمعية الأهلية الصالحية</h2>
          <p className="mt-1 text-foreground-600">عنيزة، المملكة العربية السعودية</p>
        </div>
      </section>
      <Block icon="ri-phone-line" title="قنوات التواصل">
        <p>لم تُضف قنوات التواصل الرسمية (الهاتف والبريد والعنوان) إلى هذه النسخة بعد. ستُنشر هنا بيانات الجمعية المعتمدة عند تزويدنا بها.</p>
      </Block>
      <Block icon="ri-mail-line" title="لماذا لا يوجد نموذج مراسلة؟">
        <p>حتى لا نجمع أي بيانات قبل اعتماد سياسة الخصوصية وربط المنصة بنظام مراسلة آمن.</p>
      </Block>
      <div className="mt-8 flex items-center gap-4">
        <Character name="noor" size="md" small />
        <p className="max-w-md text-foreground-600">
          في الأثناء، يمكنك الاطلاع على <Link to="/privacy" className="font-semibold text-sky-700 underline underline-offset-4">سياسة الخصوصية</Link> أو العودة إلى{" "}
          <Link to="/parent" className="font-semibold text-sky-700 underline underline-offset-4">ركن أولياء الأمور</Link>.
        </p>
      </div>
    </Shell>
  );
}
