import { BrowserRouter } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import { AppRoutes } from "@/router";
import i18n from "@/i18n";
import { SoundProvider } from "@/components/feature/SoundProvider";
import { RewardProvider } from "@/components/feature/RewardProvider";
import TimeGuard from "@/components/feature/TimeGuard";
import MotionLayer from "@/components/feature/MotionLayer";
import JamoolHelper from "@/components/feature/JamoolHelper";

function App() {
  return (
    <SoundProvider>
      <I18nextProvider i18n={i18n}>
        <BrowserRouter basename={__BASE_PATH__}>
          <RewardProvider>
            <AppRoutes />
            <MotionLayer />
            <JamoolHelper />
            <TimeGuard />
          </RewardProvider>
        </BrowserRouter>
      </I18nextProvider>
    </SoundProvider>
  );
}

export default App;
