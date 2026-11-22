/**
 * Packages (الباقات): how many child profiles an account can hold.
 *
 * PLACEHOLDER VALUES: the numbers below stand in until the real packages are decided.
 * Change them here only; the parent dashboard, the add-child form and the limit checks all read this file.
 * Creating an account never needs a paid package: every account starts on the free one.
 */

export type PlanId = "free" | "family" | "family-plus" | "institution";

export type Plan = {
  id: PlanId;
  name: string;
  /** child profiles allowed */
  maxChildren: number;
  /** who can choose it */
  for: "parent" | "institution";
  blurb: string;
  icon: string;
};

export const PLANS: Plan[] = [
  { id: "free", name: "الباقة المجانية", maxChildren: 1, for: "parent", blurb: "ابدأ بملف طفل واحد وجرّب كل مزايا البداية.", icon: "ri-seedling-line" },
  { id: "family", name: "باقة العائلة", maxChildren: 3, for: "parent", blurb: "حتى ثلاثة أطفال في حساب واحد.", icon: "ri-home-heart-line" },
  { id: "family-plus", name: "باقة العائلة الكبيرة", maxChildren: 5, for: "parent", blurb: "حتى خمسة أطفال في حساب واحد.", icon: "ri-group-line" },
  { id: "institution", name: "باقة المؤسسة", maxChildren: 30, for: "institution", blurb: "ملفات أطفال لمؤسستك التعليمية.", icon: "ri-school-line" },
];

export const planById = (id: PlanId | undefined): Plan => PLANS.find((p) => p.id === id) ?? PLANS[0];

/** the package a brand-new account starts on */
export const defaultPlanFor = (kind: "parent" | "institution"): PlanId => (kind === "institution" ? "institution" : "free");

/** "حتى طفل واحد" / "حتى ٣ أطفال" / "حتى ٣٠ طفلًا" */
export const limitLabel = (n: number): string =>
  n === 1 ? "حتى طفل واحد" : `حتى ${n.toLocaleString("ar-EG")} ${n <= 10 ? "أطفال" : "طفلًا"}`;
