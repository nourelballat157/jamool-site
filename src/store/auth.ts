import { useSyncExternalStore } from "react";
import { defaultPlanFor, planById, type Plan, type PlanId } from "@/data/plans";

/**
 * Parent / institution accounts, kept in this browser only (there is no server yet).
 * Passwords are never stored as text: each one is salted and hashed (PBKDF2-SHA256).
 * This is a front-end prototype of the account flow; real sign-in, verification codes
 * and cross-device sessions need a backend, and this module is the single place to swap.
 */

export type AccountKind = "parent" | "institution";

export type Account = {
  id: string;
  kind: AccountKind;
  /** parent: full name · institution: institution name */
  name: string;
  /** institution only: the person in charge */
  responsible?: string;
  mobile: string; // normalised digits
  email: string; // lower case
  salt: string;
  hash: string;
  planId: PlanId;
  createdAt: number;
};

const ACCOUNTS_KEY = "ajyal_accounts_v1";
const SESSION_KEY = "ajyal_session_v1";
const FAIL_KEY = "ajyal_login_fail_v1";

/* ------------------------------ helpers -------------------------------- */

const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const toLatin = (s: string) => s.replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)));

export const normalizeEmail = (s: string) => s.trim().toLowerCase();

/** 05xxxxxxxx, +9665xxxxxxxx, 009665xxxxxxxx and ٠٥٥... all become 5xxxxxxxx; other countries keep their digits */
export function normalizeMobile(s: string): string {
  let d = toLatin(s).replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("966")) d = d.slice(3);
  if (d.startsWith("0")) d = d.slice(1);
  return d;
}

export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim());
export const isMobile = (s: string) => /^\d{8,15}$/.test(normalizeMobile(s));

const bytesToHex = (b: ArrayBuffer | Uint8Array) =>
  Array.from(b instanceof Uint8Array ? b : new Uint8Array(b))
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");

async function hashPassword(password: string, saltHex: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = new Uint8Array(saltHex.match(/../g)!.map((h) => parseInt(h, 16)));
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 120000, hash: "SHA-256" }, key, 256);
  return bytesToHex(bits);
}

const newSalt = () => bytesToHex(crypto.getRandomValues(new Uint8Array(16)));

/* ------------------------------ storage -------------------------------- */

function readAccounts(): Account[] {
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY);
    const list = raw ? (JSON.parse(raw) as Account[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function writeAccounts(list: Account[]) {
  try {
    window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable */
  }
}

function readSessionId(): string | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY) ?? window.sessionStorage.getItem(SESSION_KEY);
    return raw ? ((JSON.parse(raw) as { accountId?: string }).accountId ?? null) : null;
  } catch {
    return null;
  }
}

let accounts: Account[] = typeof window === "undefined" ? [] : readAccounts();
let sessionId: string | null = typeof window === "undefined" ? null : readSessionId();
let snapshot: { account: Account | null } = { account: accounts.find((a) => a.id === sessionId) ?? null };
const listeners = new Set<() => void>();

function publish() {
  snapshot = { account: accounts.find((a) => a.id === sessionId) ?? null };
  listeners.forEach((l) => l());
}

function setSession(id: string | null, remember: boolean) {
  sessionId = id;
  try {
    window.localStorage.removeItem(SESSION_KEY);
    window.sessionStorage.removeItem(SESSION_KEY);
    if (id) (remember ? window.localStorage : window.sessionStorage).setItem(SESSION_KEY, JSON.stringify({ accountId: id }));
  } catch {
    /* ignore */
  }
  publish();
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === ACCOUNTS_KEY) accounts = readAccounts();
    if (e.key === ACCOUNTS_KEY || e.key === SESSION_KEY) {
      sessionId = readSessionId();
      publish();
    }
  });
}

export function subscribeAuth(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const getAccount = (): Account | null => snapshot.account;
export const currentAccountId = (): string | null => snapshot.account?.id ?? null;
export const planOfAccount = (a: Account | null): Plan => planById(a?.planId);

/* ------------------------------ register ------------------------------- */

export type AuthResult = { ok: true } | { ok: false; error: string; field?: string };

export type RegisterInput = {
  kind: AccountKind;
  /** parent: full name · institution: institution name */
  name: string;
  responsible?: string;
  mobile: string;
  email: string;
  password: string;
  confirm: string;
};

export const PASSWORD_HINT = "٨ أحرف على الأقل، وفيها حروف وأرقام.";
const passwordOk = (p: string) => p.length >= 8 && /[A-Za-z؀-ۿ]/.test(p) && /\d/.test(toLatin(p));

export async function registerAccount(input: RegisterInput): Promise<AuthResult> {
  const name = input.name.trim().replace(/\s+/g, " ");
  const responsible = (input.responsible ?? "").trim().replace(/\s+/g, " ");
  const email = normalizeEmail(input.email);
  const mobile = normalizeMobile(input.mobile);
  const inst = input.kind === "institution";

  if (name.length < 3) return { ok: false, field: "name", error: inst ? "اكتب اسم المؤسسة." : "اكتب الاسم الكامل." };
  if (inst && responsible.length < 3) return { ok: false, field: "responsible", error: "اكتب اسم المسؤول." };
  if (!isMobile(input.mobile)) return { ok: false, field: "mobile", error: "رقم الجوال غير صحيح." };
  if (!isEmail(email)) return { ok: false, field: "email", error: "البريد الإلكتروني غير صحيح." };
  if (!passwordOk(input.password)) return { ok: false, field: "password", error: `كلمة المرور ضعيفة: ${PASSWORD_HINT}` };
  if (input.password !== input.confirm) return { ok: false, field: "confirm", error: "تأكيد كلمة المرور غير مطابق." };

  accounts = readAccounts();
  if (accounts.some((a) => a.email === email)) return { ok: false, field: "email", error: "هذا البريد الإلكتروني مسجّل من قبل." };
  if (accounts.some((a) => a.mobile === mobile)) return { ok: false, field: "mobile", error: "رقم الجوال هذا مسجّل من قبل." };

  const salt = newSalt();
  const account: Account = {
    id: `acc${Date.now().toString(36)}${bytesToHex(crypto.getRandomValues(new Uint8Array(3)))}`,
    kind: input.kind,
    name,
    responsible: inst ? responsible : undefined,
    mobile,
    email,
    salt,
    hash: await hashPassword(input.password, salt),
    planId: defaultPlanFor(input.kind),
    createdAt: Date.now(),
  };
  accounts = [...accounts, account];
  writeAccounts(accounts);
  setSession(account.id, true);
  return { ok: true };
}

/* ------------------------------- login --------------------------------- */

type Fails = { count: number; until: number };
const readFails = (): Fails => {
  try {
    return JSON.parse(window.localStorage.getItem(FAIL_KEY) ?? "") as Fails;
  } catch {
    return { count: 0, until: 0 };
  }
};

function find(identifier: string): Account | undefined {
  const id = identifier.trim();
  accounts = readAccounts();
  return id.includes("@") ? accounts.find((a) => a.email === normalizeEmail(id)) : accounts.find((a) => a.mobile === normalizeMobile(id));
}

export async function loginAccount(identifier: string, password: string, remember: boolean): Promise<AuthResult> {
  if (!identifier.trim() || !password) return { ok: false, error: "أدخل البريد الإلكتروني أو رقم الجوال وكلمة المرور." };
  const fails = readFails();
  if (fails.until > Date.now()) {
    const secs = Math.ceil((fails.until - Date.now()) / 1000);
    return { ok: false, error: `محاولات كثيرة. جرّب بعد ${secs.toLocaleString("ar-EG")} ثانية.` };
  }
  const account = find(identifier);
  const ok = account ? (await hashPassword(password, account.salt)) === account.hash : false;
  if (!account || !ok) {
    const count = fails.until && fails.until <= Date.now() ? 1 : fails.count + 1;
    try {
      window.localStorage.setItem(FAIL_KEY, JSON.stringify({ count: count >= 5 ? 0 : count, until: count >= 5 ? Date.now() + 60000 : 0 }));
    } catch {
      /* ignore */
    }
    return { ok: false, error: "بيانات الدخول غير صحيحة." };
  }
  try {
    window.localStorage.removeItem(FAIL_KEY);
  } catch {
    /* ignore */
  }
  setSession(account.id, remember);
  return { ok: true };
}

/** the signed-in parent proves who they are again (for the dashboard while a child is playing) */
export async function verifyAccountPassword(password: string): Promise<boolean> {
  const a = getAccount();
  if (!a || !password) return false;
  return (await hashPassword(password, a.salt)) === a.hash;
}

export function logout() {
  setSession(null, false);
}

/* --------------------------- reset password ---------------------------- */

/**
 * Without a server we cannot send a code, so the account is verified with the OTHER contact detail it was
 * registered with (sign in by email → confirm the mobile number, and the other way round).
 */
export async function resetPassword(identifier: string, confirmWith: string, newPassword: string, confirm: string): Promise<AuthResult> {
  const account = find(identifier);
  const viaEmail = identifier.includes("@");
  const proven = account ? (viaEmail ? normalizeMobile(confirmWith) === account.mobile : normalizeEmail(confirmWith) === account.email) : false;
  if (!account || !proven) return { ok: false, error: "تعذّر التحقق من البيانات. تأكد من المعلومات وحاول مرة أخرى." };
  if (!passwordOk(newPassword)) return { ok: false, field: "password", error: `كلمة المرور ضعيفة: ${PASSWORD_HINT}` };
  if (newPassword !== confirm) return { ok: false, field: "confirm", error: "تأكيد كلمة المرور غير مطابق." };
  const salt = newSalt();
  const hash = await hashPassword(newPassword, salt);
  accounts = readAccounts().map((a) => (a.id === account.id ? { ...a, salt, hash } : a));
  writeAccounts(accounts);
  publish();
  return { ok: true };
}

/* ------------------------------- plan ---------------------------------- */

export function setPlan(planId: PlanId) {
  const id = currentAccountId();
  if (!id) return;
  accounts = readAccounts().map((a) => (a.id === id ? { ...a, planId } : a));
  writeAccounts(accounts);
  publish();
}

/* -------------------------------- hook --------------------------------- */

export default function useAuth() {
  const snap = useSyncExternalStore(subscribeAuth, () => snapshot, () => snapshot);
  return { account: snap.account, plan: planOfAccount(snap.account) };
}
