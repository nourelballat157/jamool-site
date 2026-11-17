import { useSearchParams } from "react-router-dom";
import HeroGateway from "./HeroGateway";
import HeroPullback from "./HeroPullback";

/**
 * The home hero has two variants, kept side by side so either can be chosen in one line:
 *   "pullback"  the film: close-up of Jamool, camera pull-back, then the words (default)
 *   "gateway"   the previous hero, unchanged: Jamool in front of the glowing doorway
 * To compare without touching code, open the home page with ?hero=gateway or ?hero=pullback.
 */
const DEFAULT_VARIANT: "pullback" | "gateway" = "pullback";

export default function HeroSection() {
  const [params] = useSearchParams();
  const pick = params.get("hero");
  const variant = pick === "gateway" || pick === "pullback" ? pick : DEFAULT_VARIANT;
  return variant === "gateway" ? <HeroGateway /> : <HeroPullback />;
}