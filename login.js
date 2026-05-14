// ================================================================
//  login.js — CloudVault Sign In
//  Uses Firebase Auth (Email/Password + Google)
// ================================================================

import { auth } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ── If user is already logged in, send them to the app ────────
onAuthStateChanged(auth, user => {
  if (user) window.location.href = "index.html";
});

// ── DOM ───────────────────────────────────────────────────────
const emailInput    = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn      = document.getElementById("login-btn");
const btnText       = document.getElementById("btn-text");
const btnSpinner    = document.getElementById("btn-spinner");
const errorBox      = document.getElementById("error-box");
const errorMsg      = document.getElementById("error-msg");
const eyeBtn        = document.getElementById("eye-btn");
const googleBtn     = document.getElementById("google-btn");
const forgotBtn     = document.getElementById("forgot-btn");
const forgotOverlay = document.getElementById("forgot-overlay");
const forgotCancel  = document.getElementById("forgot-cancel");
const forgotSend    = document.getElementById("forgot-send");
const resetEmail    = document.getElementById("reset-email");
const resetSuccess  = document.getElementById("reset-success");

// ── SHOW/HIDE PASSWORD ────────────────────────────────────────
eyeBtn.addEventListener("click", () => {
  const isText = passwordInput.type === "text";
  passwordInput.type = isText ? "password" : "text";
  eyeBtn.innerHTML = isText
    ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`
    : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
});

// ── EMAIL + PASSWORD LOGIN ────────────────────────────────────
loginBtn.addEventListener("click", handleLogin);
[emailInput, passwordInput].forEach(input => {
  input.addEventListener("keydown", e => { if (e.key === "Enter") handleLogin(); });
});

async function handleLogin() {
  const email    = emailInput.value.trim();
  const password = passwordInput.value;

  clearError();

  if (!email)    { showError("Please enter your email address.");  return; }
  if (!password) { showError("Please enter your password.");        return; }

  setLoading(true);

  try {
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged above will redirect to index.html automatically
  } catch (err) {
    showError(friendlyError(err.code));
    setLoading(false);
  }
}

// ── GOOGLE LOGIN ──────────────────────────────────────────────
googleBtn.addEventListener("click", async () => {
  clearError();
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    // onAuthStateChanged above will redirect automatically
  } catch (err) {
    if (err.code !== "auth/popup-closed-by-user") {
      showError("Google sign-in failed. Please try again.");
    }
  }
});

// ── FORGOT PASSWORD ───────────────────────────────────────────
forgotBtn.addEventListener("click", e => {
  e.preventDefault();
  resetEmail.value = emailInput.value; // pre-fill if they already typed it
  resetSuccess.classList.add("hidden");
  forgotOverlay.classList.remove("hidden");
  setTimeout(() => resetEmail.focus(), 60);
});

forgotCancel.addEventListener("click", () => forgotOverlay.classList.add("hidden"));
forgotOverlay.addEventListener("click", e => {
  if (e.target === forgotOverlay) forgotOverlay.classList.add("hidden");
});

forgotSend.addEventListener("click", async () => {
  const email = resetEmail.value.trim();
  if (!email) { resetEmail.focus(); return; }

  forgotSend.disabled    = true;
  forgotSend.textContent = "Sending…";

  try {
    await sendPasswordResetEmail(auth, email);
    resetSuccess.classList.remove("hidden");
    forgotSend.textContent = "Sent ✓";
  } catch (err) {
    resetSuccess.classList.add("hidden");
    alert(friendlyError(err.code));
    forgotSend.disabled    = false;
    forgotSend.textContent = "Send Link";
  }
});

// ── HELPERS ───────────────────────────────────────────────────
function setLoading(on) {
  loginBtn.disabled       = on;
  btnText.textContent     = on ? "Signing in…" : "Sign In";
  btnSpinner.classList.toggle("hidden", !on);
}

function showError(msg) {
  errorMsg.textContent = msg;
  errorBox.classList.remove("hidden");
}

function clearError() {
  errorBox.classList.add("hidden");
  errorMsg.textContent = "";
}

function friendlyError(code) {
  const map = {
    "auth/invalid-email":        "That doesn't look like a valid email address.",
    "auth/user-not-found":       "No account found with this email address.",
    "auth/wrong-password":       "Incorrect password. Please try again.",
    "auth/invalid-credential":   "Incorrect email or password. Please try again.",
    "auth/too-many-requests":    "Too many failed attempts. Try again in a few minutes.",
    "auth/user-disabled":        "This account has been disabled. Contact support.",
    "auth/network-request-failed": "Network error. Check your internet connection.",
  };
  return map[code] || "Something went wrong. Please try again.";
}
