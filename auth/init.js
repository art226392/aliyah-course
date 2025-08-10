import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Initialize Supabase client
export const supabase = createClient(
  "https://lesxabpwrsalywlnlpvp.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxlc3hhYnB3cnNhbHl3bG5scHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3NjI3MDIsImV4cCI6MjA3MDMzODcwMn0.VXUIZfsJdnGZW8V5NGkzS-Jykel7wDWqtbKlgYxEJDI"
);

// Auth state management
let currentUser = null;

// Initialize auth modal and inject into page
export async function initAuth() {
  // Inject auth modal HTML
  injectAuthModal();

  // Setup event listeners
  setupEventListeners();

  // Check initial auth state
  const {
    data: { session },
  } = await supabase.auth.getSession();
  updateAuthUI(session?.user);

  // Listen for auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    updateAuthUI(session?.user);
    currentUser = session?.user;

    // Fire custom event for other parts of the app
    window.dispatchEvent(
      new CustomEvent("authStateChanged", {
        detail: { user: session?.user, event },
      })
    );
  });

  return currentUser;
}

// Inject auth modal HTML into the page
function injectAuthModal() {
  // Don't inject if already exists
  if (document.getElementById("auth-container")) return;

  const modalHTML = `
    <!-- Auth Status Bar -->
    <div class="auth-status" id="authStatus">
      <div class="user-avatar" id="userAvatar">U</div>
      <div class="user-info">
        <div class="user-email" id="userEmail">Not signed in</div>
        <div class="user-status">
          <span class="status-dot"></span>
          <span>Connected</span>
        </div>
      </div>
      <button class="sign-out-btn" id="signOutBtn">Sign Out</button>
    </div>

    <!-- Auth Trigger Button -->
    <button class="auth-trigger" id="authTrigger">Sign In</button>

    <!-- Authentication Modal -->
    <div class="auth-modal" id="authModal">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-logo">
            <img src="/cropped-ICEJ-Logo-Emblem_blue.png" alt="Logo" style="width: 40px; height: 40px; object-fit: contain;">
          </div>
          <h2 class="auth-title">Aliyah Course</h2>
          <p class="auth-subtitle">Sign in to save your progress</p>
        </div>

        <div class="auth-body">
          <div id="auth-views">
            <!-- Main Sign In/Up View -->
            <div id="main-auth-view" class="auth-view active">
              <div class="auth-tabs">
                <button class="auth-tab active" data-tab="signin">Sign In</button>
                <button class="auth-tab" data-tab="signup">Sign Up</button>
              </div>

              <!-- Sign In Form -->
              <form class="auth-form active" id="signinForm">
                <div class="form-group">
                  <label class="form-label" for="signin-email">Email Address</label>
                  <input type="email" id="signin-email" class="form-input" placeholder="you@example.com" required>
                </div>
                <div class="form-group">
                  <label class="form-label" for="signin-password">Password</label>
                  <div class="password-wrapper">
                    <input type="password" id="signin-password" class="form-input" placeholder="••••••••" required>
                    <button type="button" class="toggle-password" data-target="signin-password">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    </button>
                  </div>
                  <button type="button" class="auth-link" id="forgotPasswordLink">Forgot Password?</button>
                </div>
                <button type="submit" class="auth-submit" id="signinBtn">Sign In</button>
              </form>

              <!-- Sign Up Form -->
              <form class="auth-form" id="signupForm">
                <div class="form-group">
                  <label class="form-label" for="signup-email">Email Address</label>
                  <input type="email" id="signup-email" class="form-input" placeholder="you@example.com" required>
                </div>
                <div class="form-group">
                  <label class="form-label" for="signup-password">Password</label>
                  <div class="password-wrapper">
                    <input type="password" id="signup-password" class="form-input" placeholder="Min 6 characters" minlength="6" required>
                    <button type="button" class="toggle-password" data-target="signup-password">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label" for="signup-confirm">Confirm Password</label>
                  <div class="password-wrapper">
                    <input type="password" id="signup-confirm" class="form-input" placeholder="Re-enter password" minlength="6" required>
                    <button type="button" class="toggle-password" data-target="signup-confirm">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <button type="submit" class="auth-submit" id="signupBtn">Create Account</button>
              </form>
            </div>
            
            <!-- Forgot Password View -->
            <div id="forgot-password-view" class="auth-view">
              <h3 style="text-align: center; margin-top: 0; color: #334155;">Reset Password</h3>
              <p style="text-align: center; font-size: 0.9rem; color: #64748b; margin-bottom: 1.5rem;">Enter your email to receive a password reset link.</p>
              <form id="resetPasswordForm">
                <div class="form-group">
                  <label class="form-label" for="reset-email">Email Address</label>
                  <input type="email" id="reset-email" class="form-input" placeholder="you@example.com" required>
                </div>
                <button type="submit" class="auth-submit" id="resetBtn">Send Reset Link</button>
              </form>
              <div class="auth-footer" style="border-top: none; padding-top: 1rem;">
                <button type="button" class="auth-link" id="backToSignInLink">← Back to Sign In</button>
              </div>
            </div>
          </div>

          <!-- Message Display -->
          <div class="auth-message" id="authMessage"></div>

          <div class="auth-footer">
            <button class="auth-link" id="authClose">Continue without signing in</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Create container and inject
  const container = document.createElement("div");
  container.id = "auth-container";
  container.innerHTML = modalHTML;
  document.body.appendChild(container);
}

// Setup all event listeners
function setupEventListeners() {
  // Modal triggers
  document
    .getElementById("authTrigger")
    ?.addEventListener("click", showAuthModal);
  document
    .getElementById("authClose")
    ?.addEventListener("click", hideAuthModal);
  document
    .getElementById("signOutBtn")
    ?.addEventListener("click", handleSignOut);

  // Tab switching
  document.querySelectorAll(".auth-tab").forEach((tab) => {
    tab.addEventListener("click", (e) => switchTab(e.target.dataset.tab));
  });

  // Form submissions
  document
    .getElementById("signinForm")
    ?.addEventListener("submit", handleSignIn);
  document
    .getElementById("signupForm")
    ?.addEventListener("submit", handleSignUp);
  document
    .getElementById("resetPasswordForm")
    ?.addEventListener("submit", handlePasswordReset);

  // Password toggles
  document.querySelectorAll(".toggle-password").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const input = document.getElementById(e.currentTarget.dataset.target);
      input.type = input.type === "password" ? "text" : "password";
    });
  });

  // View switching for password reset
  document
    .getElementById("forgotPasswordLink")
    ?.addEventListener("click", showForgotPasswordView);
  document
    .getElementById("backToSignInLink")
    ?.addEventListener("click", showMainAuthView);

  // Close modal on background click
  document.getElementById("authModal")?.addEventListener("click", (e) => {
    if (e.target.id === "authModal") hideAuthModal();
  });

  // ESC key to close modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hideAuthModal();
  });
}

// Show auth modal
export function showAuthModal() {
  const modal = document.getElementById("authModal");
  if (modal) {
    modal.classList.add("show");
    // Focus first input
    setTimeout(() => {
      document.getElementById("signin-email")?.focus();
    }, 100);
  }
}

// Hide auth modal
export function hideAuthModal() {
  const modal = document.getElementById("authModal");
  if (modal) {
    modal.classList.remove("show");
    clearForms();
    hideMessage();
    // Reset to main view when closing
    setTimeout(showMainAuthView, 300);
  }
}

// Switch between tabs
function switchTab(tab) {
  // Update tab buttons
  document.querySelectorAll(".auth-tab").forEach((t) => {
    t.classList.toggle("active", t.dataset.tab === tab);
  });

  // Update forms
  document.querySelectorAll(".auth-form").forEach((f) => {
    f.classList.toggle("active", f.id === `${tab}Form`);
  });

  // Clear messages and focus first input
  hideMessage();
  setTimeout(() => {
    document.querySelector(".auth-form.active input")?.focus();
  }, 100);
}

// Show Forgot Password View
function showForgotPasswordView() {
  document.getElementById("main-auth-view")?.classList.remove("active");
  document.getElementById("forgot-password-view")?.classList.add("active");
  hideMessage();
}

// Show Main Auth View
function showMainAuthView() {
  document.getElementById("forgot-password-view")?.classList.remove("active");
  document.getElementById("main-auth-view")?.classList.add("active");
  hideMessage();
}

// Handle sign in
async function handleSignIn(e) {
  e.preventDefault();
  const btn = document.getElementById("signinBtn");

  setLoading(btn, true);
  hideMessage();

  try {
    const email = document.getElementById("signin-email").value.trim();
    const password = document.getElementById("signin-password").value;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    showMessage("Success! Redirecting...", "success");
    setTimeout(() => {
      hideAuthModal();
      updateCourseProgressUI(data.user);
    }, 1000);
  } catch (error) {
    console.error("Sign in error:", error);
    let message = error.message || "Failed to sign in";

    // Better error message handling
    if (
      message.includes("Invalid login credentials") ||
      message.includes("invalid") ||
      message.includes("credentials")
    ) {
      message = "Invalid email or password. Please try again.";
    } else if (message.includes("Email not confirmed")) {
      message =
        "Please check your email to confirm your account before signing in.";
    } else if (message.includes("User not found")) {
      message = "No account found with this email. Please sign up first.";
    }

    showMessage(message, "error");
  } finally {
    setLoading(btn, false);
  }
}

// Handle sign up
async function handleSignUp(e) {
  e.preventDefault();
  const btn = document.getElementById("signupBtn");

  // Validate passwords match
  const password = document.getElementById("signup-password").value;
  const confirm = document.getElementById("signup-confirm").value;

  if (password !== confirm) {
    showMessage("Passwords do not match", "error");
    return;
  }

  setLoading(btn, true);
  hideMessage();

  try {
    const email = document.getElementById("signup-email").value.trim();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user && !data.session) {
      showMessage("Check your email to confirm your account", "info");
      // Switch to sign in tab
      setTimeout(() => switchTab("signin"), 2000);
    } else if (data.user && data.session) {
      showMessage("Account created successfully!", "success");
      setTimeout(hideAuthModal, 1000);
    }
  } catch (error) {
    console.error("Sign up error:", error);
    let message = error.message || "Failed to create account";

    if (message.includes("already registered")) {
      message = "This email is already registered. Please sign in.";
      setTimeout(() => switchTab("signin"), 2000);
    } else if (message.includes("weak")) {
      message = "Password is too weak. Please use at least 6 characters.";
    }

    showMessage(message, "error");
  } finally {
    setLoading(btn, false);
  }
}

// Handle Password Reset
async function handlePasswordReset(e) {
  e.preventDefault();
  const btn = document.getElementById("resetBtn");
  setLoading(btn, true);
  hideMessage();

  try {
    const email = document.getElementById("reset-email").value.trim();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://aliyah-course.netlify.app/auth/callback.html",
    });

    if (error) throw error;
    showMessage(
      "If an account with this email exists, a password reset link has been sent.",
      "info"
    );
  } catch (error) {
    console.error("Password reset error:", error);
    showMessage(error.message || "Failed to send reset link.", "error");
  } finally {
    setLoading(btn, false);
  }
}

// Handle sign out
async function handleSignOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    showMessage("Signed out successfully", "success");
    updateAuthUI(null);

    // Optionally redirect to home
    if (
      window.location.pathname !== "/index.html" &&
      window.location.pathname !== "/"
    ) {
      setTimeout(() => {
        window.location.href = "/index.html";
      }, 1000);
    }
  } catch (error) {
    console.error("Sign out error:", error);
    showMessage("Failed to sign out", "error");
  }
}

// Update UI based on auth state
function updateAuthUI(user) {
  const authStatus = document.getElementById("authStatus");
  const authTrigger = document.getElementById("authTrigger");

  if (user) {
    // User is signed in
    if (authStatus) {
      authStatus.classList.add("show");
      document.getElementById("userEmail").textContent = user.email;
      const initial = user.email.charAt(0).toUpperCase();
      document.getElementById("userAvatar").textContent = initial;
    }
    if (authTrigger) authTrigger.classList.add("hidden");
    // Update progress UI
    updateCourseProgressUI(user);
  } else {
    // User is not signed in
    if (authStatus) authStatus.classList.remove("show");
    if (authTrigger) authTrigger.classList.remove("hidden");
    const progressContainer = document.getElementById(
      "courseProgressContainer"
    );
    if (progressContainer) progressContainer.style.display = "none";
  }

  currentUser = user;
}

// Update course progress UI
async function updateCourseProgressUI(user) {
  if (!user) return;

  const progressContainer = document.getElementById("courseProgressContainer");
  const progressBarInner = document.getElementById("master-progress-bar-inner");
  const progressText = document.getElementById("progress-text");
  const continueBtn = document.getElementById("continue-btn");

  if (
    !progressContainer ||
    !progressBarInner ||
    !progressText ||
    !continueBtn
  ) {
    return;
  }

  try {
    const progressData = await loadQuizProgress();
    const passedQuizzes = progressData.filter((p) => p.passed);
    const passedCount = passedQuizzes.length;

    const totalQuizzes = 4;
    const progressPercentage = (passedCount / totalQuizzes) * 100;

    progressBarInner.style.width = `${progressPercentage}%`;
    progressText.textContent = `${passedCount} / ${totalQuizzes} Quizzes Completed`;

    let lastPassedLecture = 0;
    if (passedCount > 0) {
      lastPassedLecture = Math.max(...passedQuizzes.map((p) => p.lecture));
    }

    let continueUrl = "index.html";
    let buttonText = "Start Course";

    if (lastPassedLecture > 0) {
      buttonText = "Continue Where You Left Off";
      if (lastPassedLecture >= totalQuizzes) {
        continueUrl = "lecture4.html";
        buttonText = "Review Final Lecture";
      } else {
        continueUrl = `lecture${lastPassedLecture + 1}.html`;
      }
    }

    continueBtn.href = continueUrl;
    continueBtn.textContent = buttonText;

    if (passedCount > 0) {
      continueBtn.style.display = "inline-block";
    } else {
      continueBtn.style.display = "none";
    }

    progressContainer.style.display = "block";
  } catch (error) {
    console.error("Failed to update course progress UI:", error);
    progressContainer.style.display = "none";
  }
}

// Show message
function showMessage(text, type = "info") {
  const msg = document.getElementById("authMessage");
  if (msg) {
    msg.textContent = text;
    msg.className = `auth-message show ${type}`;
  }
}

// Hide message
function hideMessage() {
  const msg = document.getElementById("authMessage");
  if (msg) {
    msg.className = "auth-message";
  }
}

// Set loading state
function setLoading(button, loading) {
  if (button) {
    button.disabled = loading;
    button.classList.toggle("loading", loading);
  }
}

// Clear all forms
function clearForms() {
  document.getElementById("signinForm")?.reset();
  document.getElementById("signupForm")?.reset();
  document.getElementById("resetPasswordForm")?.reset();
}

// Get current user
export function getCurrentUser() {
  return currentUser;
}

// Check if user is authenticated
export async function requireAuth() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    showAuthModal();
    return false;
  }
  return true;
}

// Save quiz progress (helper function)
export async function saveQuizProgress(lecture, score, passed) {
  const user = getCurrentUser();
  if (!user) {
    console.warn("No user logged in, progress not saved");
    return false;
  }

  try {
    const { error } = await supabase.from("quiz_progress").upsert({
      user_id: user.id,
      lecture: lecture,
      score: score,
      passed: passed,
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;

    // Also fire event for any listeners
    window.dispatchEvent(
      new CustomEvent("quizCompleted", {
        detail: { lecture, score, passed },
      })
    );

    return true;
  } catch (error) {
    console.error("Failed to save progress:", error);
    return false;
  }
}

// Load user's quiz progress
export async function loadQuizProgress() {
  const user = getCurrentUser();
  if (!user) return [];

  try {
    const { data, error } = await supabase
      .from("quiz_progress")
      .select("*")
      .eq("user_id", user.id)
      .order("lecture", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Failed to load progress:", error);
    return [];
  }
}

// Export to window for quiz pages
window.AliyahAuth = {
  saveQuizProgress,
  loadQuizProgress,
  getCurrentUser,
  requireAuth,
};

// Auto-initialize when module loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAuth);
} else {
  initAuth();
}
