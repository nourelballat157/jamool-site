import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import Home from "../pages/home/page";

/* Every page except the home page is its own chunk: the first visit downloads only what it shows. */
const loaders = {
  NotFound: () => import("../pages/NotFound"),
  Search: () => import("../pages/search/page"),
  Login: () => import("../pages/login/page"),
  ChildSelect: () => import("../pages/child-select/page"),
  Stories: () => import("../pages/stories/page"),
  Learning: () => import("../pages/learning/page"),
  Quran: () => import("../pages/quran/page"),
  Games: () => import("../pages/games/page"),
  Drawing: () => import("../pages/drawing/page"),
  Values: () => import("../pages/values/page"),
  Competitions: () => import("../pages/competitions/page"),
  ValueJourney: () => import("../pages/values/journey/page"),
  LetterJourney: () => import("../pages/learning/letter/page"),
  StoryReader: () => import("../pages/story/page"),
  QuizPage: () => import("../pages/competitions/quiz/page"),
  Room: () => import("../pages/room/page"),
  Parent: () => import("../pages/parent/page"),
  QuranSurah: () => import("../pages/quran/surah/page"),
  Explore: () => import("../pages/explore/page"),
  ZizoWorld: () => import("../pages/ai/page"),
  Legal: () => import("../pages/legal/page"),
};

const NotFound = lazy(loaders.NotFound);
const Search = lazy(loaders.Search);
const Login = lazy(loaders.Login);
const ChildSelect = lazy(loaders.ChildSelect);
const Stories = lazy(loaders.Stories);
const Learning = lazy(loaders.Learning);
const Quran = lazy(loaders.Quran);
const Games = lazy(loaders.Games);
const Drawing = lazy(loaders.Drawing);
const Values = lazy(loaders.Values);
const Competitions = lazy(loaders.Competitions);
const ValueJourney = lazy(loaders.ValueJourney);
const LetterJourney = lazy(loaders.LetterJourney);
const StoryReader = lazy(loaders.StoryReader);
const QuizPage = lazy(loaders.QuizPage);
const Room = lazy(loaders.Room);
const Parent = lazy(loaders.Parent);
const QuranSurah = lazy(loaders.QuranSurah);
const Explore = lazy(loaders.Explore);
const ZizoWorld = lazy(loaders.ZizoWorld);
const Privacy = lazy(() => loaders.Legal().then((m) => ({ default: m.Privacy })));
const Terms = lazy(() => loaders.Legal().then((m) => ({ default: m.Terms })));
const Contact = lazy(() => loaders.Legal().then((m) => ({ default: m.Contact })));

/** Warm the other pages' chunks once the browser is idle, so moving around feels instant. */
export function prefetchPages() {
  const run = () => {
    const first = [loaders.Quran, loaders.Stories, loaders.Games, loaders.Drawing, loaders.Learning, loaders.Values, loaders.Competitions, loaders.Room];
    first.forEach((load, i) => window.setTimeout(() => void load().catch(() => undefined), i * 400));
  };
  const idle = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void }).requestIdleCallback;
  if (idle) idle(run, { timeout: 6000 });
  else window.setTimeout(run, 4000);
}

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