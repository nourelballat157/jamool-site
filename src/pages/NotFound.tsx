import { Link } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import Character from "@/components/brand/Character";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background-50">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="flex max-w-xl flex-col items-center text-center">
          <Character name="jamool" size="xl" motion="wave" />
          <p className="mt-6 font-heading text-6xl font-bold text-primary-500">٤٠٤</p>
          <h1 className="mt-2 font-heading text-3xl font-bold text-foreground-900">ضللنا الطريق قليلًا!</h1>
          <p className="mt-3 text-lg text-foreground-600">هذه الصفحة غير موجودة، لكن جمّول يعرف الطريق. تعال نرجع ونكتشف شيئًا جديدًا.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/" className="btn btn-primary btn-lg">
              <i className="ri-home-smile-line text-xl" />
              هيا نرجع
            </Link>
            <Link to="/explore" className="btn btn-ghost btn-lg">
              كل المغامرات
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}