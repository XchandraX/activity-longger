// Firebase Imports
import { initializeApp, } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  initializeFirestore,
  CACHE_SIZE_UNLIMITED,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  writeBatch,
  where,
  getDocs,
  Timestamp,
  setDoc,
  increment,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBellkuYYMVFULmdBb8zPJ6CcwZOywpQyw",
  authDomain: "activity-logger-8576d.firebaseapp.com",
  projectId: "activity-logger-8576d",
  storageBucket: "activity-logger-8576d.appspot.com",
  messagingSenderId: "841728671208",
  appId: "1:841728671208:web:abc88d3a9593b7453c385d",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED
});

const auth = getAuth(app);

// === DOM ELEMENTS ===
const landingPage = document.getElementById("landing-page");
const tombolMulai = document.getElementById("tombol-mulai");
const loginOverlay = document.getElementById("login-overlay");
const appContainer = document.getElementById("app-container");
const inputEmail = document.getElementById("input-email");
const inputPassword = document.getElementById("input-password");
const tombolLogin = document.getElementById("tombol-login");
const tombolDaftar = document.getElementById("tombol-daftar");
const tombolLoginGoogle = document.getElementById("tombol-login-google");
const tombolLogout = document.getElementById("tombol-logout");
const authErrorElement = document.getElementById("auth-error");
const namaUserElement = document.getElementById("nama-user");
const tombolEditNama = document.getElementById("tombol-edit-nama");
const tombolPengaturan = document.getElementById("tombol-pengaturan");
const pengaturanOverlay = document.getElementById("pengaturan-overlay");
const tombolTutupPengaturan = document.getElementById(
  "tombol-tutup-pengaturan"
);
const checkTampilTimer = document.getElementById("pengaturan-tampil-timer");
const grupTombolUkuran = document.querySelectorAll(".pengaturan-ukuran-tombol");
const inputWarnaTimer = document.getElementById("pengaturan-warna-timer");
const tanggalHariIniElement = document.getElementById("tanggal-hari-ini");
const tombolHariSebelumnya = document.getElementById("tombol-hari-sebelumnya");
const tombolHariBerikutnya = document.getElementById("tombol-hari-berikutnya");
const inputProyek = document.getElementById("input-proyek");
const pilihProyekInduk = document.getElementById("pilih-proyek-induk");
const tombolTambahProyek = document.getElementById("tombol-tambah-proyek");
const inputKegiatan = document.getElementById("input-kegiatan");
const inputWaktu = document.getElementById("input-waktu");
const inputKategori = document.getElementById("input-kategori");
const pilihProyekKegiatan = document.getElementById("pilih-proyek-kegiatan");
const tombolTambah = document.getElementById("tombol-tambah");
const daftarProyekContainer = document.getElementById(
  "daftar-proyek-container"
);
const daftarKegiatanLainElement = document.getElementById(
  "daftar-kegiatan-lain"
);
const loadingElement = document.getElementById("loading");
const pesanKosongElement = document.getElementById("pesan-kosong");
const tombolGenerate = document.getElementById("tombol-generate-teks");
const tombolSalin = document.getElementById("tombol-salin-teks");
const hasilTeks = document.getElementById("hasil-teks");
const statistikChartCanvas = document
  .getElementById("statistik-chart")
  .getContext("2d");
const kontenStatistikTeks = document.getElementById("konten-statistik-teks");
const customAlertOverlay = document.getElementById("custom-alert-overlay");
const customAlertBox = document.getElementById("custom-alert-box");
const customAlertTitle = document.getElementById("custom-alert-title");
const customAlertMessage = document.getElementById("custom-alert-message");
const customPromptInputContainer = document.getElementById(
  "custom-prompt-input-container"
);
const customAlertButtons = document.getElementById("custom-alert-buttons");
const searchInput = document.getElementById("search-input");
const filterKategori = document.getElementById("filter-kategori");
const filterStatus = document.getElementById("filter-status");
const tombolCari = document.getElementById("tombol-cari");
const tombolResetFilter = document.getElementById("tombol-reset-filter");
const tombolPencarianLanjutan = document.getElementById("tombol-pencarian-lanjutan");
const tombolExportJson = document.getElementById("tombol-export-json");
const tombolExportCsv = document.getElementById("tombol-export-csv");
const tombolImportData = document.getElementById("tombol-import-data");
const fileImportInput = document.getElementById("file-import");
// === DOM ELEMENTS FOR EXPORT/IMPORT ===
const tombolExportPdf = document.getElementById("tombol-export-pdf");
const tombolBackupSemua = document.getElementById("tombol-backup-semua");
// === POMODORO SETTINGS ===
const POMODORO_SETTINGS = {
  FOCUS_DURATION: 25 * 60 * 1000, // 25 menit dalam milidetik
  SHORT_BREAK_DURATION: 5 * 60 * 1000, // 5 menit
  LONG_BREAK_DURATION: 15 * 60 * 1000, // 15 menit
  SESSIONS_BEFORE_LONG_BREAK: 4
};

let pomodoroState = {
  currentSession: 0,
  isFocusTime: true,
  isRunning: false,
  startTime: null,
  endTime: null,
  timerInterval: null,
  completedSessions: []
};

// === POMODORO UI ELEMENTS ===
let pomodoroButton = null;
let pomodoroModal = null;

// === PENGINGAT WAKTU MULAI ===
let reminderInterval = null;
const REMINDER_CHECK_INTERVAL = 5 * 60 * 1000; // Cek setiap 5 menit


// === APP STATE ===
let currentUser = null;
let userProfile = {};
let allActivities = [];
let daftarProyek = [];
let timerInterval = null;
let statistikChart = null;
let unsubscribeProfile = () => { };
let unsubscribeProjects = () => { };
let unsubscribeActivities = () => { };
let currentDate = new Date();
let eventListenersAttached = false;
let sortableInstances = [];
let searchState = {
  keyword: "",
  kategori: "all",
  status: "all",
  dateRange: null,
  projectId: null
};
let pengaturan = {};
const pengaturanDefault = {
  tampilTimer: true,
  ukuranTimer: "normal",
  warnaTimer: "#334155", // slate-700
};
// === DARK MODE SETUP ===
function setupDarkMode() {
  const darkModeToggle = document.getElementById("dark-mode-toggle");
  const lightIcon = document.getElementById("theme-toggle-light-icon");
  const darkIcon = document.getElementById("theme-toggle-dark-icon");
  if (!darkModeToggle || !lightIcon || !darkIcon) return;

  const applyTheme = (isDark) => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      lightIcon.classList.remove("hidden");
      darkIcon.classList.add("hidden");
    } else {
      document.documentElement.classList.remove("dark");
      lightIcon.classList.add("hidden");
      darkIcon.classList.remove("hidden");
    }
  };

  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDarkMode =
    savedTheme === "dark" || (savedTheme === null && prefersDark);
  applyTheme(isDarkMode);

  darkModeToggle.addEventListener("click", () => {
    const isCurrentlyDark = document.documentElement.classList.contains("dark");
    applyTheme(!isCurrentlyDark);
    localStorage.setItem("theme", isCurrentlyDark ? "light" : "dark");
  });
}

setupDarkMode();

// --- Main function to run the application ---
function runApp() {
  setupDarkMode();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;
      landingPage.style.display = "none";
      loginOverlay.style.display = "none";
      appContainer.classList.remove("hidden");
      setupAplikasi();
    } else {
      currentUser = null;
      userProfile = {};
      landingPage.style.display = "flex";
      loginOverlay.style.display = "none";
      appContainer.classList.add("hidden");
      unsubscribeAll();
      allActivities = [];
      daftarProyek = [];
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    }
  });

  tombolMulai.addEventListener("click", () => {
    landingPage.style.display = "none";
    loginOverlay.style.display = "flex";
  });

  tombolLogin.addEventListener("click", () =>
    signInWithEmailAndPassword(
      auth,
      inputEmail.value,
      inputPassword.value
    ).catch(handleAuthError)
  );
  tombolDaftar.addEventListener("click", () =>
    createUserWithEmailAndPassword(
      auth,
      inputEmail.value,
      inputPassword.value
    ).catch(handleAuthError)
  );
  tombolLoginGoogle.addEventListener("click", () => {
    // Clear previous errors
    authErrorElement.textContent = "";

    // Show loading state
    const originalText = tombolLoginGoogle.innerHTML;
    tombolLoginGoogle.innerHTML = '<span>Loading...</span>';
    tombolLoginGoogle.disabled = true;

    signInWithPopup(auth, new GoogleAuthProvider())
      .then(() => {
        // Reset button state on success
        tombolLoginGoogle.innerHTML = originalText;
        tombolLoginGoogle.disabled = false;
      })
      .catch((error) => {
        // Reset button state on error
        tombolLoginGoogle.innerHTML = originalText;
        tombolLoginGoogle.disabled = false;

        // Handle error
        handleAuthErrorEnhanced(error);

        // Special handling for popup errors
        if (error.code === 'auth/popup-blocked') {
          showCustomAlert(
            "Popup login diblokir oleh browser Anda.\n\n" +
            "Silakan izinkan popup untuk situs ini:\n" +
            "1. Klik ikon gembok di address bar\n" +
            "2. Pilih 'Izinkan popup'\n" +
            "3. Coba login lagi",
            "Popup Diblokir"
          );
        }
      });
  });
  tombolLogout.addEventListener("click", () =>
    signOut(auth).catch(handleAuthError)
  );
  tombolEditNama.addEventListener("click", ubahNamaTampilan);
}

function setupAplikasi() {
  try {
    if (!eventListenersAttached) {
      setupAppEventListeners();
      eventListenersAttached = true;
    }
    muatPengaturan();
    loadInitialDataAndSetupListeners();
    setTanggal(new Date());
    if (!timerInterval) {
      timerInterval = setInterval(timerLoop, 1000);
    }
    requestNotificationPermission();
    setupSearchEventListeners();
    setupMobileOptimization();
    setupNetworkMonitoring();
    setupErrorReportingUI();
    setupExportImportListeners();
    setupAnalytics();
    setupBackupListeners();
    setupPomodoroAndReminders();
    
  } catch (error) {
    console.error('Error in setupAplikasi:', error);
    errorHandler.logError(ErrorTypes.UNKNOWN, error, { context: 'setupAplikasi' });
  }
}

function timerLoop() {
  let activeTaskForTitle = null;
  const sekarang = Date.now();

  allActivities.forEach((kegiatan) => {
    const timerElement = document.getElementById(`timer-${kegiatan.id}`);
    if (!timerElement) return;

    if (kegiatan.status === "tracking" && kegiatan.lastStartTime) {
      if (!activeTaskForTitle) activeTaskForTitle = kegiatan;

      if (kegiatan.isFocusing) {
        // Mode Fokus (Countdown)
        if (kegiatan.focusEndTime) {
          const sisaWaktu = kegiatan.focusEndTime.toDate().getTime() - sekarang;
          if (sisaWaktu > 0) {
            timerElement.textContent = `Fokus: ${formatSisaWaktu(sisaWaktu)}`;
          } else {
            timerElement.textContent = "Fokus Selesai!";
            if (kegiatan.status === "tracking") {
              // Mencegah update berulang
              kirimNotifikasiFokusSelesai(kegiatan);
              const docRef = doc(
                db,
                "users",
                currentUser.uid,
                "activities",
                kegiatan.id
              );
              const elapsed =
                Date.now() - kegiatan.lastStartTime.toDate().getTime();
              safeUpdateDoc(docRef, {
                status: "paused", // Otomatis pause saat waktu habis
                durasi: increment(elapsed),
                lastStartTime: null,
              });
            }
          }
        }
      } else {
        // Mode Tracker (Stopwatch)
        const elapsed = sekarang - kegiatan.lastStartTime.toDate().getTime();
        const totalDurasi = (kegiatan.durasi || 0) + elapsed;
        timerElement.textContent = formatDurasi(totalDurasi);
      }
    } else if (kegiatan.status === "paused") {
      // Tampilkan waktu terakhir saat di-pause
      if (kegiatan.isFocusing) {
        timerElement.textContent = `Fokus: ${formatSisaWaktu(
          kegiatan.remainingTime
        )}`;
      } else {
        timerElement.textContent = formatDurasi(kegiatan.durasi || 0);
      }
    } else {
      // Idle
      timerElement.textContent = formatDurasi(kegiatan.durasi || 0);
    }

    // ✅ TAMBAHKAN KODE INI untuk notifikasi tugas terlalu lama
    if (kegiatan.status === 'tracking' && kegiatan.lastStartTime) {
      const runningTime = Date.now() - kegiatan.lastStartTime.toDate().getTime();

      // Notify if task has been running for more than 2 hours
      if (runningTime > 2 * 60 * 60 * 1000) {
        // Cek agar tidak spam notifikasi
        const lastNotification = kegiatan.lastLongTaskNotification || 0;
        if (Date.now() - lastNotification > 30 * 60 * 1000) { // Setiap 30 menit
          showNotification(
            '⏰ Istirahat Sebentar?',
            `Anda telah mengerjakan "${kegiatan.teks}" selama lebih dari 2 jam. Pertimbangkan untuk istirahat sejenak!`
          );
          // Simpan waktu notifikasi terakhir
          kegiatan.lastLongTaskNotification = Date.now();
        }
      }
    }
  });

  if (activeTaskForTitle) {
    document.title = `Tracking... | ${activeTaskForTitle.teks}`;
  } else if (!document.title.includes("Activity Logger")) {
    document.title = "Activity Logger Pro";
  }
}


// === ERROR HANDLING SYSTEM ===
const ErrorTypes = {
  NETWORK: "network",
  FIREBASE: "firebase",
  VALIDATION: "validation",
  PERMISSION: "permission",
  UNKNOWN: "unknown"
};

class ErrorHandler {
  constructor() {
    this.errors = [];
    this.maxErrors = 100;
  }

  logError(type, error, context = {}) {
    const errorEntry = {
      id: Date.now(),
      type,
      message: error.message || String(error),
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context,
      user: currentUser?.email || "anonymous"
    };

    this.errors.push(errorEntry);

    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Log to console
    console.error(`[${type}]`, error, context);

    // Show user-friendly message
    this.showUserMessage(type, error, context);

    // Send to server if online
    if (navigator.onLine && type !== ErrorTypes.NETWORK) {
      this.reportToServer(errorEntry);  // <-- PASTIKAN memanggil this.reportToServer
    }

    return errorEntry;
  }

  showUserMessage(type, error, context) {
    let title = "Terjadi Kesalahan";
    let message = "";

    switch (type) {
      case ErrorTypes.NETWORK:
        title = "Koneksi Bermasalah";
        message = "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
        break;

      case ErrorTypes.FIREBASE:
        title = "Database Error";
        message = "Gagal mengakses database. Coba refresh halaman.";
        break;

      case ErrorTypes.VALIDATION:
        title = "Input Tidak Valid";
        message = error.message || "Data yang dimasukkan tidak valid.";
        break;

      case ErrorTypes.PERMISSION:
        title = "Izin Diperlukan";
        message = "Aplikasi memerlukan izin untuk melanjutkan.";
        break;

      default:
        message = "Terjadi kesalahan yang tidak terduga. Silakan coba lagi.";
    }

    // Don't show too many alerts
    if (this.shouldShowAlert()) {
      showCustomAlert(message, title);
    }
  }

  async reportToServer(errorEntry) {
    try {
      // Nonaktifkan sementara atau ganti dengan console.log
      console.log('[Error Report]:', errorEntry);

      // Opsi: Simpan ke localStorage untuk debugging
      const errorLogs = JSON.parse(localStorage.getItem('app_errors') || '[]');
      errorLogs.push(errorEntry);
      if (errorLogs.length > 50) errorLogs.shift();
      localStorage.setItem('app_errors', JSON.stringify(errorLogs));

      // // Jika ingin mengaktifkan nanti, uncomment ini:
      // await fetch('https://api.your-error-service.com/log', {
      //     method: 'POST',
      //     headers: {
      //         'Content-Type': 'application/json',
      //     },
      //     body: JSON.stringify(errorEntry)
      // });

    } catch (err) {
      // Silently fail
      console.warn('Failed to report error:', err);
    }
  }

  shouldShowAlert() {
    // Don't show alerts for frequent errors
    const lastMinuteErrors = this.errors.filter(e =>
      Date.now() - new Date(e.timestamp).getTime() < 60000
    );

    return lastMinuteErrors.length < 3;
  }

  getRecentErrors(limit = 10) {
    return this.errors.slice(-limit).reverse();
  }

  clearErrors() {
    this.errors = [];
  }
}



// Global error handler instance
const errorHandler = new ErrorHandler();

// === ENHANCED ERROR HANDLING FUNCTIONS ===
async function safeFirestoreOperation(operation, context = {}) {
  try {
    return await operation();
  } catch (error) {
    errorHandler.logError(ErrorTypes.FIREBASE, error, context);
    throw error;
  }
}

function validateInput(input, rules) {
  const errors = [];

  if (rules.required && !input.trim()) {
    errors.push("Field ini wajib diisi");
  }

  if (rules.minLength && input.length < rules.minLength) {
    errors.push(`Minimal ${rules.minLength} karakter`);
  }

  if (rules.maxLength && input.length > rules.maxLength) {
    errors.push(`Maksimal ${rules.maxLength} karakter`);
  }

  if (rules.email && !isValidEmail(input)) {
    errors.push("Format email tidak valid");
  }

  if (errors.length > 0) {
    const error = new Error(errors.join(", "));
    errorHandler.logError(ErrorTypes.VALIDATION, error, { input, rules });
    throw error;
  }

  return true;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// === ENHANCED AUTH ERROR HANDLING ===
function handleAuthErrorEnhanced(error) {
  let userMessage = "Email atau password salah atau sudah terdaftar.";

  switch (error.code) {
    case 'auth/invalid-email':
      userMessage = "Format email tidak valid.";
      break;
    case 'auth/user-disabled':
      userMessage = "Akun ini telah dinonaktifkan.";
      break;
    case 'auth/user-not-found':
      userMessage = "Akun tidak ditemukan.";
      break;
    case 'auth/wrong-password':
      userMessage = "Password salah.";
      break;
    case 'auth/email-already-in-use':
      userMessage = "Email sudah terdaftar.";
      break;
    case 'auth/weak-password':
      userMessage = "Password terlalu lemah (minimal 6 karakter).";
      break;
    case 'auth/network-request-failed':
      userMessage = "Gagal terhubung ke server. Periksa koneksi internet.";
      errorHandler.logError(ErrorTypes.NETWORK, error);
      break;
    case 'auth/too-many-requests':
      userMessage = "Terlalu banyak percobaan gagal. Coba lagi nanti.";
      break;
    case 'auth/popup-blocked':
      userMessage = "Popup login diblokir browser. Izinkan popup untuk situs ini.";
      break;
    case 'auth/cancelled-popup-request':
      userMessage = "Popup login dibatalkan atau terlalu banyak permintaan.";
      break;
    default:
      userMessage = `Terjadi kesalahan: ${error.message || error.code}`;
  }

  authErrorElement.textContent = userMessage;
  errorHandler.logError(ErrorTypes.FIREBASE, error, { code: error.code });

  // Untuk popup errors, tampilkan alert yang lebih jelas
  if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
    setTimeout(() => {
      showCustomAlert(
        `${userMessage}\n\nTips: Izinkan popup untuk situs ini di pengaturan browser Anda.`,
        "Login dengan Google"
      );
    }, 500);
  }
}

// === ENHANCED NETWORK HANDLING ===
function setupNetworkMonitoring() {
  function updateOnlineStatus() {
    if (!navigator.onLine) {
      errorHandler.logError(ErrorTypes.NETWORK, new Error("Offline detected"));

      // Show persistent offline indicator
      showOfflineIndicator();

      // Queue operations for later sync
      queueOfflineOperations();
    } else {
      hideOfflineIndicator();

      // Sync queued operations
      syncQueuedOperations();
    }
  }

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);

  // Initial check
  updateOnlineStatus();
}

function showOfflineIndicator() {
  let indicator = document.getElementById("offline-indicator");

  if (!indicator) {
    indicator = document.createElement("div");
    indicator.id = "offline-indicator";
    indicator.className = "fixed bottom-0 left-0 right-0 bg-red-600 text-white text-center py-2 z-50";
    indicator.innerHTML = `
            <div class="container mx-auto flex items-center justify-center gap-2">
                <span>📶</span>
                <span>Anda sedang offline. Data akan disinkron saat online.</span>
                <button id="retry-sync" class="ml-2 px-3 py-1 bg-white text-red-600 rounded text-sm">
                    Coba Sync
                </button>
            </div>
        `;
    document.body.appendChild(indicator);

    // Add retry button handler
    document.getElementById("retry-sync")?.addEventListener("click", () => {
      if (navigator.onLine) {
        syncQueuedOperations();
      }
    });
  }
}

function hideOfflineIndicator() {
  const indicator = document.getElementById("offline-indicator");
  if (indicator) {
    indicator.remove();
  }
}

// === OFFLINE OPERATIONS QUEUE ===
let offlineQueue = [];

function queueOfflineOperations() {
  // Store operations in localStorage for persistence
  localStorage.setItem("offlineQueue", JSON.stringify(offlineQueue));
}

async function syncQueuedOperations() {
  if (offlineQueue.length === 0) return;

  showCustomAlert("Menyinkronkan data offline...", "Sinkronisasi");

  const queue = [...offlineQueue];
  offlineQueue = [];

  for (const operation of queue) {
    try {
      await executeQueuedOperation(operation);
    } catch (error) {
      errorHandler.logError(ErrorTypes.FIREBASE, error, { operation });
      // Re-queue failed operations
      offlineQueue.push(operation);
    }
  }

  if (offlineQueue.length === 0) {
    showCustomAlert("Semua data berhasil disinkronkan!", "Sinkronisasi Selesai");
  } else {
    showCustomAlert(`Gagal menyinkronkan ${offlineQueue.length} operasi`, "Sinkronisasi");
  }

  queueOfflineOperations();
}

async function executeQueuedOperation(operation) {
  // Implement based on operation type
  switch (operation.type) {
    case "addActivity":
      await safeAddDoc(collection(db, "users", currentUser.uid, "activities"), operation.data);
      break;
    case "updateActivity":
      await safeUpdateDoc(doc(db, "users", currentUser.uid, "activities", operation.id), operation.data);
      break;
    case "deleteActivity":
      await safeDeleteDoc(doc(db, "users", currentUser.uid, "activities", operation.id));
      break;
  }
}

// === ENHANCED FUNCTIONS WITH ERROR HANDLING ===
async function tambahKegiatanEnhanced() {
  try {
    // Validate input
    validateInput(inputKegiatan.value.trim(), {
      required: true,
      minLength: 3,
      maxLength: 200
    });

    // Proceed with operation
    return await tambahKegiatan();

  } catch (error) {
    // Error already logged by validateInput
    return null;
  }
}

async function tambahProyekEnhanced() {
  try {
    validateInput(inputProyek.value.trim(), {
      required: true,
      minLength: 2,
      maxLength: 100
    });

    return await tambahProyek();

  } catch (error) {
    return null;
  }
}

// === GLOBAL ERROR CATCHER ===
window.addEventListener("error", (event) => {
  errorHandler.logError(ErrorTypes.UNKNOWN, event.error, {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

window.addEventListener("unhandledrejection", (event) => {
  errorHandler.logError(ErrorTypes.UNKNOWN, event.reason, {
    type: "unhandledrejection"
  });
});

// === ERROR REPORTING UI (for debugging) ===
function setupErrorReportingUI() {
  // Add error log viewer (for debugging only)
  if (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.includes("local")) {

    const errorButton = document.createElement("button");
    errorButton.textContent = "⚠️";
    errorButton.className = "fixed bottom-20 right-4 bg-yellow-500 text-white rounded-full w-10 h-10 flex items-center justify-center z-50";
    errorButton.title = "View Errors";
    errorButton.onclick = showErrorLog;
    document.body.appendChild(errorButton);
  }
}

async function showErrorLog() {
  const errors = errorHandler.getRecentErrors(20);

  const errorList = errors.map(err => `
        <div class="border-b border-slate-200 dark:border-slate-700 py-2">
            <div class="flex justify-between">
                <span class="font-mono text-sm">${new Date(err.timestamp).toLocaleTimeString()}</span>
                <span class="px-2 py-1 text-xs rounded ${getErrorTypeColor(err.type)}">${err.type}</span>
            </div>
            <div class="text-sm text-slate-600 dark:text-slate-400 mt-1">${err.message}</div>
            ${err.context ? `<div class="text-xs text-slate-500 mt-1">${JSON.stringify(err.context)}</div>` : ''}
        </div>
    `).join('');

  const htmlContent = `
        <div class="space-y-2 max-h-96 overflow-y-auto">
            <div class="flex justify-between items-center">
                <h4 class="font-bold">Error Log (${errors.length})</h4>
                <button id="clear-errors" class="text-xs bg-red-500 text-white px-2 py-1 rounded">Clear</button>
            </div>
            ${errorList}
        </div>
    `;

  const result = await showCustomAlertWithForm("Error Log", htmlContent, ["Tutup"]);

  if (result === "clear") {
    errorHandler.clearErrors();
  }
}

function getErrorTypeColor(type) {
  const colors = {
    network: "bg-blue-100 text-blue-800",
    firebase: "bg-red-100 text-red-800",
    validation: "bg-yellow-100 text-yellow-800",
    permission: "bg-purple-100 text-purple-800",
    unknown: "bg-slate-100 text-slate-800"
  };

  return colors[type] || colors.unknown;
}

// === INTEGRATE WITH EXISTING CODE ===
// Replace original auth error handler
function handleAuthError(error) {
  handleAuthErrorEnhanced(error);
}

// Wrap Firebase operations
async function safeFirestoreCall(operation, context = {}) {
  return await safeFirestoreOperation(operation, context);
}


function setupAppEventListeners() {
  setupSearchEventListeners();
  tombolTambahProyek.addEventListener("click", tambahProyek);
  tombolTambah.addEventListener("click", tambahKegiatan);
  daftarProyekContainer.addEventListener("click", handleListClick);
  daftarKegiatanLainElement.addEventListener("click", handleListClick);
  tombolGenerate.addEventListener("click", generateTeks);
  tombolSalin.addEventListener("click", () => salinTeks("hasil-teks"));
  tombolHariSebelumnya.addEventListener("click", () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setTanggal(newDate);
  });

  tombolHariBerikutnya.addEventListener("click", () => {
    if (!isToday(currentDate)) {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 1);
      setTanggal(newDate);
    }
  });
  inputProyek.addEventListener("keydown", (e) => {
    if (e.key === "Enter") tambahProyek();
  });
  inputKegiatan.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      inputWaktu.focus();
    }
  });
  inputWaktu.addEventListener("keydown", (e) => {
    if (e.key === "Enter") tambahKegiatan();
  });
  tombolPengaturan.addEventListener("click", bukaPengaturan);
  tombolTutupPengaturan.addEventListener("click", tutupPengaturan);
  pengaturanOverlay.addEventListener("click", (e) => {
    if (e.target === pengaturanOverlay) tutupPengaturan();
  });
  checkTampilTimer.addEventListener("change", (e) =>
    ubahPengaturan("tampilTimer", e.target.checked)
  );
  inputWarnaTimer.addEventListener("input", (e) =>
    ubahPengaturan("warnaTimer", e.target.value)
  );
  grupTombolUkuran.forEach((tombol) => {
    tombol.addEventListener("click", () =>
      ubahPengaturan("ukuranTimer", tombol.dataset.ukuran)
    );
  });
}





function unsubscribeAll() {
  unsubscribeProfile();
  unsubscribeProjects()
  unsubscribeActivities();
}

function showCustomAlert(message, title = "Notifikasi") {
  customPromptInputContainer.innerHTML = "";
  customAlertTitle.textContent = title;
  customAlertMessage.textContent = message;
  customAlertButtons.innerHTML = `<button id="custom-alert-ok" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">OK</button>`;
  customAlertOverlay.classList.remove("hidden");
  setTimeout(() => customAlertBox.classList.add("visible"), 10);
  return new Promise((resolve) => {
    document.getElementById("custom-alert-ok").onclick = () => {
      customAlertBox.classList.remove("visible");
      setTimeout(() => customAlertOverlay.classList.add("hidden"), 200);
      resolve(true);
    };
  });
}

function showCustomConfirm(
  message,
  title = "Konfirmasi",
  okText = "Yakin",
  cancelText = "Batal"
) {
  customPromptInputContainer.innerHTML = "";
  customAlertTitle.textContent = title;
  customAlertMessage.textContent = message;
  customAlertButtons.innerHTML = `<button id="custom-confirm-cancel" class="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg">${cancelText}</button><button id="custom-confirm-ok" class="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg">${okText}</button>`;
  customAlertOverlay.classList.remove("hidden");
  setTimeout(() => customAlertBox.classList.add("visible"), 10);
  return new Promise((resolve) => {
    document.getElementById("custom-confirm-ok").onclick = () => {
      customAlertBox.classList.remove("visible");
      setTimeout(() => customAlertOverlay.classList.add("hidden"), 200);
      resolve(true);
    };
    document.getElementById("custom-confirm-cancel").onclick = () => {
      customAlertBox.classList.remove("visible");
      setTimeout(() => customAlertOverlay.classList.add("hidden"), 200);
      resolve(false);
    };
  });
}

function showCustomPrompt(message, title = "Input", defaultValue = "") {
  customAlertTitle.textContent = title;
  customAlertMessage.textContent = message;
  customPromptInputContainer.innerHTML = `<input type="text" id="custom-prompt-input" value="${defaultValue}" class="mt-2 w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white">`;
  customAlertButtons.innerHTML = `<button id="custom-prompt-cancel" class="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg">Batal</button><button id="custom-prompt-ok" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Simpan</button>`;
  customAlertOverlay.classList.remove("hidden");
  setTimeout(() => {
    customAlertBox.classList.add("visible");
    document.getElementById("custom-prompt-input").focus();
  }, 10);
  return new Promise((resolve) => {
    const okBtn = document.getElementById("custom-prompt-ok");
    const cancelBtn = document.getElementById("custom-prompt-cancel");
    const input = document.getElementById("custom-prompt-input");
    const close = (value) => {
      customAlertBox.classList.remove("visible");
      setTimeout(() => {
        customAlertOverlay.classList.add("hidden");
        customPromptInputContainer.innerHTML = "";
      }, 200);
      resolve(value);
    };
    okBtn.onclick = () => close(input.value);
    cancelBtn.onclick = () => close(null);
    input.onkeydown = (e) => {
      if (e.key === "Enter") okBtn.click();
    };
  });
}

function showAddActivityPrompt(message, title = "Input") {
  customAlertTitle.textContent = title;
  customAlertMessage.textContent = message;

  const categories = [
    "Pekerjaan",
    "Belajar",
    "Pribadi",
    "Istirahat",
    "Lainnya",
  ];
  const categoryOptions = categories
    .map((cat) => `<option value="${cat}">${cat}</option>`)
    .join("");

  customPromptInputContainer.innerHTML = `
        <div class="space-y-3 text-left">
            <input type="text" id="custom-prompt-input-text" placeholder="Nama kegiatan..." class="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white">
            <select id="custom-prompt-input-category" class="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white">
                ${categoryOptions}
            </select>
        </div>
    `;

  customAlertButtons.innerHTML = `<button id="custom-prompt-cancel" class="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg">Batal</button><button id="custom-prompt-ok" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Simpan</button>`;

  customAlertOverlay.classList.remove("hidden");
  setTimeout(() => {
    customAlertBox.classList.add("visible");
    document.getElementById("custom-prompt-input-text").focus();
  }, 10);

  return new Promise((resolve) => {
    const okBtn = document.getElementById("custom-prompt-ok");
    const cancelBtn = document.getElementById("custom-prompt-cancel");
    const textInput = document.getElementById("custom-prompt-input-text");
    const categoryInput = document.getElementById(
      "custom-prompt-input-category"
    );

    const close = (value) => {
      customAlertBox.classList.remove("visible");
      setTimeout(() => {
        customAlertOverlay.classList.add("hidden");
        customPromptInputContainer.innerHTML = "";
      }, 200);
      resolve(value);
    };

    okBtn.onclick = () => {
      if (textInput.value.trim()) {
        close({ text: textInput.value.trim(), category: categoryInput.value });
      } else {
        close(null);
      }
    };
    cancelBtn.onclick = () => close(null);
    textInput.onkeydown = (e) => {
      if (e.key === "Enter") okBtn.click();
    };
  });
}

function muatPengaturan() {
  const pengaturanTersimpan = localStorage.getItem("activityLoggerSettings");
  pengaturan = pengaturanTersimpan
    ? JSON.parse(pengaturanTersimpan)
    : { ...pengaturanDefault };

  // Pastikan semua properti ada, jika tidak tambahkan dari default
  Object.keys(pengaturanDefault).forEach((key) => {
    if (pengaturan[key] === undefined) {
      pengaturan[key] = pengaturanDefault[key];
    }
  });
}

/** Menyimpan objek pengaturan ke localStorage */
function simpanPengaturan() {
  localStorage.setItem("activityLoggerSettings", JSON.stringify(pengaturan));
}

/** Memperbarui satu nilai pengaturan, menyimpan, dan me-render ulang UI */
function ubahPengaturan(key, value) {
  pengaturan[key] = value;
  simpanPengaturan();
  perbaruiTampilanPengaturan();
  renderDaftarUtama(); // Render ulang daftar untuk menerapkan perubahan
}

/** Memperbarui tampilan di dalam panel pengaturan sesuai state saat ini */
function perbaruiTampilanPengaturan() {
  checkTampilTimer.checked = pengaturan.tampilTimer;
  inputWarnaTimer.value = pengaturan.warnaTimer;

  const warnaAktif = "bg-blue-600 text-white";
  const warnaNonaktif =
    "bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200";

  grupTombolUkuran.forEach((tombol) => {
    if (tombol.dataset.ukuran === pengaturan.ukuranTimer) {
      tombol.className = `pengaturan-ukuran-tombol px-3 py-1 text-sm rounded-md ${warnaAktif}`;
    } else {
      tombol.className = `pengaturan-ukuran-tombol px-3 py-1 text-sm rounded-md ${warnaNonaktif}`;
    }
  });
}

// === FUNGSI PENCARIAN ===
function filterActivities(activities) {
  return activities.filter(activity => {
    // Filter berdasarkan keyword
    const matchesKeyword = searchState.keyword === "" ||
      activity.teks.toLowerCase().includes(searchState.keyword.toLowerCase()) ||
      (activity.proyekId && getProjectName(activity.proyekId)?.toLowerCase().includes(searchState.keyword.toLowerCase()));

    // Filter berdasarkan kategori
    const matchesKategori = searchState.kategori === "all" ||
      activity.kategori === searchState.kategori;

    // Filter berdasarkan status
    let matchesStatus = true;
    switch (searchState.status) {
      case "active":
        matchesStatus = !activity.selesai;
        break;
      case "completed":
        matchesStatus = activity.selesai;
        break;
      case "tracking":
        matchesStatus = activity.status === "tracking";
        break;
      case "paused":
        matchesStatus = activity.status === "paused";
        break;
    }

    return matchesKeyword && matchesKategori && matchesStatus;
  });
}

function getProjectName(projectId) {
  const project = daftarProyek.find(p => p.id === projectId);
  return project ? project.nama : "";
}

function applySearchFilters() {
  const filteredActivities = filterActivities(allActivities);
  renderFilteredList(filteredActivities);
}

function renderFilteredList(activities) {
  if (searchState.keyword === "" && searchState.kategori === "all" && searchState.status === "all") {
    renderDaftarUtama();
    return;
  }

  const daftarKegiatan = [...activities].sort((a, b) => (a.order || 0) - (b.order || 0));

  // Kosongkan container
  daftarProyekContainer.innerHTML = "";
  daftarKegiatanLainElement.innerHTML = "";

  if (daftarKegiatan.length === 0) {
    const noResults = document.createElement("div");
    noResults.className = "text-center py-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm";
    noResults.innerHTML = `
            <p class="text-slate-500 dark:text-slate-400 mb-2">Tidak ada hasil yang ditemukan</p>
            <button id="reset-search" class="text-blue-600 hover:text-blue-800 dark:text-blue-400">
                Reset pencarian
            </button>
        `;
    daftarProyekContainer.appendChild(noResults);

    document.getElementById("reset-search")?.addEventListener("click", () => {
      resetSearchFilters();
    });

    return;
  }

  // Group by project
  const groupedByProject = {};
  const tanpaProyek = [];

  daftarKegiatan.forEach(kegiatan => {
    if (kegiatan.proyekId) {
      if (!groupedByProject[kegiatan.proyekId]) {
        groupedByProject[kegiatan.proyekId] = [];
      }
      groupedByProject[kegiatan.proyekId].push(kegiatan);
    } else {
      tanpaProyek.push(kegiatan);
    }
  });

  // Render proyek yang memiliki kegiatan
  Object.keys(groupedByProject).forEach(proyekId => {
    const proyek = daftarProyek.find(p => p.id === proyekId);
    if (proyek) {
      const proyekElement = buatElemenProyek(proyek, groupedByProject[proyekId]);
      daftarProyekContainer.appendChild(proyekElement);
    }
  });

  // Render kegiatan tanpa proyek
  tanpaProyek.forEach(kegiatan => {
    const liKegiatan = buatElemenKegiatan(kegiatan);
    liKegiatan.classList.add(
      "bg-white",
      "dark:bg-slate-800",
      "rounded-xl",
      "shadow-sm",
      "p-4"
    );
    daftarKegiatanLainElement.appendChild(liKegiatan);
  });

  // Update statistik berdasarkan filtered list
  updateStatsForFiltered(activities);
}

function updateStatsForFiltered(activities) {
  const kegiatanSelesai = activities.filter(k => k.selesai && k.durasi > 0);
  const totalDurasi = kegiatanSelesai.reduce((total, k) => total + k.durasi, 0);

  kontenStatistikTeks.innerHTML = `
        <p class="flex justify-between py-1">
            <span>Hasil Filter:</span>
            <strong>${activities.length} kegiatan</strong>
        </p>
        <p class="flex justify-between py-1">
            <span>Total Waktu:</span>
            <strong>${formatDurasi(totalDurasi)}</strong>
        </p>
        <p class="flex justify-between py-1">
            <span>Selesai:</span>
            <strong>${kegiatanSelesai.length} kegiatan</strong>
        </p>
    `;
}

function resetSearchFilters() {
  searchInput.value = "";
  filterKategori.value = "all";
  filterStatus.value = "all";

  searchState = {
    keyword: "",
    kategori: "all",
    status: "all",
    dateRange: null,
    projectId: null
  };

  renderDaftarUtama();
  perbaruiStatistik();
}

// === EVENT LISTENERS BARU ===
function setupSearchEventListeners() {
  tombolCari.addEventListener("click", () => {
    searchState.keyword = searchInput.value.trim();
    searchState.kategori = filterKategori.value;
    searchState.status = filterStatus.value;
    applySearchFilters();
  });

  tombolResetFilter.addEventListener("click", resetSearchFilters);

  searchInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      searchState.keyword = searchInput.value.trim();
      applySearchFilters();
    }
  });

  filterKategori.addEventListener("change", () => {
    searchState.kategori = filterKategori.value;
    applySearchFilters();
  });

  filterStatus.addEventListener("change", () => {
    searchState.status = filterStatus.value;
    applySearchFilters();
  });

  tombolPencarianLanjutan.addEventListener("click", async () => {
    await showAdvancedSearchModal();
  });
}

async function showAdvancedSearchModal() {
  const modalContent = `
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Rentang Tanggal
                </label>
                <div class="grid grid-cols-2 gap-2">
                    <input 
                        type="date" 
                        id="search-date-from" 
                        class="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2"
                    />
                    <input 
                        type="date" 
                        id="search-date-to" 
                        class="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2"
                    />
                </div>
            </div>
            <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Proyek Tertentu
                </label>
                <select 
                    id="search-project" 
                    class="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2"
                >
                    <option value="all">Semua Proyek</option>
                    ${daftarProyek.map(p => `<option value="${p.id}">${p.nama}</option>`).join('')}
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Durasi Minimum
                </label>
                <input 
                    type="number" 
                    id="search-min-duration" 
                    placeholder="Menit" 
                    class="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2"
                />
            </div>
        </div>
    `;

  const result = await showCustomAlertWithForm(
    "Pencarian Lanjutan",
    modalContent,
    ["Terapkan", "Batal"]
  );

  if (result) {
    const dateFrom = document.getElementById("search-date-from").value;
    const dateTo = document.getElementById("search-date-to").value;
    const projectId = document.getElementById("search-project").value;
    const minDuration = document.getElementById("search-min-duration").value;

    searchState.dateRange = dateFrom && dateTo ? { from: dateFrom, to: dateTo } : null;
    searchState.projectId = projectId !== "all" ? projectId : null;

    if (dateFrom || dateTo || projectId !== "all" || minDuration) {
      const filtered = filterActivitiesAdvanced(allActivities, {
        dateFrom,
        dateTo,
        projectId: searchState.projectId,
        minDuration: parseInt(minDuration) || 0
      });
      renderFilteredList(filtered);
    }
  }
}

function filterActivitiesAdvanced(activities, filters) {
  return activities.filter(activity => {
    // Filter tanggal
    if (filters.dateFrom && filters.dateTo) {
      const activityDate = activity.createdAt.toDate();
      const fromDate = new Date(filters.dateFrom);
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);

      if (activityDate < fromDate || activityDate > toDate) {
        return false;
      }
    }

    // Filter proyek
    if (filters.projectId && activity.proyekId !== filters.projectId) {
      return false;
    }

    // Filter durasi minimum
    if (filters.minDuration > 0) {
      const durationInMinutes = activity.durasi / (1000 * 60);
      if (durationInMinutes < filters.minDuration) {
        return false;
      }
    }

    return true;
  });
}

async function showCustomAlertWithForm(title, htmlContent, buttons) {
  customAlertTitle.textContent = title;
  customPromptInputContainer.innerHTML = htmlContent;

  const buttonsHTML = buttons.map((btn, index) =>
    `<button data-result="${index === 0 ? 'ok' : 'cancel'}" 
                class="w-full ${index === 0 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'} 
                text-white font-bold py-2 px-4 rounded-lg transition-colors">
            ${btn}
        </button>`
  ).join('');

  customAlertButtons.innerHTML = buttonsHTML;
  customAlertOverlay.classList.remove("hidden");

  setTimeout(() => {
    customAlertBox.classList.add("visible");
    // Focus pada tombol pertama
    const firstButton = customAlertButtons.querySelector("button");
    if (firstButton) firstButton.focus();
  }, 10);

  return new Promise((resolve) => {
    const handleButtonClick = (result) => {
      customAlertBox.classList.remove("visible");
      setTimeout(() => {
        customAlertOverlay.classList.add("hidden");
        customPromptInputContainer.innerHTML = "";
        // Remove event listeners
        customAlertButtons.querySelectorAll("button").forEach(btn => {
          btn.onclick = null;
        });
      }, 200);
      resolve(result);
    };

    customAlertButtons.querySelectorAll("button").forEach((btn, index) => {
      btn.onclick = () => {
        handleButtonClick(index === 0);
      };

      // Add keyboard support
      btn.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          handleButtonClick(false);
        }
      };
    });

    // Add escape key support
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleButtonClick(false);
      }
    };

    document.addEventListener('keydown', handleEscape);

    // Cleanup event listener
    setTimeout(() => {
      document.removeEventListener('keydown', handleEscape);
    }, 10000);
  });
}

// === FUNGSI EKSPOR ===
async function exportToJSON() {
  try {
    showCustomAlert("Mempersiapkan data untuk ekspor...", "Ekspor Data");

    // Collect all data
    const exportData = {
      metadata: {
        version: "2.0",
        exportedAt: new Date().toISOString(),
        exportedFrom: "Activity Logger Pro",
        user: currentUser?.email || "unknown",
        itemCount: {
          projects: daftarProyek.length,
          activities: allActivities.length
        }
      },
      settings: {
        userSettings: pengaturan,
        searchState: searchState
      },
      projects: daftarProyek.map(p => ({
        id: p.id,
        nama: p.nama,
        parentId: p.parentId,
        isCollapsed: p.isCollapsed || false,
        order: p.order || Date.now(),
        createdAt: p.createdAt?.toDate()?.toISOString() || new Date().toISOString()
      })),
      activities: allActivities.map(a => ({
        id: a.id,
        teks: a.teks,
        kategori: a.kategori || "Lainnya",
        proyekId: a.proyekId,
        selesai: a.selesai || false,
        durasi: a.durasi || 0,
        status: a.status || "idle",
        isFocusing: a.isFocusing || false,
        createdAt: a.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
        waktuSelesai: a.waktuSelesai?.toDate()?.toISOString(),
        order: a.order || Date.now(),
        lastStartTime: a.lastStartTime?.toDate()?.toISOString(),
        focusEndTime: a.focusEndTime?.toDate()?.toISOString(),
        remainingTime: a.remainingTime || 0
      })),
      statistics: {
        totalActivities: allActivities.length,
        completedActivities: allActivities.filter(a => a.selesai).length,
        totalDuration: allActivities.reduce((sum, a) => sum + (a.durasi || 0), 0),
        byCategory: calculateCategoryStats(),
        byProject: calculateProjectStats()
      }
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileName = `activity-logger-backup-${new Date().toISOString().split('T')[0]}-${Date.now()}.json`;

    // Create download link
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.style.display = 'none';
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);

    // Show success message with details
    const completedCount = allActivities.filter(a => a.selesai).length;
    const totalDuration = formatDurasi(allActivities.reduce((sum, a) => sum + (a.durasi || 0), 0));

    showCustomAlert(
      `✅ Data berhasil diekspor!\n\n` +
      `📁 File: ${exportFileName}\n` +
      `📊 Statistik:\n` +
      `• ${daftarProyek.length} proyek\n` +
      `• ${allActivities.length} kegiatan total\n` +
      `• ${completedCount} kegiatan selesai\n` +
      `• ${totalDuration} total waktu\n\n` +
      `File telah didownload ke perangkat Anda.`,
      "Ekspor Berhasil"
    );

  } catch (error) {
    console.error("Export error:", error);
    errorHandler.logError(ErrorTypes.FIREBASE, error, { operation: "exportJSON" });
    showCustomAlert(
      `❌ Gagal mengekspor data:\n${error.message}\n\n` +
      `Pastikan Anda memiliki izin penyimpanan yang cukup.`,
      "Error Ekspor"
    );
  }
}

function calculateCategoryStats() {
  const stats = {};
  allActivities.forEach(activity => {
    const category = activity.kategori || "Lainnya";
    if (!stats[category]) {
      stats[category] = {
        count: 0,
        duration: 0,
        completed: 0
      };
    }
    stats[category].count++;
    stats[category].duration += activity.durasi || 0;
    if (activity.selesai) stats[category].completed++;
  });
  return stats;
}

function calculateProjectStats() {
  const stats = {};
  daftarProyek.forEach(project => {
    const projectActivities = allActivities.filter(a => a.proyekId === project.id);
    stats[project.id] = {
      name: project.nama,
      count: projectActivities.length,
      duration: projectActivities.reduce((sum, a) => sum + (a.durasi || 0), 0),
      completed: projectActivities.filter(a => a.selesai).length
    };
  });
  return stats;
}

function exportToCSV() {
  try {
    if (allActivities.length === 0) {
      showCustomAlert("Tidak ada data kegiatan untuk diekspor.", "Data Kosong");
      return;
    }

    // Header CSV
    const headers = [
      'ID',
      'Teks Kegiatan',
      'Kategori',
      'Proyek',
      'Status',
      'Selesai',
      'Durasi (menit)',
      'Waktu Mulai',
      'Waktu Selesai',
      'Created At',
      'Order'
    ];

    // Data rows
    const rows = allActivities.map(activity => {
      const projectName = activity.proyekId ?
        (daftarProyek.find(p => p.id === activity.proyekId)?.nama || 'Unknown') :
        "Tanpa Proyek";

      const durationMinutes = Math.round((activity.durasi || 0) / 60000);
      const createdAt = activity.createdAt ?
        activity.createdAt.toDate().toLocaleString('id-ID') : "";
      const startTime = activity.lastStartTime ?
        activity.lastStartTime.toDate().toLocaleString('id-ID') : "";
      const endTime = activity.waktuSelesai ?
        activity.waktuSelesai.toDate().toLocaleString('id-ID') : "";

      return [
        activity.id,
        `"${(activity.teks || '').replace(/"/g, '""')}"`,
        `"${activity.kategori || 'Lainnya'}"`,
        `"${projectName.replace(/"/g, '""')}"`,
        `"${activity.status || 'idle'}"`,
        activity.selesai ? 'Ya' : 'Tidak',
        durationMinutes,
        `"${startTime}"`,
        `"${endTime}"`,
        `"${createdAt}"`,
        activity.order || 0
      ];
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
    const exportFileName = `activity-logger-${new Date().toISOString().split('T')[0]}.csv`;

    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", exportFileName);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showCustomAlert(
      `✅ CSV berhasil diekspor!\n\n` +
      `📊 ${allActivities.length} baris data\n` +
      `📁 File: ${exportFileName}\n\n` +
      `File telah didownload dan dapat dibuka di Excel atau Google Sheets.`,
      "Ekspor CSV Berhasil"
    );

  } catch (error) {
    console.error("CSV export error:", error);
    errorHandler.logError(ErrorTypes.FIREBASE, error, { operation: "exportCSV" });
    showCustomAlert(
      `❌ Gagal mengekspor CSV:\n${error.message}`,
      "Error Ekspor CSV"
    );
  }
}

// === FUNGSI IMPORT ===
async function importFromJSON(file) {
  try {
    const text = await file.text();
    const importData = JSON.parse(text);

    // Validasi format file
    if (!importData.metadata || !importData.metadata.version) {
      throw new Error("Format file tidak valid. Pastikan file berasal dari Activity Logger.");
    }

    // Tampilkan preview data
    const projectCount = importData.projects?.length || 0;
    const activityCount = importData.activities?.length || 0;
    const exportDate = importData.metadata.exportedAt ?
      new Date(importData.metadata.exportedAt).toLocaleString('id-ID') : 'Tidak diketahui';

    const previewHtml = `
      <div class="space-y-3 text-left">
        <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <strong>Informasi File:</strong>
          <div class="text-sm mt-1">
            <div>• Versi: ${importData.metadata.version}</div>
            <div>• Diekspor: ${exportDate}</div>
            <div>• User: ${importData.metadata.user || 'Tidak diketahui'}</div>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
            <div class="text-2xl font-bold">${projectCount}</div>
            <div class="text-sm">Proyek</div>
          </div>
          <div class="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg text-center">
            <div class="text-2xl font-bold">${activityCount}</div>
            <div class="text-sm">Kegiatan</div>
          </div>
        </div>
        
        <div class="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
          <strong>⚠️ Perhatian:</strong>
          <div class="text-sm mt-1">
            • Data yang diimport akan ditambahkan ke data yang ada<br>
            • Proses ini tidak dapat dibatalkan<br>
            • Backup data Anda terlebih dahulu
          </div>
        </div>
      </div>
    `;

    const confirmed = await showCustomAlertWithForm(
      "Preview Import Data",
      previewHtml,
      ["Import Data", "Batal"]
    );

    if (!confirmed) return;

    // Show progress
    showCustomAlert("Memproses data import...", "Import Data");

    // Batch write ke Firestore
    const batch = writeBatch(db);
    let importedCount = 0;
    let skippedCount = 0;

    // Import projects
    if (importData.projects && Array.isArray(importData.projects)) {
      for (const project of importData.projects) {
        // Check if project already exists
        const existingProject = daftarProyek.find(p => p.nama === project.nama);
        if (!existingProject) {
          const projectRef = doc(collection(db, "users", currentUser.uid, "projects"));
          batch.set(projectRef, {
            nama: project.nama,
            parentId: project.parentId,
            isCollapsed: project.isCollapsed || false,
            order: project.order || Date.now(),
            createdAt: serverTimestamp()
          });
          importedCount++;
        } else {
          skippedCount++;
        }
      }
    }

    // Import activities
    if (importData.activities && Array.isArray(importData.activities)) {
      for (const activity of importData.activities) {
        // Check for duplicates based on text and date
        const existingActivity = allActivities.find(a =>
          a.teks === activity.teks &&
          a.createdAt &&
          activity.createdAt &&
          Math.abs(a.createdAt.toDate().getTime() - new Date(activity.createdAt).getTime()) < 60000
        );

        if (!existingActivity) {
          const activityRef = doc(collection(db, "users", currentUser.uid, "activities"));

          // Convert string dates to Timestamp
          const createdAt = activity.createdAt ?
            Timestamp.fromDate(new Date(activity.createdAt)) :
            serverTimestamp();

          const waktuSelesai = activity.waktuSelesai ?
            Timestamp.fromDate(new Date(activity.waktuSelesai)) :
            null;

          const lastStartTime = activity.lastStartTime ?
            Timestamp.fromDate(new Date(activity.lastStartTime)) :
            null;

          const focusEndTime = activity.focusEndTime ?
            Timestamp.fromDate(new Date(activity.focusEndTime)) :
            null;

          batch.set(activityRef, {
            teks: activity.teks,
            kategori: activity.kategori || "Lainnya",
            proyekId: activity.proyekId,
            selesai: activity.selesai || false,
            durasi: activity.durasi || 0,
            status: activity.status || "idle",
            isFocusing: activity.isFocusing || false,
            createdAt: createdAt,
            waktuSelesai: waktuSelesai,
            order: activity.order || Date.now(),
            lastStartTime: lastStartTime,
            focusEndTime: focusEndTime,
            remainingTime: activity.remainingTime || 0
          });
          importedCount++;
        } else {
          skippedCount++;
        }
      }
    }

    // Commit batch
    if (importedCount > 0) {
      await safeBatchCommit(batch, {
        operation: "importData",
        importedCount: importedCount,
        skippedCount: skippedCount
      });
    }

    // Show results
    let resultMessage = `✅ Import selesai!\n\n`;
    resultMessage += `📥 Diimport: ${importedCount} item\n`;
    if (skippedCount > 0) {
      resultMessage += `⏭️ Dilewati: ${skippedCount} item (duplikat)\n`;
    }
    resultMessage += `\nData telah berhasil ditambahkan ke aplikasi.`;

    showCustomAlert(resultMessage, "Import Berhasil");

    // Refresh data
    setTimeout(() => {
      loadInitialDataAndSetupListeners();
    }, 1000);

  } catch (error) {
    console.error("Import error:", error);
    errorHandler.logError(ErrorTypes.FIREBASE, error, { operation: "importData" });

    let errorMessage = `❌ Gagal mengimport data:\n${error.message}\n\n`;

    if (error.message.includes("JSON")) {
      errorMessage += "Pastikan file berformat JSON valid.";
    } else if (error.message.includes("quota")) {
      errorMessage += "Kuota database mungkin penuh. Coba hapus beberapa data lama.";
    } else {
      errorMessage += "Periksa koneksi internet dan coba lagi.";
    }

    showCustomAlert(errorMessage, "Error Import");
  }
}

async function backupHarian() {
  try {
    // Filter kegiatan untuk hari ini
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const activitiesToday = allActivities.filter(activity => {
      if (!activity.createdAt) return false;
      const activityDate = activity.createdAt.toDate();
      return activityDate >= today && activityDate < tomorrow;
    });

    if (activitiesToday.length === 0) {
      showCustomAlert("Tidak ada kegiatan untuk hari ini.", "Backup Harian");
      return;
    }

    const exportData = {
      metadata: {
        type: "daily_backup",
        date: today.toISOString().split('T')[0],
        exportedAt: new Date().toISOString(),
        activityCount: activitiesToday.length
      },
      activities: activitiesToday.map(a => ({
        teks: a.teks,
        kategori: a.kategori || "Lainnya",
        proyek: a.proyekId ? (daftarProyek.find(p => p.id === a.proyekId)?.nama || '') : '',
        selesai: a.selesai,
        durasi: a.durasi,
        waktu: a.createdAt?.toDate().toLocaleTimeString('id-ID'),
        catatan: ""
      }))
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileName = `harian-${today.toISOString().split('T')[0]}.json`;

    downloadFile(dataUri, exportFileName);

    showCustomAlert(
      `✅ Backup harian berhasil!\n\n` +
      `📅 ${today.toLocaleDateString('id-ID')}\n` +
      `📝 ${activitiesToday.length} kegiatan\n` +
      `📁 ${exportFileName}`,
      "Backup Harian"
    );

  } catch (error) {
    errorHandler.logError(ErrorTypes.FIREBASE, error, { operation: "backupHarian" });
    showCustomAlert("Gagal membuat backup harian.", "Error");
  }
}

function downloadFile(dataUri, fileName) {
  const link = document.createElement('a');
  link.setAttribute('href', dataUri);
  link.setAttribute('download', fileName);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function backupPerProyek() {
  try {
    const htmlContent = `
      <div class="space-y-3">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Pilih Proyek untuk Backup:
        </label>
        <select id="select-project-backup" 
          class="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2">
          <option value="all">Semua Proyek</option>
          ${daftarProyek.map(p => `<option value="${p.id}">${p.nama}</option>`).join('')}
        </select>
        
        <div class="flex items-center gap-2">
          <input type="checkbox" id="include-completed" checked class="rounded">
          <label for="include-completed" class="text-sm">Sertakan kegiatan selesai</label>
        </div>
        
        <div class="flex items-center gap-2">
          <input type="checkbox" id="include-incomplete" checked class="rounded">
          <label for="include-incomplete" class="text-sm">Sertakan kegiatan belum selesai</label>
        </div>
      </div>
    `;

    const confirmed = await showCustomAlertWithForm(
      "Backup per Proyek",
      htmlContent,
      ["Buat Backup", "Batal"]
    );

    if (!confirmed) return;

    const projectId = document.getElementById("select-project-backup").value;
    const includeCompleted = document.getElementById("include-completed").checked;
    const includeIncomplete = document.getElementById("include-incomplete").checked;

    let filteredActivities = allActivities;

    if (projectId !== "all") {
      filteredActivities = allActivities.filter(a => a.proyekId === projectId);
    }

    if (!includeCompleted) {
      filteredActivities = filteredActivities.filter(a => !a.selesai);
    }

    if (!includeIncomplete) {
      filteredActivities = filteredActivities.filter(a => a.selesai);
    }

    if (filteredActivities.length === 0) {
      showCustomAlert("Tidak ada data yang sesuai dengan filter.", "Data Kosong");
      return;
    }

    const projectName = projectId === "all" ? "Semua-Proyek" :
      daftarProyek.find(p => p.id === projectId)?.nama.replace(/\s+/g, '-') || "Proyek";

    const exportData = {
      metadata: {
        type: "project_backup",
        project: projectName,
        exportedAt: new Date().toISOString(),
        filters: {
          projectId,
          includeCompleted,
          includeIncomplete
        },
        activityCount: filteredActivities.length
      },
      activities: filteredActivities.map(a => ({
        teks: a.teks,
        kategori: a.kategori || "Lainnya",
        selesai: a.selesai,
        durasi: a.durasi,
        createdAt: a.createdAt?.toDate().toISOString(),
        waktuSelesai: a.waktuSelesai?.toDate().toISOString(),
        status: a.status
      }))
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileName = `backup-${projectName}-${new Date().toISOString().split('T')[0]}.json`;

    downloadFile(dataUri, exportFileName);

    showCustomAlert(
      `✅ Backup proyek berhasil!\n\n` +
      `📁 Proyek: ${projectName}\n` +
      `📊 ${filteredActivities.length} kegiatan\n` +
      `📄 ${exportFileName}`,
      "Backup Proyek"
    );

  } catch (error) {
    errorHandler.logError(ErrorTypes.FIREBASE, error, { operation: "backupPerProyek" });
    showCustomAlert("Gagal membuat backup proyek.", "Error");
  }
}
function setupAdvancedExportImportListeners() {
  // Backup Harian
  document.getElementById("tombol-backup-harian")?.addEventListener("click", backupHarian);

  // Backup per Proyek
  document.getElementById("tombol-backup-proyek")?.addEventListener("click", backupPerProyek);

  // Import Selektif
  document.getElementById("tombol-import-selektif")?.addEventListener("click", showImportSelektif);

  // File import advanced
  document.getElementById("file-import-advanced")?.addEventListener("change", handleAdvancedFileImport);

  // Update backup info
  updateBackupInfo();
}

async function showImportSelektif() {
  const htmlContent = `
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Pilih Data untuk Diimport:
        </label>
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <input type="checkbox" id="import-projects" checked class="rounded">
            <label for="import-projects" class="text-sm">Proyek</label>
          </div>
          <div class="flex items-center gap-2">
            <input type="checkbox" id="import-activities" checked class="rounded">
            <label for="import-activities" class="text-sm">Kegiatan</label>
          </div>
          <div class="flex items-center gap-2">
            <input type="checkbox" id="import-settings" class="rounded">
            <label for="import-settings" class="text-sm">Pengaturan</label>
          </div>
        </div>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Konflik Data:
        </label>
        <select id="conflict-resolution" 
          class="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-sm">
          <option value="skip">Lewati data yang sudah ada</option>
          <option value="overwrite">Timpa data yang sudah ada</option>
          <option value="rename">Buat versi baru</option>
        </select>
      </div>
    </div>
  `;

  const confirmed = await showCustomAlertWithForm(
    "Import Selektif",
    htmlContent,
    ["Lanjutkan", "Batal"]
  );

  if (confirmed) {
    // Trigger file input
    fileImportInput.click();
  }
}

function calculateDataSize() {
  const projectsSize = daftarProyek.length * 100; // ~100 bytes per project
  const activitiesSize = allActivities.length * 500; // ~500 bytes per activity

  const totalBytes = projectsSize + activitiesSize;

  if (totalBytes < 1024) {
    return `${totalBytes} B`;
  } else if (totalBytes < 1024 * 1024) {
    return `${(totalBytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}

function handleFileImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
  const fileExtension = file.name.split('.').pop().toLowerCase();

  // Validasi ukuran file (max 10MB)
  if (fileSizeMB > 10) {
    showCustomAlert(
      `File terlalu besar (${fileSizeMB} MB). Maksimal 10 MB.`,
      "File Terlalu Besar"
    );
    event.target.value = '';
    return;
  }

  if (fileExtension === 'json') {
    importFromJSON(file);
  } else if (fileExtension === 'csv') {
    showCustomAlert(
      "Import CSV belum didukung. Silakan konversi ke JSON terlebih dahulu.",
      "Format Tidak Didukung"
    );
  } else {
    showCustomAlert(
      "Format file tidak didukung. Gunakan file JSON.",
      "Format File Salah"
    );
  }

  // Reset input
  event.target.value = '';
}


// === ANALYTICS FUNCTIONS ===
async function loadAnalyticsData(period = "today") {
  const now = new Date();
  let startDate, endDate;

  switch (period) {
    case "week":
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      endDate = new Date(now);
      break;
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;
    case "all":
      startDate = new Date(0); // Beginning of time
      endDate = new Date(now);
      break;
    default: // today
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
  }

  // Query activities dalam rentang waktu
  const q = query(
    collection(db, "users", currentUser.uid, "activities"),
    where("createdAt", ">=", startDate),
    where("createdAt", "<=", endDate),
    orderBy("createdAt", "asc")
  );

  const snapshot = await safeGetDocs(q);
  const activities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  return activities;
}

function calculateProductivityMetrics(activities) {
  try {
    if (!activities || !Array.isArray(activities)) {
      return {
        totalDuration: 0,
        activityCount: 0,
        durationByCategory: {},
        activitiesByHour: Array(24).fill(0),
        avgDurationPerActivity: 0,
        peakHour: -1,
        completionRate: 0
      };
    }

    const completedActivities = activities.filter(a => a.selesai && a.durasi > 0);

    // Total waktu produktif
    const totalDuration = completedActivities.reduce((sum, a) => sum + (a.durasi || 0), 0);

    // Durasi per kategori
    const durationByCategory = {};
    completedActivities.forEach(a => {
      const category = a.kategori || "Lainnya";
      durationByCategory[category] = (durationByCategory[category] || 0) + (a.durasi || 0);
    });

    // Aktivitas per jam
    const activitiesByHour = Array(24).fill(0);
    completedActivities.forEach(a => {
      if (a.createdAt) {
        try {
          const hour = a.createdAt.toDate().getHours();
          activitiesByHour[hour]++;
        } catch (err) {
          console.warn("Error getting hour from activity:", err);
        }
      }
    });

    // Rata-rata durasi per aktivitas
    const avgDurationPerActivity = completedActivities.length > 0
      ? totalDuration / completedActivities.length
      : 0;

    // Peak productivity hour
    const maxActivities = Math.max(...activitiesByHour);
    const peakHour = maxActivities > 0 ? activitiesByHour.indexOf(maxActivities) : -1;

    return {
      totalDuration,
      activityCount: completedActivities.length,
      durationByCategory,
      activitiesByHour,
      avgDurationPerActivity,
      peakHour,
      completionRate: activities.length > 0 ? (completedActivities.length / activities.length) * 100 : 0
    };

  } catch (error) {
    console.error("Error in calculateProductivityMetrics:", error);
    return {
      totalDuration: 0,
      activityCount: 0,
      durationByCategory: {},
      activitiesByHour: Array(24).fill(0),
      avgDurationPerActivity: 0,
      peakHour: -1,
      completionRate: 0
    };
  }
}

async function updateAnalytics(period = "today") {
  try {
    const activities = await loadAnalyticsData(period);
    const metrics = calculateProductivityMetrics(activities);

    // Pastikan elemen DOM ada sebelum mengaksesnya
    const totalWaktuElement = document.getElementById("total-waktu");
    const rataWaktuElement = document.getElementById("rata-waktu");
    const peakTimeElement = document.getElementById("peak-time");
    const trendElement = document.getElementById("trend-indicator");

    // Update UI hanya jika elemen ada
    if (totalWaktuElement) {
      totalWaktuElement.textContent = formatDurasi(metrics.totalDuration);
    }

    if (rataWaktuElement) {
      rataWaktuElement.textContent = formatDurasi(metrics.avgDurationPerActivity);
    }

    if (peakTimeElement) {
      peakTimeElement.textContent = metrics.peakHour >= 0 ? `Jam ${metrics.peakHour}:00` : "-";
    }

    // Update trend indicator
    if (trendElement) {
      const completionRate = metrics.completionRate;

      if (completionRate > 70) {
        trendElement.textContent = "📈 Meningkat";
        trendElement.className = "text-green-600 font-bold";
      } else if (completionRate > 40) {
        trendElement.textContent = "➡️ Stabil";
        trendElement.className = "text-yellow-600 font-bold";
      } else {
        trendElement.textContent = "📉 Menurun";
        trendElement.className = "text-red-600 font-bold";
      }
    }

    // Update chart jika ada
    updateAnalyticsChart(metrics, period);

  } catch (error) {
    errorHandler.logError(ErrorTypes.FIREBASE, error, { operation: "updateAnalytics", period });
    console.warn("Gagal update analytics:", error);
  }
}

function updateAnalyticsChart(metrics, period) {
  // Pastikan canvas element ada
  const chartCanvas = document.getElementById("statistik-chart");
  if (!chartCanvas) {
    console.warn("Chart canvas tidak ditemukan");
    return;
  }

  const ctx = chartCanvas.getContext('2d');
  if (!ctx) {
    console.warn("Tidak bisa mendapatkan context dari canvas");
    return;
  }

  // Destroy chart sebelumnya jika ada
  if (statistikChart) {
    try {
      statistikChart.destroy();
    } catch (err) {
      console.warn("Gagal destroy chart lama:", err);
    }
  }

  const isDark = document.documentElement.classList.contains("dark");

  // Convert durationByCategory to chart data
  const categories = Object.keys(metrics.durationByCategory || {});
  const durations = Object.values(metrics.durationByCategory || {}).map(d => d / (1000 * 60 * 60)); // Convert to hours

  // Jika tidak ada data, tampilkan chart kosong
  if (categories.length === 0) {
    statistikChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Belum ada data"],
        datasets: [{
          data: [1],
          backgroundColor: [isDark ? "#334155" : "#cbd5e1"],
          borderColor: isDark ? "#1E293B" : "#FFFFFF",
          borderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 15,
              color: isDark ? "#94A3B8" : "#475569",
            },
          },
          tooltip: {
            enabled: false
          }
        }
      }
    });
    return;
  }

  // Buat chart dengan data
  statistikChart = new Chart(ctx, {
    type: period === "today" ? "doughnut" : "bar",
    data: {
      labels: categories,
      datasets: [{
        label: `Durasi (jam) - ${getPeriodLabel(period)}`,
        data: durations,
        backgroundColor: categories.map((_, i) => {
          const hue = (i * 60) % 360;
          return `hsl(${hue}, 70%, ${isDark ? '60%' : '50%'})`;
        }),
        borderColor: isDark ? "#1E293B" : "#FFFFFF",
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: isDark ? "#94A3B8" : "#475569",
            font: {
              size: 11
            }
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const hours = context.raw || 0;
              const minutes = Math.round((hours - Math.floor(hours)) * 60);
              return ` ${context.label}: ${Math.floor(hours)}j ${minutes}m`;
            }
          }
        }
      },
      scales: period !== "today" ? {
        y: {
          beginAtZero: true,
          ticks: {
            color: isDark ? "#94A3B8" : "#475569",
            callback: function (value) {
              return value + ' jam';
            }
          }
        },
        x: {
          ticks: {
            color: isDark ? "#94A3B8" : "#475569",
            maxRotation: 45
          }
        }
      } : undefined
    }
  });
}
function getPeriodLabel(period) {
  switch (period) {
    case "today": return "Hari Ini";
    case "week": return "Minggu Ini";
    case "month": return "Bulan Ini";
    case "all": return "Semua Waktu";
    default: return "Hari Ini";
  }
}

// === SETUP ANALYTICS ===
function setupAnalytics() {
  try {
    const periodSelect = document.getElementById("statistik-period");
    const detailButton = document.getElementById("tombol-detail-statistik");

    if (periodSelect) {
      periodSelect.addEventListener("change", async (e) => {
        try {
          await updateAnalytics(e.target.value);
        } catch (error) {
          console.error("Error updating analytics on period change:", error);
        }
      });
    } else {
      console.warn("Element statistik-period tidak ditemukan");
    }

    if (detailButton) {
      detailButton.addEventListener("click", async () => {
        try {
          await showDetailedAnalytics();
        } catch (error) {
          console.error("Error showing detailed analytics:", error);
          showCustomAlert("Gagal menampilkan analisis detail", "Error");
        }
      });
    }

    // Initial load dengan delay untuk memastikan DOM siap
    setTimeout(async () => {
      try {
        await updateAnalytics();
      } catch (error) {
        console.error("Error initial analytics load:", error);
      }
    }, 1000);

  } catch (error) {
    errorHandler.logError(ErrorTypes.UNKNOWN, error, { operation: "setupAnalytics" });
    console.error("Error in setupAnalytics:", error);
  }
}

async function showDetailedAnalytics() {
  try {
    // Load data untuk semua periode
    const todayData = await loadAnalyticsData("today");
    const weekData = await loadAnalyticsData("week");
    const monthData = await loadAnalyticsData("month");

    const todayMetrics = calculateProductivityMetrics(todayData);
    const weekMetrics = calculateProductivityMetrics(weekData);
    const monthMetrics = calculateProductivityMetrics(monthData);

    const htmlContent = `
      <div class="space-y-6 max-h-[70vh] overflow-y-auto p-1">
        <div class="grid grid-cols-3 gap-4">
          <div class="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div class="text-2xl font-bold">${todayMetrics.activityCount || 0}</div>
            <div class="text-sm text-slate-600 dark:text-slate-400">Hari Ini</div>
          </div>
          <div class="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div class="text-2xl font-bold">${weekMetrics.activityCount || 0}</div>
            <div class="text-sm text-slate-600 dark:text-slate-400">7 Hari</div>
          </div>
          <div class="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div class="text-2xl font-bold">${monthMetrics.activityCount || 0}</div>
            <div class="text-sm text-slate-600 dark:text-slate-400">30 Hari</div>
          </div>
        </div>
        
        ${Object.keys(weekMetrics.durationByCategory || {}).length > 0 ? `
          <div>
            <h4 class="font-bold mb-2 text-slate-700 dark:text-slate-300">Distribusi Waktu per Kategori (Minggu Ini)</h4>
            <div class="space-y-2">
              ${Object.entries(weekMetrics.durationByCategory).map(([category, duration]) => `
                <div class="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700/30 rounded">
                  <span class="text-sm">${category}:</span>
                  <span class="font-bold">${formatDurasi(duration)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : `
          <div class="text-center p-4 bg-slate-50 dark:bg-slate-700/30 rounded">
            <p class="text-slate-500 dark:text-slate-400">Belum ada data untuk minggu ini</p>
          </div>
        `}
        
        <div>
          <h4 class="font-bold mb-2 text-slate-700 dark:text-slate-300">Waktu Produktif per Hari (Jam)</h4>
          <div class="h-64" id="daily-chart-container">
            <canvas id="daily-chart"></canvas>
          </div>
        </div>
      </div>
    `;

    const confirmed = await showCustomAlertWithForm(
      "Analisis Detail Produktivitas",
      htmlContent,
      ["Tutup"]
    );

    if (confirmed) {
      // Render daily chart dengan delay
      setTimeout(() => {
        try {
          renderDailyChart(weekData);
        } catch (chartError) {
          console.error("Error rendering daily chart:", chartError);
        }
      }, 100);
    }

  } catch (error) {
    errorHandler.logError(ErrorTypes.FIREBASE, error, { operation: "showDetailedAnalytics" });
    showCustomAlert("Gagal memuat analisis detail", "Error");
  }
}

function renderDailyChart(weekData) {
  try {
    const canvas = document.getElementById("daily-chart");
    if (!canvas) {
      console.warn("Daily chart canvas tidak ditemukan");
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Group data by day
    const dailyTotals = {};

    if (weekData && Array.isArray(weekData)) {
      weekData.forEach(activity => {
        if (activity.selesai && activity.durasi > 0 && activity.createdAt) {
          try {
            const date = activity.createdAt.toDate().toLocaleDateString('id-ID', { weekday: 'short' });
            dailyTotals[date] = (dailyTotals[date] || 0) + (activity.durasi || 0);
          } catch (err) {
            console.warn("Error processing activity date:", err);
          }
        }
      });
    }

    const days = Object.keys(dailyTotals);
    const durations = Object.values(dailyTotals).map(d => d / (1000 * 60 * 60)); // Convert to hours

    // Jika tidak ada data, tampilkan chart kosong
    if (days.length === 0) {
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Tidak ada data'],
          datasets: [{
            label: 'Jam Produktif',
            data: [0],
            borderColor: '#94a3b8',
            backgroundColor: 'rgba(148, 163, 184, 0.1)',
            tension: 0.3,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: value => value + ' jam'
              }
            }
          }
        }
      });
      return;
    }

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: days,
        datasets: [{
          label: 'Jam Produktif',
          data: durations,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.3,
          fill: true,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: value => value + ' jam'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  } catch (error) {
    console.error("Error rendering daily chart:", error);
  }
}

// === MOBILE OPTIMIZATION ===
function setupMobileOptimization() {
  // Check if mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (!isMobile) return;

  // Show mobile elements
  document.getElementById("mobile-fab")?.classList.remove("hidden");
  document.getElementById("mobile-bottom-nav")?.classList.remove("hidden");

  // Setup FAB
  const fab = document.getElementById("mobile-fab");
  if (fab) {
    fab.addEventListener("click", () => {
      showMobileQuickActions();
    });

    // Long press for more options
    let pressTimer;
    fab.addEventListener("touchstart", (e) => {
      pressTimer = setTimeout(() => {
        showMobileLongPressMenu(e);
      }, 500);
    });

    fab.addEventListener("touchend", () => {
      clearTimeout(pressTimer);
    });
  }

  // Setup bottom navigation
  const navItems = document.querySelectorAll(".mobile-nav-item");
  navItems.forEach(item => {
    item.addEventListener("click", () => {
      // Remove active class from all
      navItems.forEach(i => i.classList.remove("active"));
      // Add active to clicked
      item.classList.add("active");

      // Navigate to section
      const section = item.dataset.section;
      navigateToMobileSection(section);
    });
  });

  // Setup swipe gestures
  setupSwipeGestures();

  // Adjust UI for mobile
  adjustUIForMobile();
}

function adjustUIForMobile() {
  // Hide some elements on mobile
  const elementsToHide = document.querySelectorAll(".mobile-hidden");
  elementsToHide.forEach(el => {
    el.classList.add("hidden");
  });

  // Make some elements full width
  const elementsToFullWidth = document.querySelectorAll(".mobile-full-width");
  elementsToFullWidth.forEach(el => {
    el.classList.add("w-full");
  });

  // Add mobile padding
  const elementsToPad = document.querySelectorAll(".mobile-p-3");
  elementsToPad.forEach(el => {
    el.classList.add("p-3");
  });

  // Adjust font sizes
  const elementsToResize = document.querySelectorAll(".mobile-text-sm");
  elementsToResize.forEach(el => {
    el.classList.add("text-sm");
  });
}

async function showMobileQuickActions() {
  const actions = [
    { text: "➕ Tambah Kegiatan", action: "add-activity" },
    { text: "📁 Buat Proyek", action: "add-project" },
    { text: "⏱️ Timer Cepat", action: "quick-timer" },
    { text: "📋 Salin Laporan", action: "copy-report" }
  ];

  const buttonsHTML = actions.map(action => `
        <button 
            data-action="${action.action}"
            class="w-full text-left px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg flex items-center gap-3"
        >
            ${action.text}
        </button>
    `).join('');

  const htmlContent = `
        <div class="space-y-1">
            ${buttonsHTML}
        </div>
    `;

  const result = await showCustomAlertWithForm(
    "Aksi Cepat",
    htmlContent,
    ["Batal"]
  );

  if (result && result.action) {
    handleQuickAction(result.action);
  }
}

function handleQuickAction(action) {
  switch (action) {
    case "add-activity":
      inputKegiatan.focus();
      break;
    case "add-project":
      inputProyek.focus();
      break;
    case "quick-timer":
      showQuickTimer();
      break;
    case "copy-report":
      generateTeks();
      setTimeout(() => salinTeks("hasil-teks"), 100);
      break;
  }
}

function showQuickTimer() {
  const htmlContent = `
        <div class="space-y-3">
            <input 
                type="text" 
                id="quick-timer-text" 
                placeholder="Apa yang sedang Anda kerjakan?"
                class="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2"
            />
            <div class="grid grid-cols-3 gap-2">
                <button data-minutes="15" class="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 py-2 rounded">15m</button>
                <button data-minutes="25" class="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 py-2 rounded">25m</button>
                <button data-minutes="45" class="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 py-2 rounded">45m</button>
            </div>
            <div class="flex gap-2">
                <input 
                    type="number" 
                    id="custom-minutes" 
                    placeholder="Menit" 
                    class="flex-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2"
                />
                <button id="start-custom" class="bg-green-600 text-white px-4 py-2 rounded">Mulai</button>
            </div>
        </div>
    `;

  showCustomAlertWithForm("Timer Cepat", htmlContent, ["Batal"])
    .then(result => {
      if (result && result.minutes) {
        startQuickTimer(result.text, result.minutes);
      }
    });

  // Add event listeners to buttons
  setTimeout(() => {
    document.querySelectorAll("[data-minutes]").forEach(btn => {
      btn.addEventListener("click", () => {
        const text = document.getElementById("quick-timer-text").value || "Kerja Cepat";
        const minutes = parseInt(btn.dataset.minutes);
        startQuickTimer(text, minutes);
      });
    });

    document.getElementById("start-custom")?.addEventListener("click", () => {
      const text = document.getElementById("quick-timer-text").value || "Kerja Cepat";
      const minutes = parseInt(document.getElementById("custom-minutes").value) || 25;
      startQuickTimer(text, minutes);
    });
  }, 100);
}

async function startQuickTimer(text, minutes) {
  const category = "Pekerjaan"; // Default category

  await safeAddDoc(collection(db, "users", currentUser.uid, "activities"), {
    teks: text,
    kategori: category,
    proyekId: null,
    selesai: false,
    durasi: 0,
    isEditing: false,
    status: "tracking",
    isFocusing: true,
    lastStartTime: serverTimestamp(),
    focusEndTime: Timestamp.fromDate(new Date(Date.now() + minutes * 60 * 1000)),
    remainingTime: minutes * 60 * 1000,
    createdAt: serverTimestamp(),
    waktuSelesai: null,
    order: Date.now(),
  });

  showCustomAlert(`Timer ${minutes} menit dimulai!`, "Timer Dimulai");
}

function setupSwipeGestures() {
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;

  const activityContainer = document.getElementById("daftar-utama-container");

  if (activityContainer) {
    activityContainer.addEventListener("touchstart", e => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    activityContainer.addEventListener("touchend", e => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleSwipe();
    }, { passive: true });
  }

  function handleSwipe() {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // Minimum swipe distance
    if (Math.abs(deltaX) < 50 && Math.abs(deltaY) < 50) return;

    // Horizontal swipe (left/right)
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        // Swipe right - go to previous day
        if (document.querySelector(".mobile-nav-item[data-section='activities']").classList.contains("active")) {
          tombolHariSebelumnya.click();
        }
      } else {
        // Swipe left - go to next day (if not today)
        if (document.querySelector(".mobile-nav-item[data-section='activities']").classList.contains("active")) {
          if (!isToday(currentDate)) {
            tombolHariBerikutnya.click();
          }
        }
      }
    }
  }
}

function navigateToMobileSection(section) {
  // Scroll to section
  const sections = {
    activities: "#daftar-utama-container",
    projects: "#input-proyek",
    analytics: "#statistik-chart",
    settings: "#tombol-pengaturan"
  };

  const selector = sections[section];
  if (selector) {
    document.querySelector(selector)?.scrollIntoView({ behavior: "smooth" });
  }

  // Special handling for settings
  if (section === "settings") {
    setTimeout(() => {
      tombolPengaturan.click();
    }, 300);
  }
}


// === SETUP EVENT LISTENERS ===
function setupExportImportListeners() {
  tombolExportJson.addEventListener("click", exportToJSON);
  tombolExportCsv.addEventListener("click", exportToCSV);
  tombolImportData.addEventListener("click", () => {
    fileImportInput.click();
  });
  fileImportInput.addEventListener("change", handleFileImport);
}

/** Menampilkan panel pengaturan */
function bukaPengaturan() {
  perbaruiTampilanPengaturan();
  pengaturanOverlay.classList.remove("hidden");
  pengaturanOverlay.classList.add("flex");
}

/** Menyembunyikan panel pengaturan */
function tutupPengaturan() {
  pengaturanOverlay.classList.add("hidden");
  pengaturanOverlay.classList.remove("flex");
}

/** Mengambil nilai ukuran font berdasarkan pengaturan */
function getUkuranFontTimer(ukuran) {
  switch (ukuran) {
    case "kecil":
      return "0.875rem"; // text-sm
    case "besar":
      return "1.25rem"; // text-xl
    default:
      return "1.125rem"; // text-lg
  }
}

function loadInitialDataAndSetupListeners() {
  if (!currentUser) return;
  unsubscribeAll(); // Kosongkan semua listener sebelumnya

  // 1. Dengarkan perubahan pada profil pengguna
  const profileRef = doc(db, "users", currentUser.uid);
  unsubscribeProfile = onSnapshot(profileRef, (docSnapshot) => {
    userProfile = docSnapshot.data() || {};
    namaUserElement.textContent = userProfile.customName || currentUser.displayName || currentUser.email.split('@')[0];
  });

  // 2. Dengarkan perubahan pada daftar proyek (menggunakan onSnapshot)
  const projectsQuery = query(collection(db, "users", currentUser.uid, "projects"), orderBy("order", "asc"));
  unsubscribeProjects = onSnapshot(projectsQuery, (snapshot) => {
    console.log("Data proyek berhasil dimuat (dari cache atau server).");
    daftarProyek = snapshot.docs.map(docSnapshot => ({ id: docSnapshot.id, ...docSnapshot.data() }));
    renderProyekDropdowns();
    renderDaftarUtama(); // Render ulang daftar utama setiap kali ada perubahan proyek
  }, (error) => {
    console.error("Gagal memuat data proyek:", error);
    showCustomAlert("Gagal memuat data proyek. Coba periksa koneksi.", "Error");
  });

  // 3. Listener untuk kegiatan akan dipanggil oleh fungsi setTanggal() setelah ini
}
// --- AKHIR PERUBAHAN FUNGSI ---


function setupDailyActivityListener(carryOver = true) {
  if (!currentUser) return;
  unsubscribeActivities();
  allActivities = [];
  renderDaftarUtama();
  loadingElement.style.display = 'block';
  pesanKosongElement.style.display = 'none';

  const startOfDay = new Date(currentDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(currentDate);
  endOfDay.setHours(23, 59, 59, 999);

  let activitiesQuery;
  if (carryOver) {
    activitiesQuery = query(collection(db, "users", currentUser.uid, "activities"), where("createdAt", "<=", endOfDay), orderBy("createdAt", "desc"));
  } else {
    activitiesQuery = query(collection(db, "users", currentUser.uid, "activities"), where("createdAt", ">=", startOfDay), where("createdAt", "<=", endOfDay), orderBy("createdAt", "desc"));
  }

  unsubscribeActivities = onSnapshot(activitiesQuery, (snapshot) => {
    loadingElement.style.display = 'none';
    const fetchedActivities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (carryOver) {
      allActivities = fetchedActivities.filter(activity => {
        const activityDate = activity.createdAt.toDate();
        return !activity.selesai || isSameDay(activityDate, currentDate);
      });
    } else {
      allActivities = fetchedActivities;
    }

    renderDaftarUtama();
    perbaruiStatistik();
  }, (error) => {
    console.error("Gagal mendengarkan perubahan kegiatan:", error);
    loadingElement.style.display = 'none';
  });
}

async function ubahNamaTampilan() {
  const namaSaatIni = userProfile.customName || currentUser.displayName || "";
  const namaBaru = await showCustomPrompt(
    "Masukkan nama tampilan baru:",
    "Ubah Nama",
    namaSaatIni
  );
  if (namaBaru !== null && namaBaru.trim() !== "") {
    await safeSetDoc(
      doc(db, "users", currentUser.uid),
      { customName: namaBaru.trim() },
      { merge: true }
    );
    showCustomAlert("Nama berhasil diperbarui!", "Sukses");
  }
}

async function setTanggal(newDate) {
  const oldDate = new Date(currentDate);
  currentDate = new Date(newDate.setHours(0, 0, 0, 0));

  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  tanggalHariIniElement.textContent = currentDate.toLocaleDateString(
    "id-ID",
    options
  );

  const today = isToday(currentDate);
  tombolHariBerikutnya.disabled = today;
  tombolHariBerikutnya.style.opacity = today ? 0.5 : 1;

  let carryOver = true;
  if (currentDate > oldDate && !isToday(currentDate)) {
    const startOfNewDay = new Date(currentDate);
    startOfNewDay.setHours(0, 0, 0, 0);
    const q = query(
      collection(db, "users", currentUser.uid, "activities"),
      where("selesai", "==", false),
      where("createdAt", "<", startOfNewDay)
    );
    const unfinishedSnapshot = await safeGetDocs(q);

    if (!unfinishedSnapshot.empty) {
      const userChoice = await showCustomConfirm(
        "Ada tugas yang belum selesai dari hari sebelumnya. Apakah Anda ingin membawanya ke hari ini?",
        "Bawa Tugas?",
        "Ya, Bawa Tugas",
        "Tidak, Mulai Baru"
      );
      carryOver = userChoice;
    }
  }

  setupDailyActivityListener(carryOver);
}

function isToday(date) {
  const today = new Date();
  return date.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0);
}

function initSortable() {
  sortableInstances.forEach((instance) => instance.destroy());
  sortableInstances = [];

  const projectContainer = document.getElementById("daftar-proyek-container");
  const otherActivitiesContainer = document.getElementById(
    "daftar-kegiatan-lain"
  );
  const subtaskContainers = document.querySelectorAll(".list-subtugas");

  const projectSortableOptions = {
    animation: 150,
    ghostClass: "drag-ghost",
    handle: '.drag-handle', // <-- TAMBAHKAN BARIS INI
    onEnd: (evt) => {
      const itemIds = Array.from(evt.from.children).map(
        (child) => child.dataset.proyekId
      );
      updateOrderInFirestore(itemIds, "projects");
    },
  };

  const activitySortableOptions = {
    animation: 150,
    ghostClass: "drag-ghost",
    group: "shared-activities",
    handle: '.drag-handle', // <-- TAMBAHKAN BARIS INI
    onEnd: async (evt) => {
      const activityId = evt.item.dataset.kegiatanId;
      const fromList = evt.from;
      const toList = evt.to;

      if (fromList !== toList) {
        const newProjectId = toList.dataset.proyekId || null;
        await safeUpdateDoc(
          doc(db, "users", currentUser.uid, "activities", activityId),
          {
            proyekId: newProjectId,
          }
        );
      }

      const toItemIds = Array.from(toList.children).map(
        (child) => child.dataset.kegiatanId
      );
      updateOrderInFirestore(toItemIds, "activities");

      if (fromList !== toList) {
        const fromItemIds = Array.from(fromList.children).map(
          (child) => child.dataset.kegiatanId
        );
        updateOrderInFirestore(fromItemIds, "activities");
      }
    },
  };

  if (projectContainer) {
    sortableInstances.push(
      new Sortable(projectContainer, projectSortableOptions)
    );
  }

  if (otherActivitiesContainer) {
    otherActivitiesContainer.dataset.listType = "activities";
    sortableInstances.push(
      new Sortable(otherActivitiesContainer, activitySortableOptions)
    );
  }
  subtaskContainers.forEach((container) => {
    container.dataset.listType = "activities";
    sortableInstances.push(new Sortable(container, activitySortableOptions));
  });
}

function setupBackupListeners() {
  // Backup semua data
  document.getElementById("tombol-backup-semua")?.addEventListener("click", backupSemuaData);

  // Backup harian
  document.getElementById("tombol-backup-harian")?.addEventListener("click", backupHarian);

  // Backup per proyek
  document.getElementById("tombol-backup-proyek")?.addEventListener("click", backupPerProyek);

  // Import backup
  document.getElementById("file-import-backup")?.addEventListener("change", handleImportBackup);

  // Lihat backup tersimpan
  document.getElementById("tombol-lihat-backup")?.addEventListener("click", lihatBackupTersimpan);

  // Hapus backup lama
  document.getElementById("tombol-hapus-backup")?.addEventListener("click", hapusBackupLama);

  // Update backup info
  updateBackupInfo();
}

// Fungsi backup semua data - SANGAT PRAKTIS!
async function backupSemuaData() {
  try {
    showCustomAlert("Mempersiapkan backup semua data...", "Backup");

    // Format tanggal untuk nama file
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');

    // Siapkan data untuk backup
    const backupData = {
      metadata: {
        type: "full_backup",
        version: "1.0",
        exportedAt: now.toISOString(),
        user: currentUser?.email || "unknown",
        itemCount: {
          projects: daftarProyek.length,
          activities: allActivities.length
        }
      },
      data: {
        projects: daftarProyek.map(p => ({
          nama: p.nama,
          parentId: p.parentId,
          isCollapsed: p.isCollapsed || false
        })),
        activities: allActivities.map(a => ({
          teks: a.teks,
          kategori: a.kategori || "Lainnya",
          proyekId: a.proyekId,
          selesai: a.selesai,
          durasi: a.durasi || 0,
          createdAt: a.createdAt?.toDate()?.toISOString() || now.toISOString(),
          waktuSelesai: a.waktuSelesai?.toDate()?.toISOString()
        })),
        settings: pengaturan
      }
    };

    // Convert ke JSON
    const jsonStr = JSON.stringify(backupData, null, 2);

    // Buat blob dan download
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Nama file yang user-friendly
    const fileName = `backup-activity-logger-${dateStr}_${timeStr}.json`;

    // Buat link download
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Simpan info backup ke localStorage
    saveBackupInfo({
      fileName: fileName,
      timestamp: now.toISOString(),
      itemCount: {
        projects: daftarProyek.length,
        activities: allActivities.length
      }
    });

    // Tampilkan notifikasi sukses
    showCustomAlert(
      `✅ Backup berhasil dibuat!\n\n` +
      `📁 File: ${fileName}\n` +
      `📊 Berisi:\n` +
      `• ${daftarProyek.length} proyek\n` +
      `• ${allActivities.length} kegiatan\n` +
      `• Pengaturan aplikasi\n\n` +
      `File telah didownload ke folder Downloads Anda.`,
      "Backup Sukses"
    );

  } catch (error) {
    console.error("Backup error:", error);
    showCustomAlert(
      `❌ Gagal membuat backup:\n${error.message}`,
      "Error Backup"
    );
  }
}
// Fungsi import backup yang sederhana
async function handleImportBackup(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    // Tampilkan loading
    showCustomAlert("Membaca file backup...", "Import");

    const text = await file.text();
    const backupData = JSON.parse(text);

    // Validasi file backup
    if (!backupData.metadata || !backupData.data) {
      throw new Error("Format file backup tidak valid.");
    }

    // Tampilkan preview
    const previewHtml = `
      <div class="space-y-3">
        <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <div class="font-bold">File Backup:</div>
          <div class="text-sm mt-1">
            <div>• ${file.name}</div>
            <div>• ${(file.size / 1024).toFixed(1)} KB</div>
            <div>• Tipe: ${backupData.metadata.type || 'unknown'}</div>
            ${backupData.metadata.exportedAt ?
        `<div>• Tanggal: ${new Date(backupData.metadata.exportedAt).toLocaleString('id-ID')}</div>` : ''}
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
            <div class="text-xl font-bold">${backupData.metadata.itemCount?.projects || 0}</div>
            <div class="text-sm">Proyek</div>
          </div>
          <div class="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg text-center">
            <div class="text-xl font-bold">${backupData.metadata.itemCount?.activities || 0}</div>
            <div class="text-sm">Kegiatan</div>
          </div>
        </div>
        
        <div class="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
          <div class="text-sm">
            <strong>⚠️ Catatan:</strong> Data akan ditambahkan, tidak menggantikan data yang ada.
          </div>
        </div>
      </div>
    `;

    const confirmed = await showCustomAlertWithForm(
      "Konfirmasi Import",
      previewHtml,
      ["Import Data", "Batal"]
    );

    if (!confirmed) {
      event.target.value = ''; // Reset input
      return;
    }

    // Proses import
    showCustomAlert("Mengimport data...", "Import");

    let importedCount = 0;
    const batch = writeBatch(db);

    // Import proyek
    if (backupData.data.projects && Array.isArray(backupData.data.projects)) {
      for (const project of backupData.data.projects) {
        // Cek apakah proyek sudah ada
        const existingProject = daftarProyek.find(p => p.nama === project.nama && p.parentId === project.parentId);

        if (!existingProject) {
          const projectRef = doc(collection(db, "users", currentUser.uid, "projects"));
          batch.set(projectRef, {
            nama: project.nama,
            parentId: project.parentId || null,
            isCollapsed: project.isCollapsed || false,
            order: Date.now(),
            createdAt: serverTimestamp()
          });
          importedCount++;
        }
      }
    }

    // Import kegiatan
    if (backupData.data.activities && Array.isArray(backupData.data.activities)) {
      for (const activity of backupData.data.activities) {
        const activityRef = doc(collection(db, "users", currentUser.uid, "activities"));

        // Convert tanggal string ke Timestamp jika perlu
        let createdAt = serverTimestamp();
        if (activity.createdAt) {
          try {
            const date = new Date(activity.createdAt);
            if (!isNaN(date.getTime())) {
              createdAt = Timestamp.fromDate(date);
            }
          } catch (err) {
            // Tetap pakai serverTimestamp jika error
          }
        }

        batch.set(activityRef, {
          teks: activity.teks,
          kategori: activity.kategori || "Lainnya",
          proyekId: activity.proyekId || null,
          selesai: activity.selesai || false,
          durasi: activity.durasi || 0,
          status: "idle",
          isFocusing: false,
          createdAt: createdAt,
          waktuSelesai: null,
          order: Date.now()
        });
        importedCount++;
      }
    }

    // Import settings (opsional)
    if (backupData.data.settings && Object.keys(backupData.data.settings).length > 0) {
      // Merge dengan settings yang ada
      const mergedSettings = { ...pengaturan, ...backupData.data.settings };
      localStorage.setItem("activityLoggerSettings", JSON.stringify(mergedSettings));
    }

    // Commit batch jika ada data
    if (importedCount > 0) {
      await batch.commit();
    }

    // Reset input file
    event.target.value = '';

    // Tampilkan hasil
    showCustomAlert(
      `✅ Import berhasil!\n\n` +
      `📥 ${importedCount} item diimport\n` +
      `🔄 Silakan refresh halaman untuk melihat data baru`,
      "Import Sukses"
    );

  } catch (error) {
    console.error("Import error:", error);
    event.target.value = ''; // Reset input

    let errorMessage = `❌ Gagal mengimport data:\n${error.message}\n\n`;

    if (error.message.includes("JSON")) {
      errorMessage += "File tidak valid. Pastikan file berformat JSON yang benar.";
    } else if (error.message.includes("quota")) {
      errorMessage += "Kuota database penuh. Coba hapus beberapa data lama.";
    } else {
      errorMessage += "Coba periksa koneksi internet dan coba lagi.";
    }

    showCustomAlert(errorMessage, "Error Import");
  }
}

// Simpan info backup ke localStorage
function saveBackupInfo(backupInfo) {
  try {
    const backups = JSON.parse(localStorage.getItem('activityLoggerBackups') || '[]');
    backups.push({
      ...backupInfo,
      id: Date.now().toString()
    });

    // Simpan maksimal 50 backup terakhir
    if (backups.length > 50) {
      backups.shift();
    }

    localStorage.setItem('activityLoggerBackups', JSON.stringify(backups));
    updateBackupInfo();

  } catch (error) {
    console.error("Error saving backup info:", error);
  }
}

// Update tampilan info backup
function updateBackupInfo() {
  try {
    const backups = JSON.parse(localStorage.getItem('activityLoggerBackups') || '[]');
    const lastBackupElement = document.getElementById('last-backup-time');
    const totalBackupsElement = document.getElementById('total-backups');
    const dataSizeElement = document.getElementById('data-size');

    if (lastBackupElement) {
      if (backups.length > 0) {
        const lastBackup = backups[backups.length - 1];
        const date = new Date(lastBackup.timestamp);
        lastBackupElement.textContent = date.toLocaleString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } else {
        lastBackupElement.textContent = "Belum ada";
      }
    }

    if (totalBackupsElement) {
      totalBackupsElement.textContent = `${backups.length} file`;
    }

    if (dataSizeElement) {
      // Hitung ukuran data aproksimasi
      const totalActivities = allActivities.length;
      const totalProjects = daftarProyek.length;
      const approxSizeKB = Math.round((totalActivities * 0.5 + totalProjects * 0.1) * 10) / 10;
      dataSizeElement.textContent = `${approxSizeKB} KB`;
    }

  } catch (error) {
    console.error("Error updating backup info:", error);
  }
}

// Lihat backup tersimpan
async function lihatBackupTersimpan() {
  try {
    const backups = JSON.parse(localStorage.getItem('activityLoggerBackups') || '[]');

    if (backups.length === 0) {
      showCustomAlert("Belum ada backup yang tersimpan di browser.", "Info");
      return;
    }

    const backupList = backups.map((backup, index) => {
      const date = new Date(backup.timestamp);
      return `
        <div class="border-b border-slate-200 dark:border-slate-700 py-3 last:border-b-0">
          <div class="flex justify-between items-start">
            <div>
              <div class="font-bold">${backup.fileName || `Backup ${index + 1}`}</div>
              <div class="text-sm text-slate-500 dark:text-slate-400">
                ${date.toLocaleString('id-ID')}
              </div>
            </div>
            <div class="text-right text-sm">
              <div>${backup.itemCount?.projects || 0} proyek</div>
              <div>${backup.itemCount?.activities || 0} kegiatan</div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    const htmlContent = `
      <div class="space-y-3">
        <div class="text-sm text-slate-500 dark:text-slate-400">
          Backup yang tersimpan di browser Anda:
        </div>
        <div class="max-h-60 overflow-y-auto">
          ${backupList}
        </div>
        <div class="text-xs text-slate-400 dark:text-slate-500">
          Catatan: Backup hanya tersimpan di browser ini.
        </div>
      </div>
    `;

    await showCustomAlertWithForm(
      "Backup Tersimpan",
      htmlContent,
      ["Tutup"]
    );

  } catch (error) {
    console.error("Error viewing backups:", error);
    showCustomAlert("Gagal memuat daftar backup.", "Error");
  }
}

// Hapus backup lama
async function hapusBackupLama() {
  try {
    const backups = JSON.parse(localStorage.getItem('activityLoggerBackups') || '[]');

    if (backups.length === 0) {
      showCustomAlert("Tidak ada backup untuk dihapus.", "Info");
      return;
    }

    const confirmed = await showCustomConfirm(
      `Yakin ingin menghapus ${backups.length} backup yang tersimpan?\n\n` +
      `Backup hanya tersimpan di browser ini dan tidak mempengaruhi file yang sudah didownload.`,
      "Hapus Backup",
      "Ya, Hapus Semua",
      "Batal"
    );

    if (confirmed) {
      localStorage.removeItem('activityLoggerBackups');
      updateBackupInfo();
      showCustomAlert("Semua backup telah dihapus dari browser.", "Sukses");
    }

  } catch (error) {
    console.error("Error deleting backups:", error);
    showCustomAlert("Gagal menghapus backup.", "Error");
  }
}


async function updateOrderInFirestore(itemIds, listType) {
  if (!currentUser || !itemIds || itemIds.length === 0) return; // Tambahkan pengecekan itemIds

  const batch = writeBatch(db);
  const collectionName = listType === "projects" ? "projects" : "activities";
  const baseOrder = Date.now();

  itemIds.forEach((id, index) => {
    if (id) {
      const docRef = doc(db, "users", currentUser.uid, collectionName, id);
      batch.update(docRef, { order: baseOrder + index * 10 });
    }
  });

  try {
    await safeBatchCommit(batch, {
      operation: "updateOrder",
      itemCount: itemIds.length // PERBAIKAN: pakai itemIds bukan itemIds.length
    });
  } catch (error) {
    console.error("Gagal memperbarui urutan: ", error);
    showCustomAlert("Gagal menyimpan urutan baru.", "Error");
  }
}

function renderDaftarUtama() {
  if (!currentUser) return;

  const daftarKegiatan = [...allActivities].sort(
    (a, b) => (a.order || 0) - (b.order || 0)
  );

  daftarProyekContainer.innerHTML = "";
  daftarKegiatanLainElement.innerHTML = "";
  const projectsById = daftarProyek.reduce(
    (acc, p) => ({ ...acc, [p.id]: { ...p, children: [] } }),
    {}
  );
  const rootProjects = [];
  daftarProyek.forEach((p) => {
    if (p.parentId && projectsById[p.parentId]) {
      if (!projectsById[p.parentId].children)
        projectsById[p.parentId].children = [];
      projectsById[p.parentId].children.push(projectsById[p.id]);
    } else {
      rootProjects.push(projectsById[p.id]);
    }
  });
  rootProjects
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .forEach((proyek) => {
      daftarProyekContainer.appendChild(
        renderProyekRecursive(proyek, daftarKegiatan)
      );
    });

  const kegiatanTanpaProyek = daftarKegiatan.filter((k) => !k.proyekId);
  daftarKegiatanLainElement.dataset.proyekId = "";
  kegiatanTanpaProyek.forEach((kegiatan) => {
    const liKegiatan = buatElemenKegiatan(kegiatan);
    liKegiatan.classList.add(
      "bg-white",
      "dark:bg-slate-800",
      "rounded-xl",
      "shadow-sm",
      "p-4"
    );
    daftarKegiatanLainElement.appendChild(liKegiatan);
  });

  const adaItem = rootProjects.length > 0 || daftarKegiatan.length > 0;
  pesanKosongElement.style.display = adaItem ? "none" : "block";

  initSortable();
}

function renderProyekRecursive(proyek, daftarKegiatan) {
  const subTugasUntukProyekIni = daftarKegiatan.filter(
    (k) => k.proyekId === proyek.id
  );
  const container = document.createElement("div");

  container.appendChild(buatElemenProyek(proyek, subTugasUntukProyekIni));

  if (proyek.children && proyek.children.length > 0) {
    const childrenContainer = document.createElement("div");
    childrenContainer.className = `sub-projects-container ml-5 ${proyek.isCollapsed ? "collapsed" : ""
      }`;
    proyek.children
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .forEach((child) => {
        childrenContainer.appendChild(
          renderProyekRecursive(child, daftarKegiatan)
        );
      });
    container.appendChild(childrenContainer);
  }
  return container;
}

function buatElemenProyek(proyek, subTugas) {
  const liProyek = document.createElement("div");
  liProyek.className =
    "list-proyek bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden transition-all duration-300 mb-4";
  liProyek.dataset.proyekId = proyek.id;
  const totalDurasiProyekMs = subTugas
    .filter(
      (k) =>
        k.selesai &&
        k.durasi &&
        k.waktuSelesai &&
        isSameDay(k.waktuSelesai.toDate(), currentDate)
    )
    .reduce((total, k) => total + k.durasi, 0);
  liProyek.innerHTML = `
        <div class="p-4 flex justify-between items-center bg-slate-50 dark:bg-slate-700/50 judul-proyek-container">
            <div class="flex items-center gap-3 flex-grow" >
                <span class="drag-handle cursor-move text-slate-400 text-xl">⠿</span> <div class="flex items-center gap-3 flex-grow cursor-pointer" data-action="toggle">
                    <span class="toggle-proyek transform transition-transform ${proyek.isCollapsed ? "-rotate-90" : ""
    }">▼</span>
                    <strong class="text-slate-900 dark:text-white text-lg">${proyek.nama
    }</strong>
                </div>
            </div>
            <div class="flex items-center gap-1 flex-shrink-0">
                <span class="text-sm text-slate-500 dark:text-slate-400 font-medium mr-2">Hari Ini: ${formatDurasi(
      totalDurasiProyekMs
    )}</span>
                <button title="Tambah Kegiatan" data-action="add-activity" class="text-lg text-green-500 hover:bg-green-100 dark:hover:bg-slate-600 rounded-full w-8 h-8 flex items-center justify-center">+</button>
                <button title="Tambah Sub-Proyek" data-action="add-subproject" class="text-lg text-blue-500 hover:bg-blue-100 dark:hover:bg-slate-600 rounded-full w-8 h-8 flex items-center justify-center">📂</button>
                <button title="Hapus proyek dan semua turunannya" data-action="delete-project" class="text-xl text-red-500 hover:bg-red-100 dark:hover:bg-slate-600 rounded-full w-8 h-8 flex items-center justify-center">&times;</button>
            </div>
        </div>
        <ul class="list-subtugas p-4 pt-0 space-y-2 ${proyek.isCollapsed ? "collapsed" : ""
    }" data-proyek-id="${proyek.id}">
            ${subTugas
      .map((k) => buatElemenKegiatan(k, true).outerHTML)
      .join("")}
        </ul>`;
  return liProyek;
}

function buatElemenKegiatan(kegiatan, isSubtugas = false) {
  const li = document.createElement("li");
  li.className = isSubtugas
    ? "flex flex-col gap-2 border-b border-slate-200 dark:border-slate-700 py-3 last:border-b-0 bg-white dark:bg-slate-800 p-2 rounded-lg"
    : "flex flex-col gap-2";
  li.dataset.kegiatanId = kegiatan.id;
  const mainContent = document.createElement("div");
  mainContent.className = "flex justify-between items-start";
  let teksElementHTML;
  if (kegiatan.isEditing) {
    teksElementHTML = `<input type="text" value="${kegiatan.teks.replace(
      /"/g,
      "&quot;"
    )}" class="input-edit-kegiatan flex-grow bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-400 dark:border-yellow-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-slate-900 dark:text-white">`;
  } else {
    teksElementHTML = `<span class="text-slate-800 dark:text-slate-200 ${kegiatan.selesai ? "line-through text-slate-400 dark:text-slate-500" : ""
      }">${kegiatan.teks}</span>`;
  }
  mainContent.innerHTML = `
        <div class="flex items-center gap-2 flex-wrap flex-grow mr-2">
            <span class="drag-handle cursor-move text-slate-400">⠿</span> ${kegiatan.kategori
      ? `<span class="kategori-tag text-xs font-bold px-2 py-1 rounded-full text-white ${getWarnaKategori(
        kegiatan.kategori
      )}">${kegiatan.kategori}</span>`
      : ""
    }
            ${teksElementHTML}
        </div>
        <div class="flex items-center gap-1 flex-shrink-0">
            <button title="Edit" data-action="edit-activity" class="p-1 text-slate-400 hover:text-blue-600 ${kegiatan.isEditing || kegiatan.status === "tracking"
      ? "hidden"
      : ""
    }">✏️</button>
            <button title="Simpan" data-action="save-activity" class="p-1 text-slate-400 hover:text-green-600 ${!kegiatan.isEditing ? "hidden" : ""
    }">💾</button>
            <button title="Hapus" data-action="delete-activity" class="p-1 text-slate-400 hover:text-red-600 ${kegiatan.status === "tracking" ? "hidden" : ""
    }">🗑️</button>
        </div>`;

  const actionBar = document.createElement("div");
  actionBar.className = "flex items-center gap-2";

  let timerDisplayHTML = `<div 
        class="timer-display font-bold ${pengaturan.tampilTimer ? "" : "hidden"
    }" 
        id="timer-${kegiatan.id}"
        style="color: ${pengaturan.warnaTimer}; font-size: ${getUkuranFontTimer(
      pengaturan.ukuranTimer
    )};">
    </div>`;

  let actionButtonsHTML = "";
  if (!kegiatan.selesai && !kegiatan.isEditing) {
    const finishButton = `<button data-action="finish-activity" class="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1 px-3 rounded-md">Selesai</button>`;
    switch (kegiatan.status) {
      case "tracking":
        actionButtonsHTML = `<button data-action="pause-timer" class="bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold py-1 px-3 rounded-md">Pause</button>${finishButton}`;
        break;
      case "paused":
        actionButtonsHTML = `<button data-action="resume-timer" class="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-1 px-3 rounded-md">Lanjutkan</button>${finishButton}`;
        break;
      default: // 'idle'
        actionButtonsHTML = `<button data-action="start-focus" class="bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold py-1 px-3 rounded-md">Fokus</button>`;
        break;
    }
  }

  actionBar.innerHTML = `${timerDisplayHTML}<div class="flex gap-2 ml-auto">${actionButtonsHTML}</div>`;

  li.appendChild(mainContent);
  li.appendChild(actionBar);
  return li;
}

function perbaruiStatistik() {
  const kegiatanSelesaiHariIni = allActivities.filter(
    (k) =>
      k.selesai &&
      k.durasi > 0 &&
      k.waktuSelesai &&
      isSameDay(k.waktuSelesai.toDate(), currentDate)
  );

  if (kegiatanSelesaiHariIni.length === 0) {
    if (kontenStatistikTeks)
      kontenStatistikTeks.innerHTML =
        "<p>Selesaikan tugas hari ini untuk melihat statistik.</p>";
    if (statistikChart) {
      statistikChart.destroy();
      statistikChart = null;
    }
    return;
  }

  const totalDurasiUnikMs = kegiatanSelesaiHariIni.reduce(
    (total, k) => total + k.durasi,
    0
  );
  const durasiPerKategori = {};
  kegiatanSelesaiHariIni.forEach((k) => {
    const kategori = k.kategori || "Lainnya";
    durasiPerKategori[kategori] = (durasiPerKategori[kategori] || 0) + k.durasi;
  });

  kontenStatistikTeks.innerHTML = `<p class="flex justify-between py-1"><span>Total Waktu Produktif Hari Ini:</span> <strong>${formatDurasi(
    totalDurasiUnikMs
  )}</strong></p><p class="flex justify-between py-1"><span>Tugas Selesai Hari Ini:</span> <strong>${kegiatanSelesaiHariIni.length
    }</strong></p>`;

  if (statistikChart) statistikChart.destroy();

  const isDark = document.documentElement.classList.contains("dark");

  statistikChart = new Chart(statistikChartCanvas, {
    type: "doughnut",
    data: {
      labels: Object.keys(durasiPerKategori),
      datasets: [
        {
          data: Object.values(durasiPerKategori),
          backgroundColor: Object.keys(durasiPerKategori).map((label) =>
            getWarnaKategori(label, true)
          ),
          borderColor: isDark ? "#1E293B" : "#FFFFFF",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding: 15,
            color: isDark ? "#94A3B8" : "#475569",
          },
        },
        tooltip: {
          callbacks: {
            label: (context) =>
              ` ${context.label}: ${formatDurasi(context.raw)}`,
          },
        },
      },
    },
  });
}

async function tambahProyek() {
  const namaProyek = inputProyek.value.trim();
  if (!namaProyek) return showCustomAlert("Nama proyek tidak boleh kosong.");
  const parentId =
    pilihProyekInduk.value === "none" ? null : pilihProyekInduk.value;
  const isDuplicate = daftarProyek.some(
    (p) =>
      p.nama.toLowerCase() === namaProyek.toLowerCase() &&
      p.parentId === parentId
  );
  if (isDuplicate)
    return showCustomAlert(`Proyek "${namaProyek}" sudah ada di level ini.`);

  await safeAddDoc(collection(db, "users", currentUser.uid, "projects"), {
    nama: namaProyek,
    parentId: parentId,
    isCollapsed: false,
    createdAt: serverTimestamp(),
    order: Date.now(),
  });

  const projectsQuery = query(
    collection(db, "users", currentUser.uid, "projects"),
    orderBy("order", "asc")
  );
  const projectSnapshot = await safeGetDocs(projectsQuery);
  daftarProyek = projectSnapshot.docs.map((docSnapshot) => ({
    id: docSnapshot.id,
    ...docSnapshot.data(),
  }));
  renderProyekDropdowns();
  renderDaftarUtama();
  inputProyek.value = "";
}

async function tambahKegiatan() {
  const teksKegiatan = inputKegiatan.value.trim();
  if (!teksKegiatan)
    return showCustomAlert("Nama kegiatan tidak boleh kosong.");
  const [jam, menit] = inputWaktu.value.split(":");
  const tanggalKegiatan = new Date(currentDate);
  if (inputWaktu.value) {
    tanggalKegiatan.setHours(parseInt(jam, 10), parseInt(menit, 10), 0, 0);
  } else {
    const now = new Date();
    tanggalKegiatan.setHours(
      now.getHours(),
      now.getMinutes(),
      now.getSeconds()
    );
  }

  await safeAddDoc(collection(db, "users", currentUser.uid, "activities"), {
    teks: teksKegiatan,
    kategori: inputKategori.value,
    proyekId:
      pilihProyekKegiatan.value !== "none" ? pilihProyekKegiatan.value : null,
    selesai: false,
    durasi: 0,
    isEditing: false,
    status: "tracking", // <-- DIUBAH: Langsung berjalan saat dibuat
    isFocusing: false,
    lastStartTime: serverTimestamp(), // <-- DIUBAH: Catat waktu mulai
    focusEndTime: null,
    remainingTime: 0,
    createdAt: Timestamp.fromDate(tanggalKegiatan),
    waktuSelesai: null,
    order: Date.now(),
  });
  inputKegiatan.value = "";
  inputWaktu.value = "";
  inputKegiatan.focus();
}

// === FIREBASE WRAPPER FUNCTIONS ===
async function safeAddDoc(collectionRef, data, context = {}) {
  return await safeFirestoreCall(
    () => addDoc(collectionRef, data),
    { action: "addDoc", collection: collectionRef.path, ...context }
  );
}

async function safeUpdateDoc(docRef, data, context = {}) {
  return await safeFirestoreCall(
    () => updateDoc(docRef, data),
    { action: "updateDoc", doc: docRef.path, ...context }
  );
}

async function safeDeleteDoc(docRef, context = {}) {
  return await safeFirestoreCall(
    () => deleteDoc(docRef),
    { action: "deleteDoc", doc: docRef.path, ...context }
  );
}

async function safeSetDoc(docRef, data, options = {}, context = {}) {
  return await safeFirestoreCall(
    () => setDoc(docRef, data, options),
    { action: "setDoc", doc: docRef.path, ...context }
  );
}

async function safeGetDocs(queryRef, context = {}) {
  return await safeFirestoreCall(
    () => getDocs(queryRef),
    { action: "getDocs", query: queryRef, ...context }
  );
}

// Batch operations wrapper
async function safeBatchCommit(batch, context = {}) {
  return await safeFirestoreCall(
    () => batch.commit(),
    { action: "batchCommit", ...context }
  );
}

// Increment wrapper
function safeIncrement(value) {
  return increment(value);
}

async function handleListClick(e) {
  if (!currentUser) return;
  const target = e.target;
  const action = target.closest("[data-action]")?.dataset.action;
  if (!action) return;
  const liProyek = target.closest(".list-proyek");
  const proyekId = liProyek?.dataset.proyekId;
  if (proyekId) {
    const proyekIndex = daftarProyek.findIndex((p) => p.id === proyekId);
    if (proyekIndex > -1) {
      const proyek = daftarProyek[proyekIndex];
      switch (action) {
        case "toggle":
          await safeUpdateDoc(
            doc(db, "users", currentUser.uid, "projects", proyekId),
            { isCollapsed: !proyek.isCollapsed }
          );
          break;
        case "add-activity":
          const result = await showAddActivityPrompt(
            `Tambah kegiatan ke proyek "${proyek.nama}":`,
            "Tambah Kegiatan Baru"
          );
          if (result) {
            const tanggalKegiatan = new Date(currentDate);
            const now = new Date();
            tanggalKegiatan.setHours(
              now.getHours(),
              now.getMinutes(),
              now.getSeconds()
            );
            await safeAddDoc(
              collection(db, "users", currentUser.uid, "activities"),
              {
                teks: result.text,
                proyekId: proyekId,
                kategori: result.category,
                selesai: false,
                durasi: 0,
                isEditing: false,
                status: "tracking", // <-- DIUBAH: Langsung berjalan saat dibuat
                isFocusing: false,
                lastStartTime: serverTimestamp(), // <-- DIUBAH: Catat waktu mulai
                focusEndTime: null,
                remainingTime: 0,
                createdAt: Timestamp.fromDate(tanggalKegiatan),
                waktuSelesai: null,
                order: Date.now(),
              }
            );
          }
          break;
        case "add-subproject":
          const namaSubProyek = await showCustomPrompt(
            `Masukkan nama sub-proyek untuk "${proyek.nama}":`,
            "Tambah Sub-Proyek"
          );
          if (namaSubProyek && namaSubProyek.trim()) {
            const oldParentValue = pilihProyekInduk.value;
            pilihProyekInduk.value = proyekId;
            inputProyek.value = namaSubProyek.trim();
            await tambahProyek();
            pilihProyekInduk.value = oldParentValue;
          }
          break;
        case "delete-project":
          const confirmation = await showCustomConfirm(
            `Yakin ingin menghapus proyek "${proyek.nama}"? Ini akan menghapus SEMUA sub-proyek dan kegiatannya.`,
            "Hapus Proyek"
          );
          if (confirmation) await hapusProyekDanTurunannya(proyekId);
          break;
      }
    }
  }
  const liKegiatan = target.closest("li[data-kegiatan-id]");
  if (liKegiatan) {
    const kegiatanId = liKegiatan.dataset.kegiatanId;
    const kegiatan = allActivities.find((k) => k.id === kegiatanId);
    if (!kegiatan) return;
    const docRef = doc(db, "users", currentUser.uid, "activities", kegiatanId);
    switch (action) {
      case "edit-activity":
        await safeUpdateDoc(docRef, { isEditing: true });
        break;
      case "save-activity":
        const newText = liKegiatan
          .querySelector(".input-edit-kegiatan")
          .value.trim();
        if (newText)
          await safeUpdateDoc(docRef, { teks: newText, isEditing: false });
        break;
      case "delete-activity":
        const delConfirm = await showCustomConfirm(
          `Yakin ingin menghapus kegiatan "${kegiatan.teks}"?`,
          "Hapus Kegiatan"
        );
        if (delConfirm) await safeDeleteDoc(docRef);
        break;
      case "finish-activity":
        let durasiFinal = kegiatan.durasi || 0;
        if (kegiatan.status === "tracking" && kegiatan.lastStartTime) {
          const elapsed =
            Date.now() - kegiatan.lastStartTime.toDate().getTime();
          durasiFinal += elapsed;
        }
        await safeUpdateDoc(docRef, {
          selesai: true,
          status: "idle",
          isFocusing: false,
          durasi: durasiFinal,
          waktuSelesai: serverTimestamp(),
        });
        break;
      case "start-tracking": // Aksi ini tidak lagi dipakai dari UI, tapi kita biarkan kodenya
        await safeUpdateDoc(docRef, {
          status: "tracking",
          isFocusing: false,
          lastStartTime: serverTimestamp(),
        });
        break;
      case "start-focus":
        const durasiMenit = await showCustomPrompt(
          "Atur timer fokus (menit):",
          "Fokus Mode",
          "25"
        );
        if (
          durasiMenit &&
          !isNaN(parseInt(durasiMenit, 10)) &&
          parseInt(durasiMenit, 10) > 0
        ) {
          if (Notification.permission !== "granted")
            await requestNotificationPermission();
          const durasiMs = parseInt(durasiMenit, 10) * 60 * 1000;
          const waktuSelesaiFokus = new Date(Date.now() + durasiMs);
          await safeUpdateDoc(docRef, {
            status: "tracking",
            isFocusing: true,
            lastStartTime: serverTimestamp(),
            focusEndTime: Timestamp.fromDate(waktuSelesaiFokus),
            remainingTime: durasiMs,
          });
        }
        break;
      case "pause-timer":
        if (kegiatan.status === "tracking" && kegiatan.lastStartTime) {
          const elapsed =
            Date.now() - kegiatan.lastStartTime.toDate().getTime();
          const updateData = {
            status: "paused",
            durasi: increment(elapsed),
            lastStartTime: null,
          };
          if (kegiatan.isFocusing && kegiatan.focusEndTime) {
            const sisaWaktu =
              kegiatan.focusEndTime.toDate().getTime() - Date.now();
            updateData.remainingTime = sisaWaktu > 0 ? sisaWaktu : 0;
          }
          await safeUpdateDoc(docRef, updateData);
        }
        break;
      case "resume-timer":
        if (kegiatan.status === "paused") {
          const updateData = {
            status: "tracking",
            lastStartTime: serverTimestamp(),
          };
          if (kegiatan.isFocusing && kegiatan.remainingTime > 0) {
            const newFocusEndTime = new Date(
              Date.now() + kegiatan.remainingTime
            );
            updateData.focusEndTime = Timestamp.fromDate(newFocusEndTime);
          }
          await safeUpdateDoc(docRef, updateData);
        }
        break;
    }
  }
}

async function hapusProyekDanTurunannya(proyekId) {
  const batch = writeBatch(db);
  const projectsToDelete = [proyekId];
  const projectsToSearch = [proyekId];
  while (projectsToSearch.length > 0) {
    const currentId = projectsToSearch.pop();
    const children = daftarProyek.filter((p) => p.parentId === currentId);
    for (const child of children) {
      projectsToDelete.push(child.id);
      projectsToSearch.push(child.id);
    }
  }
  projectsToDelete.forEach((id) =>
    batch.delete(doc(db, "users", currentUser.uid, "projects", id))
  );
  const activityReads = [];
  for (let i = 0; i < projectsToDelete.length; i += 30) {
    const chunk = projectsToDelete.slice(i, i + 30);
    const q = query(
      collection(db, "users", currentUser.uid, "activities"),
      where("proyekId", "in", chunk)
    );
    activityReads.push(safeGetDocs(q));
  }
  const activitySnapshots = await Promise.all(activityReads);
  activitySnapshots.forEach((snapshot) => {
    snapshot.forEach((doc) => batch.delete(doc.ref));
  });
  await safeBatchCommit(batch, {
    operation: "updateOrder",
    itemCount: itemIds.length
  });
  daftarProyek = daftarProyek.filter((p) => !projectsToDelete.includes(p.id));
  renderProyekDropdowns();
  renderDaftarUtama();
  perbaruiStatistik();
}

async function requestNotificationPermission() {
  if ("Notification" in window) {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      showCustomAlert(
        "Notifikasi tidak diizinkan. Anda tidak akan menerima pemberitahuan saat timer selesai.",
        "Perhatian"
      );
    }
  }
}

function kirimNotifikasiFokusSelesai(kegiatan) {
  const title = "⏰ Sesi Fokus Selesai!";
  const options = {
    body: `Waktu untuk "${kegiatan.teks}" telah habis. Jangan lupa istirahat!`,
    icon: "images/icon-192.png",
    vibrate: [200, 100, 200],
    tag: "fokus-selesai",
    data: {
      url: window.location.href,
    },
  };

  if (
    "Notification" in window &&
    "serviceWorker" in navigator &&
    Notification.permission === "granted"
  ) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, options);
    });
  } else if (Notification.permission !== "denied") {
    new Notification(title, options);
  } else {
    new Audio(
      "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg"
    ).play();
  }
}


// === SETUP POMODORO & REMINDERS ===
function setupPomodoroAndReminders() {
  createPomodoroUI();
  setupPomodoroEventListeners();
  startReminderSystem();
  updatePomodoroStats();
}

// === CREATE POMODORO UI ===
function createPomodoroUI() {
  // Add Pomodoro button to header
  const headerButtons = document.querySelector('.flex.items-center.border.border-slate-300');

  // Cek apakah tombol sudah ada
  if (headerButtons && !document.getElementById('pomodoro-button')) {
    try {
      pomodoroButton = document.createElement('button');
      pomodoroButton.id = 'pomodoro-button';
      pomodoroButton.title = 'Pomodoro Timer';
      pomodoroButton.className = 'text-xl text-slate-400 hover:text-red-600 p-2 rounded-full transition-colors';
      pomodoroButton.innerHTML = '🍅';
      pomodoroButton.style.marginLeft = '8px';
      pomodoroButton.style.minWidth = '44px';
      pomodoroButton.style.minHeight = '44px';

      // Tambahkan sebelum tombol settings
      const settingsButton = document.getElementById('tombol-pengaturan');
      if (settingsButton && settingsButton.parentNode) {
        settingsButton.parentNode.insertBefore(pomodoroButton, settingsButton);
      } else {
        headerButtons.appendChild(pomodoroButton);
      }

      console.log('Pomodoro button created');
    } catch (error) {
      console.error('Error creating Pomodoro button:', error);
    }
  }


  // Create Pomodoro modal
  if (!document.getElementById('pomodoro-modal')) {
    pomodoroModal = document.createElement('div');
    pomodoroModal.id = 'pomodoro-modal';
    pomodoroModal.className = 'fixed inset-0 bg-slate-900 bg-opacity-50 items-center justify-center z-50 p-4 hidden';
    pomodoroModal.innerHTML = `
      <div class="bg-white dark:bg-slate-800 w-full max-w-md p-6 rounded-xl shadow-2xl relative">
        <button id="tombol-tutup-pomodoro" class="absolute top-4 right-4 text-2xl text-slate-500 hover:text-red-500">
          &times;
        </button>
        
        <h3 class="text-xl font-bold mb-6 text-slate-900 dark:text-white text-center">
          🍅 Pomodoro Timer
        </h3>
        
        <div class="text-center mb-6">
          <div id="pomodoro-timer-display" class="text-5xl font-bold mb-4 text-slate-900 dark:text-white">
            25:00
          </div>
          <div id="pomodoro-status" class="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
            Fokus Time
          </div>
          <div id="pomodoro-session-count" class="text-sm text-slate-500 dark:text-slate-400">
            Sesi 0/4
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4 mb-6">
          <button id="pomodoro-start" class="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
            Mulai
          </button>
          <button id="pomodoro-pause" class="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
            Pause
          </button>
          <button id="pomodoro-reset" class="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
            Reset
          </button>
          <button id="pomodoro-skip" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
            Skip
          </button>
        </div>
        
        <div class="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg mb-4">
          <h4 class="font-bold mb-2 text-slate-700 dark:text-slate-300">Pengaturan</h4>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm text-slate-600 dark:text-slate-400 mb-1">Fokus (menit)</label>
              <input type="number" id="pomodoro-focus-time" value="25" min="1" max="60" 
                class="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-center">
            </div>
            <div>
              <label class="block text-sm text-slate-600 dark:text-slate-400 mb-1">Istirahat (menit)</label>
              <input type="number" id="pomodoro-break-time" value="5" min="1" max="30" 
                class="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-center">
            </div>
          </div>
        </div>
        
        <div class="flex justify-between text-sm text-slate-500 dark:text-slate-400">
          <div>Sesi selesai hari ini: <span id="completed-sessions-today">0</span></div>
          <div>Total waktu fokus: <span id="total-focus-time">0m</span></div>
        </div>
      </div>
    `;

    document.body.appendChild(pomodoroModal);
  }
}

// === SETUP POMODORO EVENT LISTENERS ===
function setupPomodoroEventListeners() {
  // Open Pomodoro modal
  pomodoroButton?.addEventListener('click', () => {
    updatePomodoroDisplay();
    pomodoroModal.classList.remove('hidden');
    pomodoroModal.classList.add('flex');
  });

  // Close Pomodoro modal
  document.getElementById('tombol-tutup-pomodoro')?.addEventListener('click', () => {
    pomodoroModal.classList.add('hidden');
    pomodoroModal.classList.remove('flex');
  });

  // Close modal when clicking outside
  pomodoroModal?.addEventListener('click', (e) => {
    if (e.target === pomodoroModal) {
      pomodoroModal.classList.add('hidden');
      pomodoroModal.classList.remove('flex');
    }
  });

  // Pomodoro controls
  document.getElementById('pomodoro-start')?.addEventListener('click', startPomodoro);
  document.getElementById('pomodoro-pause')?.addEventListener('click', pausePomodoro);
  document.getElementById('pomodoro-reset')?.addEventListener('click', resetPomodoro);
  document.getElementById('pomodoro-skip')?.addEventListener('click', skipPomodoro);

  // Settings changes
  document.getElementById('pomodoro-focus-time')?.addEventListener('change', updatePomodoroSettings);
  document.getElementById('pomodoro-break-time')?.addEventListener('change', updatePomodoroSettings);
}

// === POMODORO FUNCTIONS ===
function startPomodoro() {
  if (pomodoroState.isRunning) return;

  pomodoroState.isRunning = true;
  pomodoroState.startTime = Date.now();

  if (pomodoroState.isFocusTime) {
    pomodoroState.endTime = pomodoroState.startTime + POMODORO_SETTINGS.FOCUS_DURATION;
  } else {
    pomodoroState.endTime = pomodoroState.startTime + POMODORO_SETTINGS.SHORT_BREAK_DURATION;
  }

  // Start timer
  pomodoroState.timerInterval = setInterval(updatePomodoroTimer, 1000);

  // Update UI
  document.getElementById('pomodoro-start').textContent = 'Sedang Berjalan';
  document.getElementById('pomodoro-start').classList.add('bg-gray-600', 'hover:bg-gray-700');
  document.getElementById('pomodoro-start').classList.remove('bg-green-600', 'hover:bg-green-700');

  // Show notification if in focus mode
  if (pomodoroState.isFocusTime) {
    showNotification(
      '🍅 Fokus Dimulai!',
      `Sesi fokus ${POMODORO_SETTINGS.FOCUS_DURATION / 60000} menit telah dimulai. Fokus pada tugas Anda!`
    );
  }
}

function pausePomodoro() {
  if (!pomodoroState.isRunning) return;

  clearInterval(pomodoroState.timerInterval);
  pomodoroState.isRunning = false;

  // Update UI
  document.getElementById('pomodoro-start').textContent = 'Lanjutkan';
  document.getElementById('pomodoro-start').classList.remove('bg-gray-600', 'hover:bg-gray-700');
  document.getElementById('pomodoro-start').classList.add('bg-green-600', 'hover:bg-green-700');
}

function resetPomodoro() {
  clearInterval(pomodoroState.timerInterval);
  pomodoroState.isRunning = false;
  pomodoroState.startTime = null;
  pomodoroState.endTime = null;

  // Reset to focus time
  pomodoroState.isFocusTime = true;

  updatePomodoroDisplay();

  // Update UI
  document.getElementById('pomodoro-start').textContent = 'Mulai';
  document.getElementById('pomodoro-start').classList.remove('bg-gray-600', 'hover:bg-gray-700');
  document.getElementById('pomodoro-start').classList.add('bg-green-600', 'hover:bg-green-700');
}

function skipPomodoro() {
  clearInterval(pomodoroState.timerInterval);
  pomodoroState.isRunning = false;

  // Switch mode
  pomodoroState.isFocusTime = !pomodoroState.isFocusTime;

  if (pomodoroState.isFocusTime) {
    pomodoroState.currentSession++;

    // Check if it's time for long break
    if (pomodoroState.currentSession >= POMODORO_SETTINGS.SESSIONS_BEFORE_LONG_BREAK) {
      // Reset session count
      pomodoroState.currentSession = 0;

      // Log completed pomodoro sessions
      saveCompletedPomodoroSession();
    }
  }

  updatePomodoroDisplay();

  // Show notification
  if (pomodoroState.isFocusTime) {
    showNotification(
      '⏰ Waktu Istirahat Selesai!',
      'Kembali ke mode fokus. Selesaikan tugas Anda!'
    );
  } else {
    showNotification(
      '🍅 Waktu Fokus Selesai!',
      `Istirahatlah selama ${POMODORO_SETTINGS.SHORT_BREAK_DURATION / 60000} menit. Jangan lupa minum air!`
    );
  }
}

function updatePomodoroTimer() {
  if (!pomodoroState.endTime) return;

  const now = Date.now();
  const remainingTime = pomodoroState.endTime - now;

  if (remainingTime <= 0) {
    // Time's up!
    clearInterval(pomodoroState.timerInterval);
    pomodoroState.isRunning = false;

    // Automatically switch mode
    skipPomodoro();
    return;
  }

  // Update display
  const minutes = Math.floor(remainingTime / 60000);
  const seconds = Math.floor((remainingTime % 60000) / 1000);
  document.getElementById('pomodoro-timer-display').textContent =
    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Update title for visibility
  document.title = `(${minutes}:${seconds.toString().padStart(2, '0')}) ${pomodoroState.isFocusTime ? '🍅 Fokus' : '☕ Istirahat'} - Activity Logger`;

  // Send notification when 1 minute remaining
  if (remainingTime <= 60000 && Math.floor(remainingTime / 1000) % 60 === 0) {
    showNotification(
      '⚠️ Waktu Hampir Habis!',
      `Sisa waktu ${Math.ceil(remainingTime / 60000)} menit ${pomodoroState.isFocusTime ? 'untuk fokus' : 'untuk istirahat'}.`
    );
  }
}

function updatePomodoroDisplay() {
  const timerDisplay = document.getElementById('pomodoro-timer-display');
  const statusDisplay = document.getElementById('pomodoro-status');
  const sessionDisplay = document.getElementById('pomodoro-session-count');

  if (pomodoroState.isFocusTime) {
    timerDisplay.textContent = `${POMODORO_SETTINGS.FOCUS_DURATION / 60000}:00`;
    statusDisplay.textContent = 'Fokus Time';
    statusDisplay.className = 'text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2';
    sessionDisplay.textContent = `Sesi ${pomodoroState.currentSession + 1}/${POMODORO_SETTINGS.SESSIONS_BEFORE_LONG_BREAK}`;
  } else {
    timerDisplay.textContent = `${POMODORO_SETTINGS.SHORT_BREAK_DURATION / 60000}:00`;
    statusDisplay.textContent = 'Break Time';
    statusDisplay.className = 'text-lg font-semibold text-green-600 dark:text-green-400 mb-2';
    sessionDisplay.textContent = 'Waktu Istirahat';
  }
}

function updatePomodoroSettings() {
  const focusTimeInput = document.getElementById('pomodoro-focus-time');
  const breakTimeInput = document.getElementById('pomodoro-break-time');

  if (focusTimeInput && breakTimeInput) {
    POMODORO_SETTINGS.FOCUS_DURATION = parseInt(focusTimeInput.value) * 60 * 1000;
    POMODORO_SETTINGS.SHORT_BREAK_DURATION = parseInt(breakTimeInput.value) * 60 * 1000;

    // Reset timer with new settings
    if (!pomodoroState.isRunning) {
      updatePomodoroDisplay();
    }

    showCustomAlert('Pengaturan Pomodoro telah diperbarui!', 'Pengaturan Disimpan');
  }
}

function saveCompletedPomodoroSession() {
  const today = new Date().toISOString().split('T')[0];
  const completedSessions = JSON.parse(localStorage.getItem('pomodoroSessions') || '{}');

  if (!completedSessions[today]) {
    completedSessions[today] = {
      count: 0,
      totalFocusTime: 0
    };
  }

  completedSessions[today].count++;
  completedSessions[today].totalFocusTime += POMODORO_SETTINGS.FOCUS_DURATION / 60000; // in minutes

  localStorage.setItem('pomodoroSessions', JSON.stringify(completedSessions));

  // Update display
  updatePomodoroStats();
}

function updatePomodoroStats() {
  const today = new Date().toISOString().split('T')[0];
  const completedSessions = JSON.parse(localStorage.getItem('pomodoroSessions') || '{}');
  const todayStats = completedSessions[today] || { count: 0, totalFocusTime: 0 };

  document.getElementById('completed-sessions-today').textContent = todayStats.count;
  document.getElementById('total-focus-time').textContent = `${todayStats.totalFocusTime}m`;
}

// === REMINDER SYSTEM ===
function startReminderSystem() {
  // Check every 5 minutes for forgotten tasks
  reminderInterval = setInterval(checkForForgottenTasks, REMINDER_CHECK_INTERVAL);

  // Also check immediately
  setTimeout(checkForForgottenTasks, 30000); // Wait 30 seconds after app loads
}

function checkForForgottenTasks() {
  if (!currentUser) return;

  // Find activities that:
  // 1. Not completed
  // 2. Created today
  // 3. Not currently tracking
  // 4. Created more than 30 minutes ago

  const now = new Date();
  const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

  const forgottenTasks = allActivities.filter(activity => {
    if (activity.selesai) return false;
    if (activity.status === 'tracking') return false;
    if (!activity.createdAt) return false;

    const createdDate = activity.createdAt.toDate();
    const isToday = isSameDay(createdDate, now);
    const isOldEnough = createdDate < thirtyMinutesAgo;

    return isToday && isOldEnough;
  });

  // If there are forgotten tasks, show reminder
  if (forgottenTasks.length > 0 && Math.random() < 0.5) { // 50% chance to show reminder
    showReminderNotification(forgottenTasks);
  }
}

function showReminderNotification(tasks) {
  if (tasks.length === 0) return;

  const task = tasks[0]; // Take the first task
  const hoursAgo = Math.floor((Date.now() - task.createdAt.toDate().getTime()) / (1000 * 60 * 60));

  let message = '';
  if (hoursAgo > 1) {
    message = `Anda punya tugas "${task.teks}" yang sudah ${hoursAgo} jam belum dimulai.`;
  } else {
    message = `Anda punya tugas "${task.teks}" yang sudah lebih dari 30 menit belum dimulai.`;
  }

  showNotification(
    '⏰ Ingat Tugas Anda!',
    `${message}\n\nKlik untuk mulai tracking.`
  );

  // Also show in-app reminder
  if (!document.getElementById('in-app-reminder')) {
    const reminder = document.createElement('div');
    reminder.id = 'in-app-reminder';
    reminder.className = 'fixed top-4 right-4 bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-200 p-4 rounded-lg shadow-lg z-50 max-w-sm';
    reminder.innerHTML = `
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <div class="font-bold flex items-center gap-2">
            ⏰ <span>Ingat Tugas Anda!</span>
          </div>
          <p class="text-sm mt-1">${message}</p>
          <button id="start-task-reminder" class="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1 px-3 rounded">
            Mulai Sekarang
          </button>
        </div>
        <button id="close-reminder" class="text-yellow-600 hover:text-yellow-800 ml-2">✕</button>
      </div>
    `;

    document.body.appendChild(reminder);

    // Add event listeners
    document.getElementById('start-task-reminder').addEventListener('click', () => {
      // Start tracking the task
      const docRef = doc(db, "users", currentUser.uid, "activities", task.id);
      safeUpdateDoc(docRef, {
        status: "tracking",
        lastStartTime: serverTimestamp()
      });

      reminder.remove();
    });

    document.getElementById('close-reminder').addEventListener('click', () => {
      reminder.remove();
    });

    // Auto remove after 30 seconds
    setTimeout(() => {
      if (document.getElementById('in-app-reminder')) {
        document.getElementById('in-app-reminder').remove();
      }
    }, 30000);
  }
}

// === ENHANCED NOTIFICATION FUNCTION ===
function showNotification(title, body, options = {}) {
  // Check if we should show notification (user might be busy)
  const lastNotificationTime = localStorage.getItem('lastNotificationTime');
  const now = Date.now();

  // Don't show too many notifications (at least 2 minutes apart)
  if (lastNotificationTime && (now - parseInt(lastNotificationTime)) < 2 * 60 * 1000) {
    console.log('Notification suppressed (too soon after last one)');
    return;
  }

  localStorage.setItem('lastNotificationTime', now.toString());

  const defaultOptions = {
    body: body,
    icon: 'images/icon-192.png',
    badge: 'images/icon-192.png',
    tag: 'activity-logger-reminder',
    requireInteraction: false,
    vibrate: [200, 100, 200],
    actions: [
      {
        action: 'open',
        title: 'Buka Aplikasi'
      },
      {
        action: 'dismiss',
        title: 'Tutup'
      }
    ]
  };

  const finalOptions = { ...defaultOptions, ...options };

  // Show browser notification
  if ('Notification' in window && Notification.permission === 'granted') {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, finalOptions);
      });
    } else {
      new Notification(title, finalOptions);
    }
  }

  // Also play sound if available
  playNotificationSound();
}

function playNotificationSound() {
  try {
    // Create audio context for notification sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.log('Audio notification not supported:', error);
  }
}


function isSameDay(date1, date2) {
  if (!date1 || !date2) return false;
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function getWarnaKategori(kategori, isHex = false) {
  const warna = {
    Pekerjaan: { bg: "bg-blue-500", hex: "#3B82F6" },
    Belajar: { bg: "bg-green-500", hex: "#22C55E" },
    Pribadi: { bg: "bg-yellow-400", hex: "#FACC15" },
    Istirahat: { bg: "bg-indigo-500", hex: "#6366F1" },
    Lainnya: { bg: "bg-slate-500", hex: "#64748B" },
  };
  const defaultColor = warna["Lainnya"];
  const selectedColor = warna[kategori] || defaultColor;
  return isHex ? selectedColor.hex : selectedColor.bg;
}

function formatDurasi(ms) {
  if (!ms || ms < 1000) return "0d";
  const totalDetik = Math.floor(ms / 1000);
  const jam = Math.floor(totalDetik / 3600);
  const menit = Math.floor((totalDetik % 3600) / 60);
  const detik = totalDetik % 60;

  let hasil = [];
  if (jam > 0) hasil.push(`${jam}j`);
  if (menit > 0) hasil.push(`${menit}m`);
  if (detik > 0) hasil.push(`${detik}d`);

  return hasil.join(" ") || "0d";
}

function formatSisaWaktu(ms) {
  if (ms < 0) ms = 0;
  const menit = Math.floor(ms / 60000)
    .toString()
    .padStart(2, "0");
  const detik = Math.floor((ms % 60000) / 1000)
    .toString()
    .padStart(2, "0");
  return `${menit}:${detik}`;
}

function formatJam(date) {
  if (!date) return "";
  const d = date.toDate();
  const jam = d.getHours().toString().padStart(2, "0");
  const menit = d.getMinutes().toString().padStart(2, "0");
  return `Jam ${jam}.${menit}`;
}

function generateTeks() {
  const namaTampilan =
    userProfile.customName ||
    currentUser.displayName ||
    currentUser.email.split("@")[0];
  let teksFinal = `*Laporan Kegiatan Harian*\nNama: ${namaTampilan}\nTanggal: ${tanggalHariIniElement.textContent}\n\n`;

  const daftarKegiatanHariIni = allActivities
    .filter((k) => isSameDay(k.createdAt.toDate(), currentDate) || !k.selesai)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const formatKegiatan = (k) => {
    let detailWaktu = "";
    if (k.selesai && k.createdAt && k.waktuSelesai) {
      detailWaktu = `(mulai: ${formatJam(k.createdAt)} sampai ${formatJam(
        k.waktuSelesai
      )}) (durasi: ${formatDurasi(k.durasi)})`;
    } else if (k.createdAt) {
      detailWaktu = `(mulai: ${formatJam(k.createdAt)})`;
    }
    return `- ${k.teks} ${detailWaktu}\n`;
  };
  daftarProyek.forEach((proyek) => {
    const subTugas = daftarKegiatanHariIni.filter(
      (k) => k.proyekId === proyek.id
    );
    if (subTugas.length > 0) {
      teksFinal += `*PROYEK: ${proyek.nama}*\n`;
      subTugas.forEach((k) => {
        teksFinal += formatKegiatan(k);
      });
      teksFinal += "\n";
    }
  });
  const kegiatanLain = daftarKegiatanHariIni.filter((k) => !k.proyekId);
  if (kegiatanLain.length > 0) {
    teksFinal += "*KEGIATAN LAIN:*\n";
    kegiatanLain.forEach((k) => {
      teksFinal += formatKegiatan(k);
    });
  }
  hasilTeks.value = teksFinal;
}

function salinTeks(elementId) {
  const textarea = document.getElementById(elementId);
  if (!textarea.value)
    return showCustomAlert("Tidak ada teks untuk disalin.", "Perhatian");
  navigator.clipboard
    .writeText(textarea.value)
    .then(() =>
      showCustomAlert("Teks berhasil disalin ke clipboard!", "Sukses")
    )
    .catch((err) => {
      console.error("Gagal menyalin teks: ", err);
      showCustomAlert("Gagal menyalin teks.", "Error");
    });
}

function renderProyekDropdowns() {
  const projectsById = daftarProyek.reduce(
    (acc, p) => ({ ...acc, [p.id]: { ...p, children: [] } }),
    {}
  );
  const rootProjects = [];
  daftarProyek.forEach((p) => {
    if (p.parentId && projectsById[p.parentId]) {
      if (!projectsById[p.parentId].children)
        projectsById[p.parentId].children = [];
      projectsById[p.parentId].children.push(projectsById[p.id]);
    } else {
      rootProjects.push(projectsById[p.id]);
    }
  });
  const populateDropdown = (selectElement) => {
    const selectedValue = selectElement.value;
    selectElement.innerHTML = `<option value="none">-- ${selectElement.id === "pilih-proyek-induk" ? "Tanpa Induk" : "Tanpa Proyek"
      } --</option>`;
    rootProjects
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .forEach((p) => populateDropdownRecursive(p, 0, selectElement));
    if (
      Array.from(selectElement.options).some(
        (opt) => opt.value === selectedValue
      )
    ) {
      selectElement.value = selectedValue;
    }
  };
  populateDropdown(pilihProyekInduk);
  populateDropdown(pilihProyekKegiatan);
}

function populateDropdownRecursive(proyek, level, selectElement) {
  const option = document.createElement("option");
  option.value = proyek.id;
  option.textContent = `${"--".repeat(level)} ${proyek.nama}`;
  selectElement.appendChild(option);
  if (proyek.children) {
    proyek.children
      .sort((a, b) => a.nama.localeCompare(b.nama))
      .forEach((child) =>
        populateDropdownRecursive(child, level + 1, selectElement)
      );
  }
}



// --- PENDAFTARAN SERVICE WORKER ---
// Kode ini harus ada agar browser tahu ada file sw.js yang harus diaktifkan.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('✅ Service Worker berhasil didaftarkan dengan scope:', registration.scope);
      })
      .catch(err => {
        console.error('❌ Pendaftaran Service Worker gagal:', err);
      });
  });
}

// --- REGISTER BACKGROUND SYNC ---
function registerBackgroundSync() {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then(registration => {
      return registration.sync.register('sync-activities');
    }).catch(err => {
      console.log('Background Sync registration failed:', err);
    });
  }
}

// --- CHECK FOR UPDATES ---
function checkForUpdates() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.update();
    });
  }
}

// Check for updates setiap 1 jam
setInterval(checkForUpdates, 60 * 60 * 1000);

// --- NETWORK STATUS DETECTION ---
function updateOnlineStatus() {
  if (!navigator.onLine) {
    showCustomAlert('Anda sedang offline. Beberapa fitur mungkin terbatas.', 'Offline Mode');
  }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Panggil saat pertama kali load
updateOnlineStatus();

// --- PWA INSTALL PROMPT ---
let deferredPrompt;
let installButton = null;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  deferredPrompt = e;

  // Hanya tampilkan button jika belum ada
  if (!installButton) {
    showInstallButton();
  }
});

function showInstallButton() {
  if (installButton) return;

  installButton = document.createElement('button');
  installButton.textContent = '📱 Install App';
  installButton.className = 'fixed bottom-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-full shadow-xl z-50 flex items-center gap-2 animate-bounce';
  installButton.innerHTML = '📱 <span>Install App</span>';

  installButton.onclick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    // We've used the prompt, and can't use it again
    deferredPrompt = null;

    // Remove button
    hideInstallButton();

    console.log(`User response to the install prompt: ${outcome}`);
  };

  document.body.appendChild(installButton);

  // Auto hide after 30 seconds
  setTimeout(() => {
    hideInstallButton();
  }, 30000);
}

function hideInstallButton() {
  if (installButton && installButton.parentNode) {
    installButton.remove();
    installButton = null;
  }
}

// Juga tambahkan event untuk menyembunyikan button setelah install
window.addEventListener('appinstalled', (evt) => {
  console.log('App was installed successfully!');
  hideInstallButton();
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Gunakan path yang relatif
    navigator.serviceWorker.register('sw.js')
      .then(registration => {
        console.log('✅ Service Worker berhasil didaftarkan dengan scope:', registration.scope);
      })
      .catch(err => {
        console.log('⚠️ Service Worker tidak dapat didaftarkan (mungkin development mode):', err);
        // Tidak perlu menunjukkan error di development
      });
  });
}

runApp();