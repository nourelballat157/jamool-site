import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import Search from "../pages/search/page";
import Login from "../pages/login/page";
import ChildSelect from "../pages/child-select/page";
import Stories from "../pages/stories/page";
import Learning from "../pages/learning/page";
import Quran from "../pages/quran/page";
import Games from "../pages/games/page";
import Drawing from "../pages/drawing/page";
import Values from "../pages/values/page";
import Competitions from "../pages/competitions/page";
import ValueJourney from "../pages/values/journey/page";
import LetterJourney from "../pages/learning/letter/page";
import StoryReader from "../pages/story/page";
import QuizPage from "../pages/competitions/quiz/page";
import Room from "../pages/room/page";
import Parent from "../pages/parent/page";
import QuranSurah from "../pages/quran/surah/page";
import Explore from "../pages/explore/page";
import ZizoWorld from "../pages/ai/page";
import { Privacy, Terms, Contact } from "../pages/legal/page";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/stories",
    element: <Stories />,
  },
  {
    path: "/learning",
    element: <Learning />,
  },
  {
    path: "/quran",
    element: <Quran />,
  },
  {
    path: "/quran/:id",
    element: <QuranSurah />,
  },
  {
    path: "/games",
    element: <Games />,
  },
  {
    path: "/drawing",
    element: <Drawing />,
  },
  {
    path: "/values",
    element: <Values />,
  },
  {
    path: "/competitions",
    element: <Competitions />,
  },
  {
    path: "/competitions/quiz",
    element: <QuizPage />,
  },
  {
    path: "/stories/:id",
    element: <StoryReader />,
  },
  {
    path: "/learning/letter/:id",
    element: <LetterJourney />,
  },
  {
    path: "/values/:id",
    element: <ValueJourney />,
  },
  {
    path: "/room",
    element: <Room />,
  },
  {
    path: "/parent",
    element: <Parent />,
  },
  { path: "/explore", element: <Explore /> },
  { path: "/ai", element: <ZizoWorld /> },
  { path: "/privacy", element: <Privacy /> },
  { path: "/terms", element: <Terms /> },
  { path: "/contact", element: <Contact /> },
  {
    path: "/search",
    element: <Search />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/child-select",
    element: <ChildSelect />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;