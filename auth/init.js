import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

export const supabase = createClient(
  "https://lesxabpwrsalywlnlpvp.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxlc3hhYnB3cnNhbHl3bG5scHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3NjI3MDIsImV4cCI6MjA3MDMzODcwMn0.VXUIZfsJdnGZW8V5NGkzS-Jykel7wDWqtbKlgYxEJDI"
);

const $ = (id) => document.getElementById(id);
const msg = (t = "") => {
  const m = $("auth-msg");
  if (m) m.textContent = t;
};
const busy = (on) =>
  ["signup", "signin", "logout"].forEach((id) => {
    const b = $(id);
    if (b) b.disabled = !!on;
  });

boot();

async function boot() {
  $("signup")?.addEventListener("click", onSignUp);
  $("signin")?.addEventListener("click", onSignIn);
  $("logout")?.addEventListener("click", onSignOut);
  $("auth-close")?.addEventListener("click", () =>
    $("auth-modal")?.removeAttribute("open")
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();
  render(session?.user || null);
  supabase.auth.onAuthStateChange((_e, s) => render(s?.user || null));
}

function render(user) {
  const signedIn = !!user;
  $("when-signed-in")?.toggleAttribute("hidden", !signedIn);
  $("when-signed-out")?.toggleAttribute("hidden", signedIn);
  const who = $("whoami");
  if (who)
    who.textContent = signedIn ? `Signed in as ${user.email}` : "Not signed in";
  if (signedIn) $("auth-modal")?.removeAttribute("open");
  msg("");
}

async function onSignUp() {
  msg("");
  busy(true);
  try {
    const email = $("email")?.value.trim();
    const password = $("password")?.value;
    if (!email || !password) throw new Error("Enter email and password.");
    if (password.length < 6)
      throw new Error("Password must be at least 6 characters.");

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    if (!data.user && !data.session) {
      msg("Check your email to confirm, then use Sign in.");
      alert("We sent a confirmation email. Open it to finish signup.");
    } else {
      render(data.user || null);
    }
  } catch (e) {
    const text = normalizeAuthError(e);
    console.error("signup error:", e);
    msg(text);
    alert(text);
  } finally {
    busy(false);
    const p = $("password");
    if (p) p.value = "";
  }
}

async function onSignIn() {
  msg("");
  busy(true);
  try {
    const email = $("email")?.value.trim();
    const password = $("password")?.value;
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    render(session?.user || null);
  } catch (e) {
    const text = normalizeAuthError(e);
    console.error("signin error:", e);
    msg(text);
    alert(text);
  } finally {
    busy(false);
  }
}

async function onSignOut() {
  await supabase.auth.signOut();
  render(null);
}

function normalizeAuthError(e) {
  const raw = (e?.message || String(e)).toLowerCase();
  if (raw.includes("already registered")) return "Account exists. Use Sign in.";
  if (raw.includes("captcha") || raw.includes("bot") || raw.includes("abuse"))
    return "Signup blocked by bot protection. Turn off Bot protection in Supabase while testing, or add Turnstile/recaptcha.";
  const m = raw.match(/after (\d+) seconds/);
  if (e?.status === 429 || m)
    return `Too many requests. Try again in ${m ? m[1] : 60}s.`;
  if (raw.includes("signups not allowed"))
    return "Signups are disabled in your Auth settings.";
  return e?.message || "Signup failed.";
}
