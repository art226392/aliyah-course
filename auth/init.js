// art226392/aliyah-course/aliyah-course-4d60d583800ce72485da5384c5f0aad68d751d56/auth/init.js
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
    setTimeout(hideAuthModal, 1000);
  } catch (error) {
    console.error("Sign in error:", error);
    let message = error.message || "Failed to sign in";

    if (message.includes("Invalid login credentials")) {
      message = "Invalid email or password";
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
            redirectTo: 'https://aliyah-course.netlify.app/',
        });

        if (error) throw error;
        showMessage("If an account with this email exists, a password reset link has been sent.", "info");
    
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
    updateCourseProgressUI(user);
  } else {
    // User is not signed in
    if (authStatus) authStatus.classList.remove("show");
    if (authTrigger) authTrigger.classList.remove("hidden");
    const progressContainer = document.getElementById("courseProgressContainer");
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

  if (!progressContainer || !progressBarInner || !progressText || !continueBtn) {
    return;
  }

  try {
    const progressData = await loadQuizProgress();
    const passedQuizzes = progressData.filter(p => p.passed);
    const passedCount = passedQuizzes.length;

    const totalQuizzes = 4;
    const progressPercentage = (passedCount / totalQuizzes) * 100;

    progressBarInner.style.width = `${progressPercentage}%`;
    progressText.textContent = `${passedCount} / ${totalQuizzes} Quizzes Completed`;

    let lastPassedLecture = 0;
    if (passedCount > 0) {
      lastPassedLecture = Math.max(...passedQuizzes.map(p => p.lecture));
    }

    let continueUrl = "index.html";
    let buttonText = "Start Course";

    if (lastPassedLecture > 0) {
        buttonText = "Continue Where You Left Off";
        if (lastPassedLecture >= totalQuizzes) {
            continueUrl = 'lecture4.html';
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

// Auto-initialize when module loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAuth);
} else {
  initAuth();
}
```html
<!-- art226392/aliyah-course/aliyah-course-4d60d583800ce72485da5384c5f0aad68d751d56/index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Aliyah Course - Lecture 1</title>
    <link rel="preconnect" href="[https://fonts.googleapis.com](https://fonts.googleapis.com)" />
    <link rel="preconnect" href="[https://fonts.gstatic.com](https://fonts.gstatic.com)" crossorigin />
    <link
      href="[https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap](https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap)"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <canvas id="bg-canvas"></canvas>

    <div class="container">
      <header>
        <img
          src="cropped-ICEJ-Logo-Emblem_blue.png"
          alt="Course Logo"
          class="header-logo"
        />
        <h1>Aliyah Course</h1>
        <h2>Lecture 1: The Biblical and Historical Foundations</h2>
        <p class="author-credit">By Arthur Howard Flower Th.D.</p>
      </header>

      <main>
        <!-- Course Progress Container -->
        <div class="course-progress-container" id="courseProgressContainer" style="display: none;">
            <h3>Your Progress</h3>
            <div class="master-progress-bar">
                <div id="master-progress-bar-inner"></div>
            </div>
            <p id="progress-text">0/4 Quizzes Completed</p>
            <a href="index.html" id="continue-btn" class="nav-btn secondary" style="display: none;">Continue Where You Left Off</a>
        </div>

        <div class="lecture-text">
          <h3>INTRODUCTION</h3>

          <p>
            The return of the Jewish people to their ancestral homeland in
            Israel is a story that spans centuries, continents, and countless
            individual lives. It is a story a people and the land that God
            promised to them as an eternal inheritance. This course explores the
            biblical basis for aliyah, the historical and contemporary waves of
            Jewish immigration to Israel, and the prophetic significance of this
            ongoing ingathering.
          </p>

          <p>
            At the heart of this story is the Abrahamic Covenant, God's promise
            to bless Abraham and his descendants and to give them the land of
            Israel as an everlasting possession. This covenant is not
            conditional on the faithfulness or worthiness of the Jewish people,
            but rather on the unchanging character and purposes of God Himself.
            He is a God who keeps His promises, even when His people falter or
            stray.
          </p>

          <p>
            The return of the Jewish people to Israel, then, is not just a
            political or historical event, but a powerful demonstration of God's
            faithfulness and His sovereign plan for the redemption of the world.
            As the Apostle Paul wrote in Romans 11, the restoration of Israel is
            inextricably linked to the spiritual rebirth and blessing of the
            nations. When the Jewish people come home to Israel and turn their
            hearts back to God, it will be like "life from the dead" for the
            whole world.
          </p>

          <div class="video-container">
            <iframe
              src="[https://www.youtube.com/embed/UUW-xtkLOvw?rel=0](https://www.youtube.com/embed/UUW-xtkLOvw?rel=0)"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>

          <p>
            Throughout history, there have been glimpses and foretastes of this
            great ingathering, as waves of Jewish immigrants have returned to
            Israel from the four corners of the earth. From the early pioneers
            of the First Aliyah to the survivors of the Holocaust and the
            refugees of the modern era, each generation has played its part in
            the unfolding story of restoration and redemption.
          </p>

          <p>
            Christians have a unique and significant role to play in this story.
            They are called to be advocates, intercessors, and practical
            supporters of the Jewish people as they make their way home to
            Israel. This is done not out of a sense of duty or obligation, but
            out of a deep love and appreciation for the Jewish people as God's
            chosen ones, and out of a recognition of the spiritual debt that
            Gentiles owe them as being grafted into the covenant by faith.
          </p>

          <p>
            Over the past century, the world has witnessed the miraculous
            rebirth of the State of Israel and the ongoing return of the Jewish
            people to their homeland. This modern-day Aliyah is a sign of God's
            faithfulness to His ancient promises and a sign of His unfolding
            plan of redemption for Israel and the nations.
          </p>

          <p>
            This dissertation will explore the biblical and theological
            foundations of Aliyah, tracing the theme of the ingathering of the
            exiles throughout the Old and New Testaments. It will explore the
            historical and contemporary expressions of Aliyah, from the early
            pioneers who settled the land in the late 19th century to the waves
            of immigrants who have come from the four corners of the earth in
            recent decades.
          </p>

          <p>
            Attention will also be given to the unique challenges and
            opportunities that Aliyah presents for the State of Israel and the
            Jewish people, as well as the role of Christians in supporting and
            facilitating this ongoing return. The voices of key Christian
            leaders and organizations who have been at the forefront of Aliyah
            work will be highlighted, offering insights and inspiration for all
            who desire to align themselves with God's purposes for Israel.
          </p>

          <p>
            Ultimately, this dissertation aims to show that Aliyah is not a side
            issue, but a central part of God's redemptive plan for the world. As
            the Jewish people return to their homeland and their hearts turn
            back to their God, they are setting the stage for the climactic
            events of the last days, the coming of the Messiah, and the
            establishment of His kingdom on earth.
          </p>

          <p>
            May this work stir faith, deepen understanding, and inspire action
            in all who read it. May it contribute to the hastening of that great
            day when the words of the prophet Isaiah will be fulfilled: "The
            ransomed of the Lord shall return, and come to Zion with singing,
            with everlasting joy on their heads. They shall obtain joy and
            gladness, and sorrow and sighing shall flee away" (Isaiah 35:10).
          </p>
        </div>

        <div class="navigation-buttons">
          <a href="quiz1.html" class="nav-btn">Take Assessment for Lecture 1</a>
        </div>
      </main>
    </div>

    <!-- Background animations -->
    <script src="background.js"></script>

    <!-- Single auth import - this handles everything -->
    <script type="module" src="/auth/init.js"></script>
  </body>
</html>
```html
<!-- art226392/aliyah-course/aliyah-course-4d60d583800ce72485da5384c5f0aad68d751d56/lecture2.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Aliyah Course - Lecture 2</title>
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <!-- Unified Stylesheet -->
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <div class="container">
      <header>
        <img
          src="cropped-ICEJ-Logo-Emblem_blue.png"
          alt="Course Logo"
          class="header-logo"
        />
        <h1>Aliyah Course</h1>
        <h2>Lecture 2: God's Plan of Redemption through Israel</h2>
      </header>

      <main>
        <!-- Course Progress Container -->
        <div class="course-progress-container" id="courseProgressContainer" style="display: none;">
            <h3>Your Progress</h3>
            <div class="master-progress-bar">
                <div id="master-progress-bar-inner"></div>
            </div>
            <p id="progress-text">0/4 Quizzes Completed</p>
            <a href="index.html" id="continue-btn" class="nav-btn secondary" style="display: none;">Continue Where You Left Off</a>
        </div>
        <div class="lecture-text">
          <p>
            The Bible reveals that God's plan of redemption for humanity is
            inseparably linked to the history and destiny of Israel. From the
            Abrahamic Covenant to the prophetic promises of restoration, Israel
            plays a pivotal role in the unfolding of God's purposes for the
            world. To comprehend the significance of Aliyah, the return of the
            Jewish people to their homeland, it is essential to understand the
            broader biblical context of Israel's unique calling and mission.
          </p>

          <div class="video-container">
            <iframe
              src="https://www.youtube.com/embed/UzWfZo630gI?rel=0"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>

          <h3>The Abrahamic Covenant</h3>
          <p>
            The foundation of God's plan for Israel is rooted in His covenant
            with Abraham, as recorded in Genesis 12, 15, and 17. In this
            covenant, God makes three key promises to Abraham: land,
            descendants, and blessing. He pledges to give Abraham and his
            descendants the land of Canaan as an everlasting possession, to make
            his offspring as numerous as the stars in the sky, and to bless all
            the nations of the earth through his seed (Genesis 12:1-3, 15:18-21,
            17:1-8).
          </p>
          <p>
            These promises are unconditional and eternal, dependent not on
            Abraham's performance but on God's faithfulness. They are reaffirmed
            to Abraham's son Isaac and grandson Jacob, whose name is changed to
            Israel (Genesis 26:2-5, 28:13-15). The Abrahamic Covenant thus
            becomes the bedrock of God's dealings with the nation of Israel, and
            the lens through which we must interpret their subsequent history
            and prophetic destiny.
          </p>

          <h3>Israel's Role in God's Redemptive Plan</h3>
          <p>
            As the descendants of Abraham, Isaac, and Jacob, the nation of
            Israel is chosen by God to be a special people, set apart for His
            purposes. In Exodus 19:5-6, God declares, "Now therefore, if you
            will indeed obey My voice and keep My covenant, then you shall be a
            special treasure to Me above all people; for all the earth is Mine.
            And you shall be to Me a kingdom of priests and a holy nation."
          </p>
          <p>
            Israel's calling is to be a light to the nations, a living witness
            to the one true God in a world filled with idolatry and darkness
            (Isaiah 42:6, 49:6). Through their covenant relationship with God,
            their adherence to His laws, and their presence in the land of
            Canaan, they are to demonstrate His character and attract the
            nations to His ways (Deuteronomy 4:5-8).
          </p>
        </div>

        <div class="navigation-buttons">
          <a href="index.html" class="nav-btn secondary">← Previous Lesson</a>
          <a href="quiz2.html" class="nav-btn">Take Assessment for Lecture 2</a>
        </div>
      </main>
    </div>
     <!-- Single auth import - this handles everything -->
    <script type="module" src="/auth/init.js"></script>
  </body>
</html>
```html
<!-- art226392/aliyah-course/aliyah-course-4d60d583800ce72485da5384c5f0aad68d751d56/lecture3.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Aliyah Course - Lecture 3</title>
    <link rel="preconnect" href="[https://fonts.googleapis.com](https://fonts.googleapis.com)" />
    <link rel="preconnect" href="[https://fonts.gstatic.com](https://fonts.gstatic.com)" crossorigin />
    <link
      href="[https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap](https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap)"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <canvas id="bg-canvas"></canvas>
    <div class="container">
      <header>
        <img
          src="cropped-ICEJ-Logo-Emblem_blue.png"
          alt="Course Logo"
          class="header-logo"
        />
        <h1>Aliyah Course</h1>
        <h2>Lecture 3: The Prophetic Promises of the Return to Israel</h2>
      </header>

      <main>
        <!-- Course Progress Container -->
        <div class="course-progress-container" id="courseProgressContainer" style="display: none;">
            <h3>Your Progress</h3>
            <div class="master-progress-bar">
                <div id="master-progress-bar-inner"></div>
            </div>
            <p id="progress-text">0/4 Quizzes Completed</p>
            <a href="index.html" id="continue-btn" class="nav-btn secondary" style="display: none;">Continue Where You Left Off</a>
        </div>
        <div class="lecture-text">
          <p>
            The Old Testament is replete with prophetic promises concerning the
            return of the Jewish people to their homeland, the land of Israel.
            These prophecies, spanning multiple centuries and different
            historical contexts, reveal God's unwavering commitment to His
            covenant people and His plan to gather them from the nations and
            restore them to the land He promised to their forefathers.
          </p>

          <h3>Promises of Return in the Torah and Historical Books</h3>
          <p>
            The theme of Israel's return to their land can be traced back to the
            Torah, the first five books of the Bible. In Deuteronomy 30:1-5,
            Moses prophesies that even if the people of Israel are exiled to the
            farthest parts of the world due to their disobedience, God will
            bring them back and gather them again in the land He promised to
            their fathers. This passage establishes the pattern of dispersion
            and restoration that will characterize Israel's history.
          </p>
          <p>
            In the historical books, the promise of return is reiterated during
            times of exile and distress. When Solomon dedicates the Temple in 1
            Kings 8, he prays that if the people are carried away captive to the
            land of their enemies, God would hear their prayers and bring them
            back to the land He gave to their fathers (1 Kings 8:46-53). This
            prayer is a reminder that even in exile, Israel can trust in God's
            faithfulness to His covenant promises.
          </p>

          <h3>
            Promises of Return in the Major Prophets (Isaiah, Jeremiah, Ezekiel)
          </h3>
          <p>
            The major prophets, Isaiah, Jeremiah, and Ezekiel, contain some of
            the most vivid and compelling promises of Israel's return to their
            land. These prophecies were given during times of great upheaval and
            exile, offering hope and assurance to the people that God had not
            forgotten them and would ultimately restore them.
          </p>
          <p>
            In Isaiah 11:11-12, the prophet declares that the Lord will set His
            hand again the second time to recover the remnant of His people from
            the nations where they have been scattered. This prophecy speaks of
            a second regathering, distinct from the return from Babylonian
            exile, that will include Jewish people from the four corners of the
            earth. The imagery of God lifting a banner and assembling His people
            underscores the global scope of this future ingathering.
          </p>
          <p>
            Similarly, Jeremiah 16:14-15 speaks of a time when people will no
            longer refer to the God who brought Israel out of Egypt, but rather
            the God who brought them back from all the lands where He had driven
            them. This prophecy, set in the context of the Babylonian exile,
            points to a greater and more comprehensive restoration that will
            eclipse even the Exodus in its significance.
          </p>
          <p>
            Ezekiel, prophesying during the Babylonian exile, offers a powerful
            vision of Israel's restoration in the famous Valley of Dry Bones
            passage (Ezekiel 37:1-14). In this vision, the dry bones of Israel
            are brought back to life and assembled into a great army,
            symbolizing the national and spiritual resurrection of the Jewish
            people. God promises to bring them back to their land, put His
            Spirit within them, and establish an everlasting covenant of peace
            with them (Ezekiel 37:12-14, 26).
          </p>

          <h3>
            Promises of Return in the Minor Prophets (Amos, Zephaniah,
            Zechariah)
          </h3>
          <p>
            The minor prophets also contain significant promises of Israel's
            return and restoration. Amos 9:14-15, in the context of God's
            judgment on Israel, speaks of a future time when God will bring back
            the captives of His people, plant them in their land, and never
            again uproot them. This prophecy emphasizes the permanence and
            security of Israel's restoration.
          </p>
          <p>
            Zephaniah 3:19-20 describes how God will deal with Israel's
            oppressors and gather His people from the nations, giving them
            praise and fame in every land where they were put to shame. The
            prophet foresees a time when God will bring His people back to their
            homeland and restore their fortunes before their very eyes.
          </p>
          <p>
            Zechariah, prophesying after the return from Babylonian exile,
            speaks of an even greater ingathering in the future. In Zechariah
            8:7-8, God declares that He will save His people from the east and
            the west, bring them back, and settle them in the midst of
            Jerusalem. This prophecy anticipates a restoration that goes beyond
            the boundaries of ancient Babylon, encompassing Jewish communities
            from around the world.
          </p>

          <h3>Messianic Prophecies Related to Israel's Restoration</h3>
          <p>
            Many of the prophetic promises of Israel's return are interwoven
            with Messianic expectations and the establishment of God's kingdom
            on earth. Isaiah 11, which speaks of the second regathering of
            Israel, begins with a description of the Messianic King who will
            rule with righteousness and usher in a time of universal peace
            (Isaiah 11:1-10).
          </p>
          <p>
            Similarly, Jeremiah 23:5-8, in the context of promising to gather
            the remnant of God's flock and bring them back to their land, speaks
            of the righteous Branch of David who will reign as king and execute
            justice and righteousness in the earth. This Messianic King is
            identified as The LORD Our Righteousness, linking Israel's
            restoration with the coming of the Messiah.
          </p>
          <p>
            Ezekiel's vision of the dry bones also contains Messianic overtones,
            as God promises to set His sanctuary in the midst of His people
            forever and to have His servant David be their prince forever
            (Ezekiel 37:24-28). The restoration of Israel is thus connected with
            the establishment of the Messianic kingdom and the reign of the
            Messiah.
          </p>
          <p>
            The prophet Hosea also links Israel's restoration with the Messianic
            era. In Hosea 3:4-5, after describing a period when Israel will be
            without a king or prince, the prophet declares that afterward, the
            children of Israel will return and seek the Lord their God and David
            their king.
          </p>
          <p>
            The New Testament affirms that these Messianic prophecies find their
            ultimate fulfillment in Jesus Christ. Matthew 1:1 identifies Jesus
            as the son of David and the son of Abraham, connecting Him with the
            Messianic promises and the Abrahamic covenant. In Luke 1:54-55,
            68-75, Mary and Zechariah praise God for remembering His covenant
            with Abraham and raising up a horn of salvation in the house of
            David.
          </p>

          <h3>
            The Significance of Prophetic Promises for Understanding Aliyah
          </h3>
          <p>
            The prophetic promises of Israel's return to their land provide the
            biblical foundation for understanding the significance of Aliyah,
            the modern-day return of Jewish people to Israel. These prophecies
            demonstrate that the ingathering of the Jewish people is not merely
            a political or historical event, but a fulfillment of God's covenant
            promises and a sign of His ongoing faithfulness to His chosen
            people.
          </p>
          <p>
            As Christians, recognizing the prophetic significance of Aliyah
            should inspire us to support and pray for Israel, especially
            considering the ongoing return of Jewish people from around the
            world. We can have confidence that God is orchestrating world events
            to fulfill His promises and that the modern-day Aliyah is a
            precursor to the spiritual restoration of Israel and the ultimate
            establishment of the Messianic kingdom.
          </p>
          <p>
            Moreover, understanding the prophetic promises of Israel's return
            helps us to appreciate the unique role of Israel in God's redemptive
            plan. The restoration of Israel is not an end but is intricately
            connected with the blessing of the nations and the establishment of
            God's kingdom on earth. As Paul explains in Romans 11, the
            acceptance of Israel will lead to life from the dead and riches for
            the world (Romans 11:12, 15).
          </p>
          <p>
            In light of these prophetic promises, Christians are called to stand
            with Israel, pray for the peace of Jerusalem (Psalm 122:6), and
            support the work of Aliyah as God gathers His people from the ends
            of the earth. We can do so with the assurance that God is faithful
            to His promises and that the restoration of Israel is a central part
            of His redemptive plan for the world.
          </p>
          <p>
            Furthermore, the prophetic promises of Israel's return serve as a
            reminder of God's sovereignty and His ability to fulfill His
            purposes despite the obstacles and challenges that may arise.
            Throughout history, the Jewish people have faced numerous trials and
            persecutions, yet God has preserved them and is bringing them back
            to their land in fulfillment of His word.
          </p>
          <p>
            This understanding should give us hope and confidence in God's
            faithfulness, not only for Israel but for our own lives as well.
            Just as God is faithful to His promises to Israel, He is faithful to
            His promises to us as believers in Jesus Christ. We can trust that
            He will complete the work He has begun in us (Philippians 1:6) and
            that He will fulfill every purpose He has for our lives.
          </p>

          <p>
            The prophetic promises of Israel's return to their land are a
            central theme in the Old Testament, revealing God's unwavering
            commitment to His covenant people and His plan to gather them from
            the nations and restore them to the land He promised to their
            forefathers. These prophecies, found in the Torah, historical books,
            and the writings of the major and minor prophets, offer hope and
            assurance to the Jewish people that God has not forgotten them and
            will ultimately bring them back to their homeland.
          </p>
          <p>
            The prophetic promises are interwoven with Messianic expectations,
            linking Israel's restoration with the coming of the Messiah and the
            establishment of His kingdom on earth. The New Testament affirms
            that these Messianic prophecies find their ultimate fulfillment in
            Jesus Christ, who is the embodiment of God's promises to Israel.
          </p>
          <p>
            For Christians, understanding the prophetic significance of Israel's
            return provides the biblical foundation for recognizing the
            importance of Aliyah, the modern-day ingathering of the Jewish
            people to Israel. We are called to support and pray for Israel as
            God fulfills His promises and to recognize the unique role of Israel
            in His redemptive plan for the world.
          </p>
          <p>
            As we witness the ongoing return of Jewish people to their land, we
            can have confidence that God is orchestrating world events to
            fulfill His purposes and that the restoration of Israel is a central
            part of His plan. May we, as believers in Jesus Christ, stand with
            Israel and pray for the fulfillment of God's promises, eagerly
            anticipating the day when the Messiah will reign from Jerusalem and
            the nations will be blessed through the faithful obedience of God's
            chosen people.
          </p>

          <div class="video-container">
            <iframe
              src="[https://www.youtube.com/embed/l0x8abNUc0I?rel=0](https://www.youtube.com/embed/l0x8abNUc0I?rel=0)"
              title="Lecture 3 Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
        </div>

        <div class="navigation-buttons">
          <a href="quiz3.html" class="nav-btn">Take Assessment for Lecture 3</a>
          <a href="lecture2.html" class="nav-btn secondary"
            >Back to Lecture 2</a
          >
        </div>
      </main>
    </div>
    <script src="background.js"></script>
     <!-- Single auth import - this handles everything -->
    <script type="module" src="/auth/init.js"></script>
  </body>
</html>
```html
<!-- art226392/aliyah-course/aliyah-course-4d60d583800ce72485da5384c5f0aad68d751d56/lecture4.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Aliyah Course - Lecture 4</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <canvas id="bg-canvas"></canvas>

    <div class="container">
      <header>
        <img
          src="cropped-ICEJ-Logo-Emblem_blue.png"
          alt="Course Logo"
          class="header-logo"
        />
        <div class="header-text">
          <h1>Lecture 4: Aliyah and the Messianic Kingdom</h1>
          <h2>How the gathering of the Jewish people ties to the reign of the Messiah</h2>
        </div>
      </header>

      <main>
        <!-- Course Progress Container -->
        <div class="course-progress-container" id="courseProgressContainer" style="display: none;">
            <h3>Your Progress</h3>
            <div class="master-progress-bar">
                <div id="master-progress-bar-inner"></div>
            </div>
            <p id="progress-text">0/4 Quizzes Completed</p>
            <a href="index.html" id="continue-btn" class="nav-btn secondary" style="display: none;">Continue Where You Left Off</a>
        </div>
        <div class="glass-card">
          <div class="lecture-text">
            <p>
              The concept of Aliyah, the return of the Jewish people to their homeland in Israel, is closely linked with the biblical promise of the Messianic Kingdom. The prophets repeatedly connect the ingathering of exiles with the arrival of the Messiah and the establishment of His rule on earth. This shows the spiritual meaning of Aliyah within God’s plan for Israel and the nations.
            </p>

            <h3>The Role of Aliyah in the Establishment of the Messianic Kingdom</h3>
            <p>
              The prophetic picture of the Messianic Age includes the scattered people of Israel gathered back to their land under the rule of the Messiah. In Ezekiel 37 God promises to bring His people home and breathe new life into them (37:12–14). This restoration sits alongside an everlasting covenant of peace and the promise of God’s sanctuary among His people forever (37:26–28).
            </p>
            <p>
              Jeremiah 23:5–8 speaks of a righteous Branch from David who will reign as king with justice and righteousness. During His reign Judah will be saved and Israel will dwell in safety. The passage says that future generations will speak not of the Exodus from Egypt, but of God bringing His people back from every country where they were driven.
            </p>
            <p>
              These passages show that the regathering of Israel is part of the foundation for the Messianic Kingdom. The Messiah will rule a restored and united Israel dwelling securely in their land. Aliyah is not only historical or political; it sits inside God’s promises about the Messiah.
            </p>

            <h3>The Regathering of Israel in the Messianic Age</h3>
            <p>
              Isaiah 11:11–12 speaks of a second, worldwide regathering in which the Lord brings back the remnant of His people from distant places across the earth. Amos 9:14–15 promises that once planted in their land, they will not be uprooted again. Zechariah 8:7–8 describes God bringing His people from east and west to dwell in Jerusalem, with His presence among them.
            </p>
            <p>
              The New Testament keeps these promises in view. In Matthew 24:31 Jesus says the Son of Man will send His angels to gather His elect from the four winds at His return.
            </p>

            <h3>The Spiritual Restoration of Israel</h3>
            <p>
              The regathering is tied to inner renewal. Jeremiah 31:31–34 promises a new covenant with the law written on the heart and forgiveness of sins. Ezekiel 36:24–28 speaks of gathering from the nations, cleansing, a new heart and spirit, and God’s Spirit placed within His people so they walk in His ways.
            </p>
            <p>
              The New Testament explains that this renewal comes through the Messiah. Romans 11:25–27 says Israel’s present hardening is temporary until the fullness of the Gentiles comes in, and then all Israel will be saved as the Deliverer turns away ungodliness from Jacob.
            </p>

            <h3>The Impact on the Nations</h3>
            <p>
              Israel’s restoration has worldwide effects. Isaiah 2:2–4 pictures many nations streaming to learn God’s ways, ending war. Isaiah 60 describes a renewed Jerusalem shining so that nations and leaders come, bringing their resources. Zechariah 8:20–23 envisions people from many languages seeking the Lord in Jerusalem, eager to accompany a Jewish man because “God is with you.”
            </p>
            <p>
              The restoration of Israel is a means for blessing the nations and extending God’s rule on earth. As the Jewish people return and are renewed, they fulfill their calling to be a light to the nations.
            </p>

            <p>
              Seeing the link between Aliyah and the Messianic Kingdom encourages Christians to pray for and support the return of the Jewish people. God is faithful to His promises, and modern Aliyah signals that His purposes are advancing.
            </p>

            <div class="video-container">
              <iframe
                src="https://www.youtube.com/embed/2sjRuuueMH4?rel=0"
                title="Lecture 4 Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            </div>
          </div>

          <div class="navigation-buttons">
            <a href="quiz4.html" class="nav-btn">Take Assessment for Lecture 4</a>
            <a href="lecture3.html" class="nav-btn secondary">Back to Lecture 3</a>
          </div>
        </div>
      </main>
    </div>

    <script src="background.js"></script>
     <!-- Single auth import - this handles everything -->
    <script type="module" src="/auth/init.js"></script>
  </body>
</html>
```css
/* art226392/aliyah-course/aliyah-course-4d60d583800ce72485da5384c5f0aad68d751d56/style.css */
/*
==================================================
Unified Stylesheet for Aliyah Online Course - Light Theme
==================================================
*/

:root {
  --bg-accent-1: rgba(216, 232, 255, 0.45);
  --bg-accent-2: rgba(240, 248, 255, 0.85);
  --bg-accent-3: rgba(208, 224, 255, 0.35);

  /* Light sky-tinted base */
  --bg-color: #f7fbff;
  --card-bg: rgba(255, 255, 255, 0.85);
  --border-color: #dee2e6;
  --text-color: #111827;
  --text-muted: #6b7280;

  /* Modern primary palette */
  --primary-color: #2563eb; /* Indigo-500 */
  --primary-hover: #1d4ed8; /* Indigo-600 */
  --primary-pressed: #1e40af; /* Indigo-700 */

  --correct-color: #10b981;
  --incorrect-color: #ef4444;
  --shadow-color: rgba(2, 6, 23, 0.08);

  /* Button gradients */
  --btn-grad-start: #3b82f6;
  --btn-grad-end: #2563eb;
  --btn-glow: rgba(37, 99, 235, 0.35);
}

body {
  font-family: "Poppins", sans-serif;
  background-color: var(--bg-color);
  /* Fallback subtle sky gradient under the animated canvas */
  background-image: radial-gradient(
      1200px 800px at 20% 0%,
      var(--bg-accent-1),
      rgba(255, 255, 255, 0)
    ),
    radial-gradient(
      800px 600px at 90% 10%,
      var(--bg-accent-3),
      rgba(255, 255, 255, 0)
    ),
    linear-gradient(180deg, #f7fbff 0%, #ffffff 100%);
  background-attachment: fixed;
  color: var(--text-color);
  margin: 0;
  padding: 2rem;
  line-height: 1.7;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  overflow-x: hidden;
}

/* Animated Background Canvas */
#bg-canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  opacity: 0.6;
  pointer-events: none;
}

/* Main Content Container */
.container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 900px;
  background: var(--card-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  padding: 2.5rem;
  box-shadow: 0 20px 60px var(--shadow-color);
  animation: fadeIn 0.9s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Header & Typography */
header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.header-logo {
  width: 84px;
  height: auto;
  margin-bottom: 1.25rem;
  filter: drop-shadow(0 8px 24px rgba(2, 6, 23, 0.1));
}

header h1 {
  font-size: clamp(2.5rem, 5vw, 3.25rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0;
  color: var(--text-color);
}

header h2 {
  font-size: 1.15rem;
  font-weight: 500;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.author-credit {
  font-size: 1rem;
  font-style: italic;
  color: var(--text-muted);
  margin-top: 0.5rem;
}

/* Lecture */
.lecture-text p {
  font-size: 1.06rem;
  margin-bottom: 1.35rem;
  color: #1f2937;
}

.lecture-text h3 {
  font-size: 1.55rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-top: 2.25rem;
  margin-bottom: 1rem;
  letter-spacing: -0.01em;
}

.video-container {
  margin: 2.25rem 0;
  border-radius: 14px;
  overflow: hidden;
  position: relative;
  border: 1px solid var(--border-color);
  box-shadow: 0 12px 30px rgba(2, 6, 23, 0.06);
}

.video-container iframe {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  border: none;
}

/* Navigation Buttons – modern, glassy, elevated */
.navigation-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

.nav-btn {
  display: inline-block;
  position: relative;
  background: linear-gradient(
    180deg,
    var(--btn-grad-start),
    var(--btn-grad-end)
  );
  color: #fff;
  padding: 0.95rem 2.5rem;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  text-decoration: none;
  border-radius: 9999px;
  border: 0;
  box-shadow: 0 10px 24px var(--btn-glow),
    inset 0 1px 0 rgba(255, 255, 255, 0.35);
  transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
}

.nav-btn::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.25),
    rgba(255, 255, 255, 0)
  );
  pointer-events: none;
}

.nav-btn:hover {
  transform: translateY(-1px) scale(1.01);
  transform: translateY(-2px);
  box-shadow: 0 14px 32px var(--btn-glow),
    inset 0 1px 0 rgba(255, 255, 255, 0.45);
  filter: saturate(1.05);
}

.nav-btn:active {
  transform: translateY(0);
  box-shadow: 0 8px 18px var(--btn-glow),
    inset 0 1px 0 rgba(255, 255, 255, 0.35);
  background: linear-gradient(
    180deg,
    var(--primary-hover),
    var(--primary-pressed)
  );
}

.nav-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12), 0 10px 24px var(--btn-glow),
    inset 0 1px 0 rgba(255, 255, 255, 0.35);
}

/* Secondary button: soft, glassy */
.nav-btn.secondary {
  background: rgba(255, 255, 255, 0.7);
  color: var(--text-color);
  border: 1px solid rgba(2, 6, 23, 0.08);
  box-shadow: 0 8px 18px rgba(2, 6, 23, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.nav-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
}

/* Quiz Styles */
.progress-bar-container {
  width: 100%;
  background-color: #edf2f7;
  border-radius: 12px;
  margin-top: 1.4rem;
  height: 12px;
  border: 1px solid var(--border-color);
}

.progress-bar {
  width: 0%;
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--btn-grad-start),
    var(--btn-grad-end)
  );
  border-radius: 12px;
  transition: width 0.5s ease-in-out;
}

.stats-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  color: var(--text-muted);
}

.question-block {
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background: #fff;
  border-radius: 14px;
  border: 1px solid var(--border-color);
  box-shadow: 0 8px 24px rgba(2, 6, 23, 0.04);
}

.question-block h2 {
  font-size: 1.15rem;
  margin-bottom: 1rem;
  color: var(--text-color);
  font-weight: 600;
}

.options-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.options-list li {
  background-color: #fff;
  margin: 0.7rem 0;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease,
    border-color 0.18s ease, background 0.18s ease;
}

.options-list li:hover {
  border-color: var(--primary-color);
  background: #eef5ff;
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(37, 99, 235, 0.08);
}

.options-list li.selected {
  color: #fff;
  background: linear-gradient(
    180deg,
    var(--btn-grad-start),
    var(--btn-grad-end)
  );
  border-color: transparent;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4);
  font-weight: 700;
}

#submit-btn {
  display: block;
  width: 100%;
  padding: 1rem;
  font-size: 1.15rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(180deg, #22c55e, #16a34a);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  margin-top: 2rem;
  box-shadow: 0 12px 28px rgba(34, 197, 94, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.35);
}

#submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

#submit-btn:disabled {
  background: #e5e7eb;
  color: var(--text-muted);
  cursor: not-allowed;
  box-shadow: none;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: none;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.5s;
}

.modal-content {
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);

  background: #ffffff;
  padding: 2.5rem;
  border-radius: 18px;
  border: 1px solid var(--border-color);
  width: 90%;
  max-width: 640px;
  text-align: center;
  box-shadow: 0 24px 64px rgba(2, 6, 23, 0.16);
}

.modal-content h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

#score-percentage {
  font-size: 4.25rem;
  font-weight: 800;
  margin: 1rem 0;
}

#grade-level {
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 1.25rem;
}

.grade-pass {
  color: var(--correct-color);
}
.grade-fail {
  color: #d97706;
  font-weight: 600;
}

.modal-buttons {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.modal-buttons button,
.modal-buttons a {
  padding: 0.85rem 1.4rem;
  border: 1px solid var(--border-color);
  background: rgba(255, 255, 255, 0.8);
  color: var(--text-color);
  border-radius: 9999px;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
  font-size: 1rem;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 8px 18px rgba(2, 6, 23, 0.06);
}

.modal-buttons button:hover,
.modal-buttons a:hover {
  transform: translateY(-2px);
  background: #ffffff;
}

#next-lecture-btn {
  background: linear-gradient(
    180deg,
    var(--btn-grad-start),
    var(--btn-grad-end)
  );
  border-color: transparent;
  color: #fff;
  display: none; /* Shown via JS on pass */
}

/* Answer Review */
#answer-review {
  margin-top: 2rem;
  max-height: 250px;
  overflow-y: auto;
  text-align: left;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.review-item {
  padding: 1rem;
  margin-bottom: 1rem;
  border-left: 4px solid;
  background: #fff;
  border-radius: 12px;
}

.review-item.correct {
  border-color: var(--correct-color);
}
.review-item.incorrect {
  border-color: var(--incorrect-color);
}

.review-item p {
  margin: 0.5rem 0;
}
.review-item .review-question {
  font-weight: 700;
  margin-bottom: 0.5rem;
}
.review-item .correct-answer {
  color: var(--correct-color);
}
.review-item .incorrect-answer {
  color: var(--incorrect-color);
}

/* Responsive */
@media (max-width: 768px) {
  body {
    padding: 1rem;
  }
  .container {
    padding: 1.5rem;
  }
}

/* Softer fail message text */
.modal-fail-message {
  color: #d97706; /* amber tone */
  font-size: 1.1rem;
  margin-top: 0.5rem;
}

/* Friendlier feedback tone */
#feedback-text {
  color: var(--text-muted);
  font-size: 1.05rem;
  margin-top: 0.5rem;
}

/* Improved focus ring */
:where(a, button, input, select, textarea):focus-visible {
  outline: 3px solid rgba(37, 99, 235, 0.35);
  outline-offset: 2px;
  border-radius: 10px;
}

/* Subtle container backdrop */
.container::before {
  content: "";
  position: fixed;
  inset: 0;
  background: radial-gradient(
    1000px 700px at 10% 80%,
    rgba(255, 255, 255, 0.5),
    rgba(255, 255, 255, 0)
  );
  pointer-events: none;
  z-index: 0;
}

/* Auth panel */
.auth-panel {
  position: fixed;
  top: 12px;
  right: 12px;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  padding: 10px 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  font-size: 14px;
}
#auth input {
  height: 32px;
  padding: 0 8px;
  border: 1px solid #d0d5dd;
  border-radius: 6px;
}
#auth button {
  height: 32px;
  padding: 0 10px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background: #fff;
  cursor: pointer;
}
#auth button[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}
#auth #auth-msg {
  width: 100%;
  color: #b00;
  margin-top: 4px;
  font-size: 12px;
}
@media (max-width: 640px) {
  .auth-panel {
    left: 12px;
    right: 12px;
  }
  #auth input {
    flex: 1 1 140px;
  }
}
/* Modals */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}
.modal-backdrop[open] {
  display: flex;
}
.modal-card {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
  max-width: 560px;
  width: 92%;
  padding: 20px 22px;
}
.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 14px;
}
.modal-card h3 {
  margin: 0 0 6px 0;
  font-size: 20px;
}
.modal-card p {
  margin: 0 0 8px 0;
  font-size: 14px;
  line-height: 1.6;
}
.modal-card input {
  width: 100%;
  height: 36px;
  border: 1px solid #d0d5dd;
  border-radius: 8px;
  padding: 0 10px;
}
.modal-card button {
  height: 36px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #0f766e;
  color: #fff;
  cursor: pointer;
}
.modal-card button.secondary {
  background: #fff;
  color: #0f172a;
  border: 1px solid #cbd5e1;
}
#auth-msg {
  color: #b00;
  font-size: 12px;
  margin-top: 6px;
}
/* ========================================
   AUTHENTICATION MODAL STYLES
   Add these to your existing style.css
   ======================================== */

/* Auth Modal */
.auth-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

.auth-modal.show {
  opacity: 1;
  visibility: visible;
}

.auth-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.2);
  max-width: 420px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  transform: translateY(20px);
  transition: transform 0.3s ease;
}

.auth-modal.show .auth-card {
  transform: translateY(0);
}

.auth-header {
  background: linear-gradient(
    135deg,
    var(--primary-color) 0%,
    var(--btn-grad-end) 100%
  );
  padding: 2rem;
  text-align: center;
  position: relative;
}

.auth-header::after {
  content: "";
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
}

.auth-logo {
  width: 60px;
  height: 60px;
  margin: 0 auto 1rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.auth-logo img {
  filter: brightness(0) invert(1);
}

.auth-title {
  color: white;
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  letter-spacing: -0.02em;
}

.auth-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  margin: 0;
  font-weight: 400;
}

.auth-body {
  padding: 2rem;
  overflow-y: auto;
  max-height: calc(90vh - 200px);
}

/* Auth Tabs */
.auth-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  background: #f1f5f9;
  padding: 0.25rem;
  border-radius: 12px;
}

.auth-tab {
  flex: 1;
  padding: 0.75rem;
  border: none;
  background: transparent;
  color: #64748b;
  font-weight: 600;
  font-size: 0.9rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: "Poppins", sans-serif;
}

.auth-tab.active {
  background: white;
  color: var(--primary-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.auth-tab:hover:not(.active) {
  color: #334155;
}

/* Auth Forms */
.auth-form {
  display: none;
  animation: fadeIn 0.3s ease;
}

.auth-form.active {
  display: block;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  color: #334155;
  font-size: 0.875rem;
  font-weight: 600;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
  font-family: "Poppins", sans-serif;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-input.error {
  border-color: #ef4444;
}

.password-wrapper {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;
}

.toggle-password:hover {
  color: #334155;
}

.toggle-password svg {
  width: 20px;
  height: 20px;
}

/* Submit Button */
.auth-submit {
  width: 100%;
  padding: 0.875rem;
  background: linear-gradient(
    135deg,
    var(--primary-color) 0%,
    var(--btn-grad-end) 100%
  );
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  font-family: "Poppins", sans-serif;
}

.auth-submit::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.auth-submit:hover:not(:disabled)::before {
  width: 300px;
  height: 300px;
}

.auth-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.25);
}

.auth-submit:active:not(:disabled) {
  transform: translateY(0);
}

.auth-submit:disabled {
  background: #94a3b8;
  cursor: not-allowed;
  transform: none;
}

.auth-submit.loading {
  color: transparent;
}

.auth-submit.loading::after {
  content: "";
  position: absolute;
  width: 20px;
  height: 20px;
  top: 50%;
  left: 50%;
  margin-left: -10px;
  margin-top: -10px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spinner 0.8s linear infinite;
}

@keyframes spinner {
  to {
    transform: rotate(360deg);
  }
}

/* Auth Messages */
.auth-message {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  display: none;
  animation: slideUp 0.3s ease;
}

.auth-message.show {
  display: block;
}

@keyframes slideUp {
  from {
    transform: translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.auth-message.success {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.auth-message.error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.auth-message.info {
  background: #dbeafe;
  color: #1e40af;
  border: 1px solid #bfdbfe;
}

/* Auth Footer */
.auth-footer {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
  text-align: center;
}

.auth-link {
  color: #64748b;
  background: none;
  border: none;
  font-size: 0.875rem;
  cursor: pointer;
  transition: color 0.3s ease;
  text-decoration: underline;
  font-family: "Poppins", sans-serif;
}

.auth-link:hover {
  color: #334155;
}

/* Auth Status Bar */
.auth-status {
  position: fixed;
  top: 1rem;
  right: 1rem;
  background: white;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
}

.auth-status.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    var(--primary-color) 0%,
    var(--primary-hover) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 0.875rem;
  text-transform: uppercase;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-email {
  font-size: 0.875rem;
  color: #334155;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-status {
  font-size: 0.75rem;
  color: #10b981;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.status-dot {
  width: 6px;
  height: 6px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.sign-out-btn {
  padding: 0.5rem 1rem;
  background: #f1f5f9;
  color: #334155;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: "Poppins", sans-serif;
}

.sign-out-btn:hover {
  background: #e2e8f0;
  transform: translateY(-1px);
}

/* Auth Trigger Button */
.auth-trigger {
  position: fixed;
  top: 1rem;
  right: 1rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(
    135deg,
    var(--primary-color) 0%,
    var(--btn-grad-end) 100%
  );
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 999;
  font-family: "Poppins", sans-serif;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.2);
}

.auth-trigger.hidden {
  display: none;
}

.auth-trigger:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.3);
}

/* Mobile Responsive */
@media (max-width: 640px) {
  .auth-status {
    right: 0.5rem;
    top: 0.5rem;
    padding: 0.5rem 0.75rem;
  }

  .auth-trigger {
    right: 0.5rem;
    top: 0.5rem;
    padding: 0.625rem 1.25rem;
  }

  .user-email {
    max-width: 120px;
  }

  .auth-card {
    width: 95%;
    margin: 1rem;
  }

  .auth-body {
    padding: 1.5rem;
  }

  .auth-header {
    padding: 1.5rem;
  }
}

/* ========================================
   COURSE PROGRESS & NEW AUTH STYLES
   ======================================== */

/* Course Progress Container */
.course-progress-container {
    background: #eef5ff;
    border: 1px solid #dbeafe;
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    text-align: center;
    animation: fadeIn 0.5s ease-out;
}

.course-progress-container h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: var(--primary-color);
    font-size: 1.25rem;
}

.master-progress-bar {
    width: 100%;
    height: 16px;
    background-color: #dbeafe;
    border-radius: 99px;
    overflow: hidden;
    margin: 1rem auto;
    max-width: 400px;
}

#master-progress-bar-inner {
    width: 0%;
    height: 100%;
    background: linear-gradient(90deg, var(--btn-grad-start), var(--btn-grad-end));
    transition: width 0.6s cubic-bezier(0.25, 1, 0.5, 1);
    border-radius: 99px;
}

#progress-text {
    color: var(--text-muted);
    font-weight: 600;
    font-size: 0.9rem;
    margin: 0;
}

#continue-btn {
    margin-top: 1.25rem;
}

/* Auth Modal View Switching */
.auth-view {
  display: none;
}

.auth-view.active {
  display: block;
  animation: fadeIn 0.4s ease;
}

.auth-link#forgotPasswordLink {
    font-size: 0.8rem;
    padding: 0;
    margin-top: 8px;
    text-align: right;
    display: block;
    width: 100%;
}
