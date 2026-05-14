// ================================================================
//  CloudVault — app.js
//  Built by: You  |  Ready for Firebase integration
// ================================================================
//
//  HOW THIS FILE IS STRUCTURED:
//  ─────────────────────────────────────────────────────────────
//  SECTION 1 → FIREBASE CONFIG & SETUP          (lines ~20–80)
//              ↳ Paste your Firebase keys here when ready
//
//  SECTION 2 → AUTH LOGIC                       (lines ~82–190)
//              ↳ Sign in / Sign up / Sign out
//              ↳ Firebase functions clearly marked with TODO
//
//  SECTION 3 → FILE & FOLDER LOGIC              (lines ~192–420)
//              ↳ Upload, delete, rename, star, trash
//              ↳ Firebase Storage + Firestore marked with TODO
//
//  SECTION 4 → UI & RENDERING                   (lines ~422–700)
//              ↳ Pure JavaScript, no changes needed for Firebase
// ================================================================
 
 
 
// ══════════════════════════════════════════════════════════════
//  SECTION 1 — FIREBASE CONFIG & SETUP
//  ─────────────────────────────────────────────────────────────
//  STEP 1: Go to https://console.firebase.google.com
//  STEP 2: Create a project → Add a Web App
//  STEP 3: Copy the firebaseConfig object they give you
//  STEP 4: Paste it below, replacing the placeholder values
//  STEP 5: Uncomment all lines that say "// FIREBASE:"
// ══════════════════════════════════════════════════════════════
 
// FIREBASE: Uncomment these 3 import lines when you connect Firebase
// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
// import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
// import { getFirestore, collection, doc, addDoc, getDocs, deleteDoc, updateDoc, query, where, orderBy, serverTimestamp, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
// import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
 
// ─── YOUR FIREBASE CONFIG ─────────────────────────────────────
// FIREBASE: Replace ALL the values below with your real config
// Get them from: Firebase Console → Project Settings → Your Apps
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",            // e.g. "AIzaSyA..."
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};
 
// FIREBASE: Uncomment these 4 lines when you connect Firebase
// const firebaseApp = initializeApp(firebaseConfig);
// const auth        = getAuth(firebaseApp);
// const db          = getFirestore(firebaseApp);
// const storage     = getStorage(firebaseApp);
 
 
 
// ══════════════════════════════════════════════════════════════
//  SECTION 2 — STATE & DOM REFERENCES
// ══════════════════════════════════════════════════════════════
 
// ─── APP STATE ───────────────────────────────────────────────
const state = {
  currentUser:    null,       // logged-in user object
  isSignup:       false,      // toggle between login/signup form
  currentSection: "my-files", // active sidebar section
  currentPath:    [],         // folder breadcrumb: [{id, name}, ...]
  view:           "grid",     // "grid" or "list"
  files:          [],         // all files loaded for current section
  contextTarget:  null,       // file/folder that was right-clicked
  unsubscribe:    null,       // Firestore real-time listener cleanup fn
};
 
// ─── MOCK DATA (used locally before Firebase) ─────────────────
// FIREBASE: Delete this whole mockFiles array once Firebase is connected
const mockFiles = [
  { id: "f1", name: "Photos",         type: "folder", fileType: "",           size: 0,          starred: false, deleted: false, parentId: null, createdAt: Date.now() - 86400000 * 5, downloadURL: "" },
  { id: "f2", name: "Documents",      type: "folder", fileType: "",           size: 0,          starred: true,  deleted: false, parentId: null, createdAt: Date.now() - 86400000 * 3, downloadURL: "" },
  { id: "f3", name: "profile.jpg",    type: "file",   fileType: "image/jpeg", size: 2400000,    starred: false, deleted: false, parentId: null, createdAt: Date.now() - 86400000 * 2, downloadURL: "https://picsum.photos/seed/cv1/800/500" },
  { id: "f4", name: "resume.pdf",     type: "file",   fileType: "application/pdf", size: 540000, starred: true, deleted: false, parentId: null, createdAt: Date.now() - 86400000,     downloadURL: "" },
  { id: "f5", name: "music.mp3",      type: "file",   fileType: "audio/mpeg", size: 6800000,    starred: false, deleted: false, parentId: null, createdAt: Date.now() - 3600000 * 5,  downloadURL: "" },
  { id: "f6", name: "demo.mp4",       type: "file",   fileType: "video/mp4",  size: 48000000,   starred: false, deleted: false, parentId: null, createdAt: Date.now() - 3600000 * 2,  downloadURL: "" },
  { id: "f7", name: "archive.zip",    type: "file",   fileType: "application/zip", size: 12000000, starred: false, deleted: false, parentId: null, createdAt: Date.now() - 600000,      downloadURL: "" },
  { id: "f8", name: "notes.docx",     type: "file",   fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: 180000, starred: false, deleted: false, parentId: null, createdAt: Date.now() - 120000, downloadURL: "" },
  { id: "f9", name: "landscape.png",  type: "file",   fileType: "image/png",  size: 3900000,    starred: false, deleted: false, parentId: null, createdAt: Date.now() - 60000,        downloadURL: "https://picsum.photos/seed/cv2/800/500" },
];
 
// ─── DOM ELEMENTS ─────────────────────────────────────────────
const el = {
  authScreen:    document.getElementById("auth-screen"),
  app:           document.getElementById("app"),
 
  // Auth
  authTitle:     document.getElementById("auth-title"),
  authSub:       document.getElementById("auth-sub"),
  nameGroup:     document.getElementById("name-group"),
  nameInput:     document.getElementById("name-input"),
  emailInput:    document.getElementById("email-input"),
  passwordInput: document.getElementById("password-input"),
  pwToggle:      document.getElementById("pw-toggle"),
  authBtn:       document.getElementById("auth-btn"),
  authError:     document.getElementById("auth-error"),
  toggleAuth:    document.getElementById("toggle-auth"),
  toggleLabel:   document.getElementById("auth-toggle-label"),
  googleBtn:     document.getElementById("google-btn"),
  logoutBtn:     document.getElementById("logout-btn"),
 
  // User info
  userName:      document.getElementById("user-name"),
  userEmail:     document.getElementById("user-email"),
  userAvatar:    document.getElementById("user-avatar"),
 
  // Sidebar
  sidebarUpload: document.getElementById("sidebar-upload-btn"),
  sidebar:       document.getElementById("sidebar"),
  hamburger:     document.getElementById("hamburger"),
  navItems:      document.querySelectorAll(".nav-item"),
  storageFill:   document.getElementById("storage-fill"),
  storagePct:    document.getElementById("storage-pct"),
  storageDetail: document.getElementById("storage-detail"),
 
  // Topbar
  breadcrumb:    document.getElementById("breadcrumb"),
  searchInput:   document.getElementById("search-input"),
  newFolderBtn:  document.getElementById("new-folder-btn"),
  gridBtn:       document.getElementById("grid-btn"),
  listBtn:       document.getElementById("list-btn"),
 
  // Content
  filesContainer: document.getElementById("files-container"),
  emptyState:     document.getElementById("empty-state"),
  emptyTitle:     document.getElementById("empty-title"),
  emptySub:       document.getElementById("empty-sub"),
  emptyUploadBtn: document.getElementById("empty-upload-btn"),
  itemCount:      document.getElementById("item-count"),
  sectionTitle:   document.getElementById("section-title"),
  sortSelect:     document.getElementById("sort-select"),
  dragOverlay:    document.getElementById("drag-overlay"),
 
  // Upload panel
  upPanel:    document.getElementById("up-panel"),
  upTitle:    document.getElementById("up-title"),
  upItems:    document.getElementById("up-items"),
  upMinimize: document.getElementById("up-minimize"),
  upClose:    document.getElementById("up-close"),
 
  // Context menu
  ctxMenu:        document.getElementById("ctx-menu"),
  ctxOpen:        document.getElementById("ctx-open"),
  ctxDownload:    document.getElementById("ctx-download"),
  ctxRename:      document.getElementById("ctx-rename"),
  ctxStar:        document.getElementById("ctx-star"),
  ctxStarLabel:   document.getElementById("ctx-star-label"),
  ctxDelete:      document.getElementById("ctx-delete"),
  ctxDeleteLabel: document.getElementById("ctx-delete-label"),
 
  // Modals
  previewOverlay:  document.getElementById("preview-overlay"),
  previewFilename: document.getElementById("preview-filename"),
  previewFilesize: document.getElementById("preview-filesize"),
  previewBody:     document.getElementById("preview-body"),
  previewDl:       document.getElementById("preview-dl"),
  closePreview:    document.getElementById("close-preview"),
 
  renameOverlay: document.getElementById("rename-overlay"),
  renameInput:   document.getElementById("rename-input"),
  renameCancel:  document.getElementById("rename-cancel"),
  renameOk:      document.getElementById("rename-ok"),
 
  folderOverlay: document.getElementById("folder-overlay"),
  folderInput:   document.getElementById("folder-input"),
  folderCancel:  document.getElementById("folder-cancel"),
  folderOk:      document.getElementById("folder-ok"),
 
  fileInput: document.getElementById("file-input"),
};
 
 
 
// ══════════════════════════════════════════════════════════════
//  SECTION 2 — AUTH
// ══════════════════════════════════════════════════════════════
 
// ─── TOGGLE SIGN IN / SIGN UP ────────────────────────────────
el.toggleAuth.addEventListener("click", e => {
  e.preventDefault();
  state.isSignup = !state.isSignup;
 
  if (state.isSignup) {
    el.authTitle.textContent    = "Create account";
    el.authSub.textContent      = "Join CloudVault for free";
    el.authBtn.textContent      = "Create Account";
    el.toggleLabel.textContent  = "Already have an account?";
    el.toggleAuth.textContent   = "Sign in";
    el.nameGroup.classList.remove("hidden");
  } else {
    el.authTitle.textContent    = "Welcome back";
    el.authSub.textContent      = "Sign in to your secure vault";
    el.authBtn.textContent      = "Sign In";
    el.toggleLabel.textContent  = "Don't have an account?";
    el.toggleAuth.textContent   = "Create one";
    el.nameGroup.classList.add("hidden");
  }
  showAuthError("");
});
 
// ─── SHOW/HIDE PASSWORD ──────────────────────────────────────
el.pwToggle.addEventListener("click", () => {
  const isText = el.passwordInput.type === "text";
  el.passwordInput.type = isText ? "password" : "text";
});
 
// ─── SIGN IN / SIGN UP BUTTON ────────────────────────────────
el.authBtn.addEventListener("click", handleAuth);
[el.nameInput, el.emailInput, el.passwordInput].forEach(input => {
  input.addEventListener("keydown", e => { if (e.key === "Enter") handleAuth(); });
});
 
async function handleAuth() {
  const email    = el.emailInput.value.trim();
  const password = el.passwordInput.value;
  const name     = el.nameInput.value.trim();
 
  showAuthError("");
  if (!email || !password) { showAuthError("Please fill in all fields."); return; }
 
  el.authBtn.textContent = "Please wait…";
  el.authBtn.disabled    = true;
 
  try {
    if (state.isSignup) {
      // ─── FIREBASE: Replace the 3 lines below with real Firebase auth ───
      // const cred = await createUserWithEmailAndPassword(auth, email, password);
      // await updateProfile(cred.user, { displayName: name || email.split("@")[0] });
      // onLoginSuccess(cred.user);
 
      // MOCK login (remove when Firebase is connected)
      onLoginSuccess({ uid: "mock-uid", displayName: name || email.split("@")[0], email });
 
    } else {
      // ─── FIREBASE: Replace the 2 lines below with real Firebase auth ───
      // const cred = await signInWithEmailAndPassword(auth, email, password);
      // onLoginSuccess(cred.user);
 
      // MOCK login (remove when Firebase is connected)
      onLoginSuccess({ uid: "mock-uid", displayName: "John Doe", email });
    }
  } catch (err) {
    showAuthError(friendlyError(err.code));
  } finally {
    el.authBtn.disabled    = false;
    el.authBtn.textContent = state.isSignup ? "Create Account" : "Sign In";
  }
}
 
// ─── GOOGLE SIGN IN ──────────────────────────────────────────
el.googleBtn.addEventListener("click", async () => {
  try {
    // ─── FIREBASE: Uncomment these 3 lines when Firebase is connected ───
    // const provider = new GoogleAuthProvider();
    // const cred     = await signInWithPopup(auth, provider);
    // onLoginSuccess(cred.user);
 
    // MOCK Google login (remove when Firebase is connected)
    onLoginSuccess({ uid: "mock-uid", displayName: "Google User", email: "user@gmail.com", photoURL: null });
  } catch (err) {
    showAuthError("Google sign-in failed. Try again.");
  }
});
 
// ─── SIGN OUT ────────────────────────────────────────────────
el.logoutBtn.addEventListener("click", () => {
  // FIREBASE: Uncomment the line below when Firebase is connected
  // signOut(auth);
 
  // MOCK logout (remove when Firebase is connected)
  onLogoutSuccess();
});
 
// ─── FIREBASE AUTH LISTENER ──────────────────────────────────
// FIREBASE: Uncomment this block when Firebase is connected.
// This automatically handles login/logout state across page refreshes.
// onAuthStateChanged(auth, user => {
//   if (user) {
//     onLoginSuccess(user);
//   } else {
//     onLogoutSuccess();
//   }
// });
 
// ─── ON LOGIN / LOGOUT ───────────────────────────────────────
function onLoginSuccess(user) {
  state.currentUser = user;
 
  const displayName = user.displayName || user.email.split("@")[0];
  el.userName.textContent   = displayName;
  el.userEmail.textContent  = user.email;
  el.userAvatar.textContent = displayName[0].toUpperCase();
 
  el.authScreen.classList.add("hidden");
  el.app.classList.remove("hidden");
 
  loadSection("my-files");
}
 
function onLogoutSuccess() {
  state.currentUser = null;
  el.app.classList.add("hidden");
  el.authScreen.classList.remove("hidden");
  el.emailInput.value    = "";
  el.passwordInput.value = "";
}
 
function showAuthError(msg) {
  el.authError.textContent = msg;
  el.authError.classList.toggle("hidden", !msg);
}
 
function friendlyError(code) {
  const map = {
    "auth/email-already-in-use": "That email is already registered.",
    "auth/invalid-email":        "Please enter a valid email address.",
    "auth/weak-password":        "Password must be at least 6 characters.",
    "auth/user-not-found":       "No account found with this email.",
    "auth/wrong-password":       "Incorrect password. Try again.",
    "auth/invalid-credential":   "Invalid email or password.",
    "auth/too-many-requests":    "Too many attempts. Try again later.",
  };
  return map[code] || "Something went wrong. Please try again.";
}
 
 
 
// ══════════════════════════════════════════════════════════════
//  SECTION 3 — FILE & FOLDER LOGIC
// ══════════════════════════════════════════════════════════════
 
// ─── LOAD SECTION ────────────────────────────────────────────
function loadSection(section) {
  state.currentSection = section;
  state.currentPath    = [];
  updateBreadcrumb();
 
  const labels = {
    "my-files": "My Files",
    "recent":   "Recent",
    "starred":  "Starred",
    "shared":   "Shared",
    "trash":    "Trash",
  };
  el.sectionTitle.textContent = labels[section] || "My Files";
 
  // Highlight active nav item
  el.navItems.forEach(n => {
    n.classList.toggle("active", n.dataset.section === section);
  });
 
  loadFiles();
}
 
// ─── LOAD FILES ───────────────────────────────────────────────
function loadFiles() {
  const folderId = state.currentPath.length > 0
    ? state.currentPath[state.currentPath.length - 1].id
    : null;
 
  // ─── FIREBASE: Replace the mock block below with this Firestore code ───
  //
  // if (state.unsubscribe) state.unsubscribe();           // stop old listener
  //
  // let q;
  // const uid = state.currentUser.uid;
  // const col = collection(db, "users", uid, "files");
  //
  // if (state.currentSection === "my-files") {
  //   q = query(col, where("parentId","==",folderId), where("deleted","==",false), orderBy("createdAt","desc"));
  // } else if (state.currentSection === "starred") {
  //   q = query(col, where("starred","==",true), where("deleted","==",false), orderBy("createdAt","desc"));
  // } else if (state.currentSection === "trash") {
  //   q = query(col, where("deleted","==",true), orderBy("createdAt","desc"));
  // } else if (state.currentSection === "recent") {
  //   q = query(col, where("deleted","==",false), orderBy("createdAt","desc"));
  // } else {
  //   renderFiles([]);
  //   return;
  // }
  //
  // state.unsubscribe = onSnapshot(q, snap => {
  //   state.files = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  //   renderFiles(state.files);
  //   updateStorageBar();
  // });
 
  // MOCK file loading (delete this block when Firebase is connected)
  let filtered = [...mockFiles];
  if (state.currentSection === "my-files") {
    filtered = filtered.filter(f => f.parentId === folderId && !f.deleted);
  } else if (state.currentSection === "starred") {
    filtered = filtered.filter(f => f.starred && !f.deleted);
  } else if (state.currentSection === "trash") {
    filtered = filtered.filter(f => f.deleted);
  } else if (state.currentSection === "recent") {
    filtered = filtered.filter(f => !f.deleted).slice(0, 10);
  } else {
    filtered = [];
  }
  state.files = filtered;
  renderFiles(state.files);
  updateStorageBar();
}
 
// ─── UPLOAD FILES ─────────────────────────────────────────────
el.fileInput.addEventListener("change", e => uploadFiles(Array.from(e.target.files)));
el.sidebarUpload.addEventListener("click", () => el.fileInput.click());
el.emptyUploadBtn.addEventListener("click", () => el.fileInput.click());
 
function uploadFiles(files) {
  if (!files.length) return;
  el.upPanel.classList.remove("hidden");
  el.upItems.innerHTML = "";
 
  files.forEach(file => uploadSingleFile(file));
}
 
function uploadSingleFile(file) {
  const folderId = state.currentPath.length > 0
    ? state.currentPath[state.currentPath.length - 1].id
    : null;
 
  // Build UI item
  const item = document.createElement("div");
  item.className = "up-item";
  item.innerHTML = `
    <div class="up-item-name">${file.name}</div>
    <div class="up-bar"><div class="up-fill" style="width:0%" id="fill-${file.name}"></div></div>
    <div class="up-status" id="status-${file.name}">Preparing…</div>
  `;
  el.upItems.appendChild(item);
  el.upTitle.textContent = `Uploading ${el.upItems.children.length} file(s)`;
 
  const fillEl   = document.getElementById(`fill-${file.name}`);
  const statusEl = document.getElementById(`status-${file.name}`);
 
  // ─── FIREBASE: Replace the mock block below with real Firebase Storage upload ───
  //
  // const uid         = state.currentUser.uid;
  // const storagePath = `users/${uid}/${Date.now()}_${file.name}`;
  // const storageRef  = ref(storage, storagePath);
  // const task        = uploadBytesResumable(storageRef, file);
  //
  // task.on("state_changed",
  //   snap => {
  //     const pct      = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
  //     fillEl.style.width    = pct + "%";
  //     statusEl.textContent  = pct + "%";
  //   },
  //   err => {
  //     statusEl.textContent = "Failed: " + err.message;
  //     statusEl.className   = "up-status error";
  //   },
  //   async () => {
  //     const downloadURL = await getDownloadURL(task.snapshot.ref);
  //     await addDoc(collection(db, "users", uid, "files"), {
  //       name:        file.name,
  //       type:        "file",
  //       fileType:    file.type,
  //       size:        file.size,
  //       downloadURL,
  //       storagePath,
  //       parentId:    folderId,
  //       starred:     false,
  //       deleted:     false,
  //       createdAt:   serverTimestamp(),
  //     });
  //     fillEl.style.width   = "100%";
  //     statusEl.textContent = "✓ Done";
  //     statusEl.className   = "up-status done";
  //   }
  // );
 
  // MOCK upload animation (delete when Firebase is connected)
  let pct = 0;
  const interval = setInterval(() => {
    pct += Math.random() * 18;
    if (pct >= 100) {
      pct = 100;
      clearInterval(interval);
      statusEl.textContent = "✓ Done";
      statusEl.className   = "up-status done";
 
      // Add to mock data
      const newFile = {
        id: "u" + Date.now(),
        name: file.name,
        type: "file",
        fileType: file.type,
        size: file.size,
        starred: false,
        deleted: false,
        parentId: folderId,
        createdAt: Date.now(),
        downloadURL: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
      };
      mockFiles.unshift(newFile);
      loadFiles();
    }
    fillEl.style.width   = pct + "%";
    statusEl.textContent = Math.round(pct) + "%";
  }, 120);
}
 
// ─── CREATE FOLDER ────────────────────────────────────────────
el.newFolderBtn.addEventListener("click", () => {
  el.folderInput.value = "";
  el.folderOverlay.classList.remove("hidden");
  setTimeout(() => el.folderInput.focus(), 50);
});
el.folderCancel.addEventListener("click", () => el.folderOverlay.classList.add("hidden"));
el.folderInput.addEventListener("keydown", e => { if (e.key === "Enter") createFolder(); });
el.folderOk.addEventListener("click", createFolder);
 
async function createFolder() {
  const name = el.folderInput.value.trim();
  if (!name) return;
 
  const folderId = state.currentPath.length > 0
    ? state.currentPath[state.currentPath.length - 1].id
    : null;
 
  // ─── FIREBASE: Replace mock block below ───
  // const uid = state.currentUser.uid;
  // await addDoc(collection(db, "users", uid, "files"), {
  //   name,
  //   type:      "folder",
  //   fileType:  "",
  //   size:      0,
  //   parentId:  folderId,
  //   starred:   false,
  //   deleted:   false,
  //   createdAt: serverTimestamp(),
  // });
 
  // MOCK folder creation
  mockFiles.unshift({
    id: "folder-" + Date.now(),
    name,
    type: "folder",
    fileType: "",
    size: 0,
    starred: false,
    deleted: false,
    parentId: folderId,
    createdAt: Date.now(),
    downloadURL: "",
  });
 
  el.folderOverlay.classList.add("hidden");
  loadFiles();
}
 
// ─── RENAME ───────────────────────────────────────────────────
el.renameCancel.addEventListener("click", () => el.renameOverlay.classList.add("hidden"));
el.renameInput.addEventListener("keydown", e => { if (e.key === "Enter") doRename(); });
el.renameOk.addEventListener("click", doRename);
 
async function doRename() {
  const name = el.renameInput.value.trim();
  if (!name || !state.contextTarget) return;
 
  // ─── FIREBASE: Replace mock block below ───
  // const uid = state.currentUser.uid;
  // await updateDoc(doc(db, "users", uid, "files", state.contextTarget.id), { name });
 
  // MOCK rename
  const f = mockFiles.find(f => f.id === state.contextTarget.id);
  if (f) f.name = name;
 
  el.renameOverlay.classList.add("hidden");
  loadFiles();
}
 
// ─── STAR / UNSTAR ────────────────────────────────────────────
el.ctxStar.addEventListener("click", async () => {
  if (!state.contextTarget) return;
 
  // ─── FIREBASE: Replace mock block below ───
  // const uid = state.currentUser.uid;
  // await updateDoc(doc(db, "users", uid, "files", state.contextTarget.id), {
  //   starred: !state.contextTarget.starred
  // });
 
  // MOCK star toggle
  const f = mockFiles.find(f => f.id === state.contextTarget.id);
  if (f) f.starred = !f.starred;
  loadFiles();
});
 
// ─── DELETE / RESTORE ─────────────────────────────────────────
el.ctxDelete.addEventListener("click", async () => {
  if (!state.contextTarget) return;
 
  if (state.currentSection === "trash") {
    // Permanent delete
    if (!confirm(`Permanently delete "${state.contextTarget.name}"? This cannot be undone.`)) return;
 
    // ─── FIREBASE: Replace mock block below ───
    // const uid = state.currentUser.uid;
    // await deleteDoc(doc(db, "users", uid, "files", state.contextTarget.id));
    // if (state.contextTarget.storagePath) {
    //   try { await deleteObject(ref(storage, state.contextTarget.storagePath)); } catch {}
    // }
 
    // MOCK permanent delete
    const idx = mockFiles.findIndex(f => f.id === state.contextTarget.id);
    if (idx !== -1) mockFiles.splice(idx, 1);
 
  } else {
    // Move to trash
    // ─── FIREBASE: Replace mock block below ───
    // const uid = state.currentUser.uid;
    // await updateDoc(doc(db, "users", uid, "files", state.contextTarget.id), { deleted: true });
 
    // MOCK move to trash
    const f = mockFiles.find(f => f.id === state.contextTarget.id);
    if (f) f.deleted = true;
  }
 
  loadFiles();
});
 
// ─── STORAGE BAR ─────────────────────────────────────────────
function updateStorageBar() {
  const MAX = 5 * 1024 * 1024 * 1024; // 5 GB
 
  // ─── FIREBASE: Replace mock calculation below ───
  // const uid = state.currentUser.uid;
  // const q   = query(collection(db, "users", uid, "files"), where("deleted","==",false), where("type","!=","folder"));
  // const snap = await getDocs(q);
  // const used = snap.docs.reduce((sum, d) => sum + (d.data().size || 0), 0);
 
  // MOCK storage calc
  const used = mockFiles.filter(f => !f.deleted && f.type !== "folder").reduce((s, f) => s + f.size, 0);
  const pct  = Math.min(100, (used / MAX) * 100).toFixed(1);
 
  el.storageFill.style.width   = pct + "%";
  el.storagePct.textContent    = pct + "%";
  el.storageDetail.textContent = `${formatBytes(used)} of 5 GB used`;
}
 
 
 
// ══════════════════════════════════════════════════════════════
//  SECTION 4 — UI & RENDERING (No Firebase changes needed here)
// ══════════════════════════════════════════════════════════════
 
// ─── RENDER FILES ─────────────────────────────────────────────
function renderFiles(files) {
  // Apply sorting
  const sort   = el.sortSelect.value;
  const sorted = [...files].sort((a, b) => {
    // Folders always first
    if (a.type === "folder" && b.type !== "folder") return -1;
    if (b.type === "folder" && a.type !== "folder") return  1;
 
    switch (sort) {
      case "name-asc":   return a.name.localeCompare(b.name);
      case "name-desc":  return b.name.localeCompare(a.name);
      case "size-desc":  return b.size - a.size;
      case "size-asc":   return a.size - b.size;
      case "date-asc":   return (a.createdAt || 0) - (b.createdAt || 0);
      case "date-desc":
      default:           return (b.createdAt || 0) - (a.createdAt || 0);
    }
  });
 
  el.filesContainer.innerHTML = "";
 
  // Empty state
  if (sorted.length === 0) {
    el.emptyState.classList.remove("hidden");
    el.itemCount.textContent = "";
    setEmptyMessage();
    return;
  }
  el.emptyState.classList.add("hidden");
  el.itemCount.textContent = sorted.length + " " + (sorted.length === 1 ? "item" : "items");
 
  // Render cards
  sorted.forEach(file => {
    const card = buildCard(file);
    el.filesContainer.appendChild(card);
  });
}
 
function setEmptyMessage() {
  const msgs = {
    "my-files": ["Nothing here yet",  "Upload your first file to get started"],
    "recent":   ["No recent files",   "Files you access will appear here"],
    "starred":  ["No starred files",  "Star important files to find them quickly"],
    "shared":   ["Nothing shared",    "Files shared with you will appear here"],
    "trash":    ["Trash is empty",    "Deleted files will appear here"],
  };
  const [title, sub] = msgs[state.currentSection] || msgs["my-files"];
  el.emptyTitle.textContent = title;
  el.emptySub.textContent   = sub;
  el.emptyUploadBtn.style.display = state.currentSection === "my-files" ? "inline-flex" : "none";
}
 
// ─── BUILD FILE CARD ──────────────────────────────────────────
function buildCard(file) {
  const card    = document.createElement("div");
  const isGrid  = state.view === "grid";
  const typeInfo = getTypeInfo(file);
 
  card.className = "file-card" + (file.type === "folder" ? " folder" : "");
  card.dataset.id = file.id;
 
  let mediaHtml = "";
  if (isGrid && file.fileType.startsWith("image/") && file.downloadURL) {
    mediaHtml = `<img class="file-thumb" src="${file.downloadURL}" alt="${file.name}" loading="lazy" onerror="this.style.display='none'" />`;
  } else {
    mediaHtml = `<div class="file-icon-box ${typeInfo.color}">${typeInfo.emoji}</div>`;
  }
 
  card.innerHTML = `
    ${file.starred ? '<span class="star-badge">★</span>' : ""}
    ${mediaHtml}
    <div class="file-name" title="${file.name}">${file.name}</div>
    <div class="file-meta">${file.type === "folder" ? "Folder" : formatBytes(file.size)}</div>
  `;
 
  card.addEventListener("click",       () => handleCardClick(file));
  card.addEventListener("contextmenu", e  => { e.preventDefault(); showCtxMenu(e, file); });
 
  return card;
}
 
function getTypeInfo(file) {
  if (file.type === "folder")                    return { emoji: "📁", color: "t-fol" };
  const t = file.fileType || "";
  if (t.startsWith("image/"))                    return { emoji: "🖼️", color: "t-img" };
  if (t.startsWith("video/"))                    return { emoji: "🎬", color: "t-vid" };
  if (t.startsWith("audio/"))                    return { emoji: "🎵", color: "t-aud" };
  if (t === "application/pdf")                   return { emoji: "📄", color: "t-pdf" };
  if (t.includes("word") || t.includes("document")) return { emoji: "📝", color: "t-doc" };
  if (t.includes("zip") || t.includes("rar"))    return { emoji: "🗜️", color: "t-zip" };
  return { emoji: "📎", color: "t-gen" };
}
 
function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const k = 1024;
  const s = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + s[i];
}
 
// ─── CARD CLICK ───────────────────────────────────────────────
function handleCardClick(file) {
  if (file.type === "folder") {
    state.currentPath.push({ id: file.id, name: file.name });
    updateBreadcrumb();
    loadFiles();
  } else {
    openPreview(file);
  }
}
 
// ─── BREADCRUMB ───────────────────────────────────────────────
function updateBreadcrumb() {
  el.breadcrumb.innerHTML = "";
 
  const labels = {
    "my-files": "My Files", "recent": "Recent",
    "starred":  "Starred",  "shared": "Shared", "trash": "Trash",
  };
  const rootLabel = labels[state.currentSection] || "My Files";
 
  // Root crumb
  const root = document.createElement("span");
  root.className   = "crumb" + (state.currentPath.length === 0 ? " active" : "");
  root.textContent = rootLabel;
  root.addEventListener("click", () => { state.currentPath = []; updateBreadcrumb(); loadFiles(); });
  el.breadcrumb.appendChild(root);
 
  // Folder crumbs
  state.currentPath.forEach((crumb, i) => {
    const sep = document.createElement("span");
    sep.className   = "crumb-sep";
    sep.textContent = " › ";
    el.breadcrumb.appendChild(sep);
 
    const c = document.createElement("span");
    c.className   = "crumb" + (i === state.currentPath.length - 1 ? " active" : "");
    c.textContent = crumb.name;
    c.addEventListener("click", () => {
      state.currentPath = state.currentPath.slice(0, i + 1);
      updateBreadcrumb();
      loadFiles();
    });
    el.breadcrumb.appendChild(c);
  });
}
 
// ─── CONTEXT MENU ────────────────────────────────────────────
function showCtxMenu(e, file) {
  state.contextTarget = file;
  el.ctxMenu.classList.remove("hidden");
 
  // Position smartly
  const x = Math.min(e.clientX, window.innerWidth  - 180);
  const y = Math.min(e.clientY, window.innerHeight - 190);
  el.ctxMenu.style.left = x + "px";
  el.ctxMenu.style.top  = y + "px";
 
  el.ctxStarLabel.textContent  = file.starred ? "Remove from Starred" : "Add to Starred";
  el.ctxDeleteLabel.textContent = state.currentSection === "trash" ? "Delete Forever" : "Move to Trash";
  el.ctxDownload.style.display  = file.type === "folder" ? "none" : "flex";
  el.ctxOpen.style.display      = file.type === "folder" ? "flex" : "none";
}
 
el.ctxOpen.addEventListener("click", () => {
  if (!state.contextTarget) return;
  handleCardClick(state.contextTarget);
});
 
el.ctxDownload.addEventListener("click", () => {
  if (!state.contextTarget?.downloadURL) {
    alert("Download is only available for real files uploaded to Firebase Storage.");
    return;
  }
  const a    = document.createElement("a");
  a.href     = state.contextTarget.downloadURL;
  a.download = state.contextTarget.name;
  a.target   = "_blank";
  a.click();
});
 
el.ctxRename.addEventListener("click", () => {
  el.renameInput.value = state.contextTarget?.name || "";
  el.renameOverlay.classList.remove("hidden");
  setTimeout(() => el.renameInput.focus(), 50);
});
 
document.addEventListener("click", e => {
  if (!el.ctxMenu.contains(e.target)) el.ctxMenu.classList.add("hidden");
});
 
// ─── PREVIEW MODAL ────────────────────────────────────────────
function openPreview(file) {
  el.previewFilename.textContent = file.name;
  el.previewFilesize.textContent = formatBytes(file.size);
  el.previewDl.onclick = () => {
    if (!file.downloadURL) { alert("Download available after Firebase is connected."); return; }
    const a = document.createElement("a");
    a.href     = file.downloadURL;
    a.download = file.name;
    a.target   = "_blank";
    a.click();
  };
 
  const body = el.previewBody;
  body.innerHTML = "";
  const t = file.fileType || "";
 
  if (t.startsWith("image/") && file.downloadURL) {
    const img = document.createElement("img");
    img.src = file.downloadURL;
    img.alt = file.name;
    body.appendChild(img);
  } else if (t.startsWith("video/") && file.downloadURL) {
    const v = document.createElement("video");
    v.src      = file.downloadURL;
    v.controls = true;
    v.style.maxWidth = "100%";
    body.appendChild(v);
  } else if (t.startsWith("audio/") && file.downloadURL) {
    const a = document.createElement("audio");
    a.src      = file.downloadURL;
    a.controls = true;
    body.appendChild(a);
  } else if (t === "application/pdf" && file.downloadURL) {
    const iframe = document.createElement("iframe");
    iframe.src = file.downloadURL;
    body.appendChild(iframe);
  } else {
    const info = getTypeInfo(file);
    body.innerHTML = `
      <div class="no-prev">
        <div style="font-size:4rem">${info.emoji}</div>
        <p style="font-size:0.95rem;font-weight:600">${file.name}</p>
        <p style="font-size:0.82rem;color:var(--t3)">
          ${file.downloadURL ? "Click Download to save this file." : "Preview available after Firebase is connected."}
        </p>
      </div>`;
  }
 
  el.previewOverlay.classList.remove("hidden");
}
 
el.closePreview.addEventListener("click",  () => el.previewOverlay.classList.add("hidden"));
el.previewOverlay.addEventListener("click", e => { if (e.target === el.previewOverlay) el.previewOverlay.classList.add("hidden"); });
 
// ─── DRAG & DROP ─────────────────────────────────────────────
const scrollArea = document.querySelector(".scroll-area");
let dragCounter  = 0;
 
scrollArea.addEventListener("dragenter", e => { e.preventDefault(); dragCounter++; el.dragOverlay.classList.remove("hidden"); });
scrollArea.addEventListener("dragleave", e => { dragCounter--; if (dragCounter <= 0) { dragCounter = 0; el.dragOverlay.classList.add("hidden"); } });
scrollArea.addEventListener("dragover",  e => e.preventDefault());
scrollArea.addEventListener("drop", e => {
  e.preventDefault();
  dragCounter = 0;
  el.dragOverlay.classList.add("hidden");
  const files = Array.from(e.dataTransfer.files);
  if (files.length) uploadFiles(files);
});
 
// ─── SEARCH ───────────────────────────────────────────────────
el.searchInput.addEventListener("input", () => {
  const q = el.searchInput.value.toLowerCase().trim();
  if (!q) { renderFiles(state.files); return; }
  renderFiles(state.files.filter(f => f.name.toLowerCase().includes(q)));
});
 
// ─── SORT ─────────────────────────────────────────────────────
el.sortSelect.addEventListener("change", () => renderFiles(state.files));
 
// ─── VIEW TOGGLE ─────────────────────────────────────────────
el.gridBtn.addEventListener("click", () => {
  state.view = "grid";
  el.filesContainer.className = "files-grid";
  el.gridBtn.classList.add("active");
  el.listBtn.classList.remove("active");
  renderFiles(state.files);
});
el.listBtn.addEventListener("click", () => {
  state.view = "list";
  el.filesContainer.className = "files-list";
  el.listBtn.classList.add("active");
  el.gridBtn.classList.remove("active");
  renderFiles(state.files);
});
 
// ─── SIDEBAR NAV ──────────────────────────────────────────────
el.navItems.forEach(item => {
  item.addEventListener("click", e => {
    e.preventDefault();
    loadSection(item.dataset.section);
  });
});
 
// ─── UPLOAD PANEL CONTROLS ────────────────────────────────────
el.upMinimize.addEventListener("click", () => {
  const isHidden = el.upItems.style.display === "none";
  el.upItems.style.display = isHidden ? "" : "none";
  el.upMinimize.textContent = isHidden ? "−" : "+";
});
el.upClose.addEventListener("click", () => {
  el.upPanel.classList.add("hidden");
  el.upItems.innerHTML = "";
});
 
// ─── MOBILE SIDEBAR ───────────────────────────────────────────
el.hamburger.addEventListener("click", () => el.sidebar.classList.toggle("open"));
document.addEventListener("click", e => {
  if (!el.sidebar.contains(e.target) && !el.hamburger.contains(e.target)) {
    el.sidebar.classList.remove("open");
  }
});
 
// ─── CLOSE MODALS ON OVERLAY CLICK ───────────────────────────
el.renameOverlay.addEventListener("click", e => { if (e.target === el.renameOverlay) el.renameOverlay.classList.add("hidden"); });
el.folderOverlay.addEventListener("click", e => { if (e.target === el.folderOverlay) el.folderOverlay.classList.add("hidden"); });
 
// ─── KEYBOARD SHORTCUTS ───────────────────────────────────────
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    el.previewOverlay.classList.add("hidden");
    el.renameOverlay.classList.add("hidden");
    el.folderOverlay.classList.add("hidden");
    el.ctxMenu.classList.add("hidden");
  }
  // Ctrl/Cmd + K → focus search
  if ((e.ctrlKey || e.metaKey) && e.key === "k") {
    e.preventDefault();
    el.searchInput.focus();
  }
});
 
// ── DONE ──────────────────────────────────────────────────────
// The app is fully working locally with mock data.
// When you're ready to connect Firebase, follow the TODO comments
// in SECTION 1, 2, and 3 above — each one is clearly labeled.