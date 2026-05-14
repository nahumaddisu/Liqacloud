// ================================================================
//  signup.js — CloudVault Create Account
//  Uses Firebase Auth (Email/Password + Google)
// ================================================================

import { auth } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { db } from "./firebase-config.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── If already logged in, redirect straight to app ────────────
onAuthStateChanged(auth, user => {
  if (user) window.location.href = "index.html";
});

// ── DOM ───────────────────────────────────────────────────────
const fullnameInput  = document.getElementById("fullname");
const emailInput     = document.getElementById("email");
const passwordInput  = document.getElementById("password");
const confirmInput   = document.getElementById("confirm");
const termsCheck     = document.getElementById("terms-check");
const signupBtn      = document.getElementById("signup-btn");
const btnText        = document.getElementById("btn-text");
const btnSpinner     = document.getElementById("btn-spinner");
const errorBox       = document.getElementById("error-box");
const errorMsg       = document.getElementById("error-msg");
const eyeBtn         = document.getElementById("eye-btn");
const googleBtn      = document.getElementById("google-btn");
const strengthFill   = document.getElementById("strength-fill");
const strengthLabel  = document.getElementById("strength-label");
const matchIcon      = document.getElementById("match-icon");

// ── SHOW/HIDE PASSWORD ────────────────────────────────────────
eyeBtn.addEventListener("click", () => {
  const isText = passwordInput.type === "text";
  passwordInput.type = isText ? "password" : "text";
  eyeBtn.innerHTML = isText
    ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`
    : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
});

// ── PASSWORD STRENGTH METER ───────────────────────────────────
passwordInput.addEventListener("input", () => {
  const pw  = passwordInput.value;
  const str = getStrength(pw);
  const colors = ["#ff5a5a", "#f0a050", "#f0d050", "#3ecf8e"];
  const labels = ["Weak", "Fair", "Good", "Strong"];
  const widths  = ["25%", "50%", "75%", "100%"];

  if (!pw) {
    strengthFill.style.width      = "0%";
    strengthLabel.textContent     = "";
  } else {
    strengthFill.style.width      = widths[str];
    strengthFill.style.background = colors[str];
    strengthLabel.textContent     = labels[str];
    strengthLabel.style.color     = colors[str];
  }

  checkMatch();
});

function getStrength(pw) {
  let score = 0;
  if (pw.length >= 6)  score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(3, score - (score > 0 ? 1 : 0));
}

// ── CONFIRM PASSWORD MATCH ─────────────────────────────────────
confirmInput.addEventListener("input", checkMatch);

function checkMatch() {
  const pw  = passwordInput.value;
  const cfm = confirmInput.value;
  if (cfm.length === 0) { matchIcon.classList.add("hidden"); return; }
  if (pw === cfm) {
    matchIcon.classList.remove("hidden");
    confirmInput.classList.remove("invalid");
    confirmInput.classList.add("valid");
  } else {
    matchIcon.classList.add("hidden");
    confirmInput.classList.remove("valid");
    confirmInput.classList.add("invalid");
  }
}

// ── SIGN UP WITH EMAIL ─────────────────────────────────────────
signupBtn.addEventListener("click", handleSignup);
[fullnameInput, emailInput, passwordInput, confirmInput].forEach(input => {
  input.addEventListener("keydown", e => { if (e.key === "Enter") handleSignup(); });
});

async function handleSignup() {
  const name     = fullnameInput.value.trim();
  const email    = emailInput.value.trim();
  const password = passwordInput.value;
  const confirm  = confirmInput.value;

  clearError();

  // ── Validation ──────────────────────────────────────────────
  if (!name)              { showError("Please enter your full name.");          return; }
  if (!email)             { showError("Please enter your email address.");      return; }
  if (!isValidEmail(email)){ showError("Please enter a valid email address.");  return; }
  if (!password)          { showError("Please choose a password.");             return; }
  if (password.length < 6){ showError("Password must be at least 6 characters."); return; }
  if (password !== confirm){ showError("Passwords do not match.");               return; }
  if (!termsCheck.checked){ showError("Please accept the Terms of Service to continue."); return; }

  setLoading(true);

  try {
    // ── Create the user in Firebase Auth ──────────────────────
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const user       = credential.user;

    // ── Save display name to Firebase Auth profile ─────────────
    await updateProfile(user, { displayName: name });

    // ── Save user profile to Firestore ─────────────────────────
    // This creates a document at /users/{uid} with the user's info.
    // You can add more fields here later (e.g. plan, storageUsed, etc.)
    await setDoc(doc(db, "users", user.uid), {
      uid:         user.uid,
      displayName: name,
      email:       user.email,
      photoURL:    user.photoURL || null,
      plan:        "free",
      storageUsed: 0,
      createdAt:   serverTimestamp(),
    });

    // onAuthStateChanged above redirects to index.html automatically
  } catch (err) {
    showError(friendlyError(err.code));
    setLoading(false);
  }
}

// ── SIGN UP WITH GOOGLE ────────────────────────────────────────
googleBtn.addEventListener("click", async () => {
  clearError();
  try {
    const provider  = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);
    const user       = credential.user;

    // Save to Firestore (only on first signup — setDoc with merge won't overwrite)
    await setDoc(doc(db, "users", user.uid), {
      uid:         user.uid,
      displayName: user.displayName || user.email.split("@")[0],
      email:       user.email,
      photoURL:    user.photoURL || null,
      plan:        "free",
      storageUsed: 0,
      createdAt:   serverTimestamp(),
    }, { merge: true }); // merge:true = won't overwrite if account already exists

    // onAuthStateChanged above redirects automatically
  } catch (err) {
    if (err.code !== "auth/popup-closed-by-user") {
      showError("Google sign-up failed. Please try again.");
    }
  }
});

// ── HELPERS ───────────────────────────────────────────────────
function setLoading(on) {
  signupBtn.disabled      = on;
  btnText.textContent     = on ? "Creating account…" : "Create Account";
  btnSpinner.classList.toggle("hidden", !on);
}

function showError(msg) {
  errorMsg.textContent = msg;
  errorBox.classList.remove("hidden");
  errorBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function clearError() {
  errorBox.classList.add("hidden");
  errorMsg.textContent = "";
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function friendlyError(code) {
  const map = {
    "auth/email-already-in-use":   "An account with this email already exists. Try signing in instead.",
    "auth/invalid-email":          "That doesn't look like a valid email address.",
    "auth/weak-password":          "Password must be at least 6 characters.",
    "auth/operation-not-allowed":  "Email sign-up is not enabled. Contact support.",
    "auth/network-request-failed": "Network error. Check your internet connection.",
    "auth/too-many-requests":      "Too many attempts. Please try again in a few minutes.",
  };
  return map[code] || "Something went wrong. Please try again.";
}
