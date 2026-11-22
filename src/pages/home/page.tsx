import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import LoginRequiredModal from "@/components/feature/LoginRequiredModal";
import HeroSection from "@/pages/home/components/HeroSection";
import TrailSection from "@/pages/home/components/TrailSection";
import ContinueSection from "@/pages/home/components/ContinueSection";
import SuggestedSection from "@/pages/home/components/SuggestedSection";
import AchievementsSection from "@/pages/home/components/AchievementsSection";
import StoriesSection from "@/pages/home/components/StoriesSection";
import LearningSection from "@/pages/home/components/LearningSection";
import QuranSection from "@/pages/home/components/QuranSection";
import GamesSection from "@/pages/home/components/GamesSection";
import CreativitySection from "@/pages/home/components/CreativitySection";
import ZizoTeaser from "@/pages/home/components/ZizoTeaser";
import ValuesGardenSection from "@/pages/home/components/ValuesGardenSection";
import CompetitionsSection from "@/pages/home/components/CompetitionsSection";
import FriendsSection from "@/pages/home/components/FriendsSection";
import ParentsTrustSection from "@/pages/home/components/ParentsTrustSection";
import FinalCtaSection from "@/pages/home/components/FinalCtaSection";

export default function Home() {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const target = document.querySelector(location.hash);
      if (target) {
        const top = target.getBoundingClientRect().top + window.scrollY - 92;
        window.scrollTo({ top, behavior: "smooth" });
      }
    } else {
      window.scrollTo({ top: 0 });
    }
  }, [location]);

  const requireLogin = () => setLoginModalOpen(true);

  return (
    <div className="flex min-h-screen flex-col bg-background-50">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <TrailSection />
        <ContinueSection />
        <SuggestedSection />
        <AchievementsSection />
        <StoriesSection onRequireLogin={requireLogin} />
        <QuranSection />
        <LearningSection />
        <GamesSection />
        <CreativitySection />
        <ZizoTeaser />
        <ValuesGardenSection />
        <CompetitionsSection onRequireLogin={requireLogin} />
        <FriendsSection />
        <ParentsTrustSection />
        <FinalCtaSection />
      </main>
      <Footer />
      <LoginRequiredModal open={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </div>
  );
}
