/**
 * OTP Generator - Chrome Extension
 * @author Dorian Delsarte
 * @version 1.0.0
 * @license MIT
 */

const masterPasswordInput = document.getElementById("master-password");
const loginForm = document.getElementById("login-form");
const loginContainer = document.getElementById("login-container");
const appContainer = document.getElementById("app-container");
const addAppBtn = document.getElementById("add-app-btn");
const exportBtn = document.getElementById("export-btn");
const importBtn = document.getElementById("import-btn");
const categoryFilter = document.getElementById("category-filter");
const toggleDarkModeBtn = document.getElementById("toggle-dark-mode");
const copyNotification = document.getElementById("copy-notification");
const changePasswordBtn = document.getElementById("change-password-btn");
const changePasswordModal = document.getElementById("change-password-modal");
const changePasswordForm = document.getElementById("change-password-form");
const cancelChangePassword = document.getElementById("cancel-change-password");
const addOtpModal = document.getElementById("add-otp-modal");
const addOtpForm = document.getElementById("add-otp-form");
const cancelAddOtp = document.getElementById("cancel-add-otp");

// Application state
let apps = []; // Stores the OTP apps
let masterPassword = null;
let darkMode = false;
let lastLoginTime = null;
const SESSION_DURATION = 3600000; // 1 hour in milliseconds

// Initialize with default password hash
const DEFAULT_PASSWORD_HASH = CryptoJS.SHA256("admin").toString();

// Session Management
async function checkSession() {
  try {
    const data = await chrome.storage.local.get(["lastLoginTime", "masterPassword"]);
    const now = Date.now();
    
    if (data.lastLoginTime && (now - data.lastLoginTime) < SESSION_DURATION) {
      masterPassword = data.masterPassword;
      // Charger les apps seulement si on a un mot de passe
      if (masterPassword) {
        const appsData = await chrome.storage.local.get(["apps"]);
        if (appsData.apps) {
          try {
            apps = decryptData(appsData.apps);
          } catch (error) {
            console.error("Error decrypting apps:", error);
            apps = [];
          }
        }
      }
      loginContainer.style.display = "none";
      appContainer.style.display = "block";
      renderApps();
      return true;
    } else {
      loginContainer.style.display = "block";
      appContainer.style.display = "none";
      return false;
    }
  } catch (error) {
    console.error("Session check error:", error);
    loginContainer.style.display = "block";
    appContainer.style.display = "none";
    return false;
  }
}

// Password Management
async function getStoredPasswordHash() {
  try {
    const data = await chrome.storage.local.get(["passwordHash"]);
    return data.passwordHash || DEFAULT_PASSWORD_HASH;
  } catch (error) {
    console.error("Error getting password hash:", error);
    return DEFAULT_PASSWORD_HASH;
  }
}

async function setPasswordHash(hash) {
  try {
    await chrome.storage.local.set({ passwordHash: hash });
  } catch (error) {
    console.error("Error setting password hash:", error);
  }
}

// CryptoJS Encryption/Decryption
function encryptData(data) {
  try {
    if (!masterPassword) {
      throw new Error("No master password set");
    }
    return CryptoJS.AES.encrypt(JSON.stringify(data), masterPassword).toString();
  } catch (error) {
    console.error("Encryption error:", error);
    return null;
  }
}

function decryptData(data) {
  try {
    if (!masterPassword || !data) {
      return [];
    }
    const bytes = CryptoJS.AES.decrypt(data, masterPassword);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted ? JSON.parse(decrypted) : [];
  } catch (error) {
    console.error("Decryption error:", error);
    return [];
  }
}

async function login(event) {
  event.preventDefault();
  try {
    const password = masterPasswordInput.value;
    const storedHash = await getStoredPasswordHash();
    const inputHash = CryptoJS.SHA256(password).toString();
    
    if (inputHash !== storedHash) {
      alert("Incorrect password!");
      return;
    }

    masterPassword = password;
    const now = Date.now();
    await chrome.storage.local.set({ 
      lastLoginTime: now,
      masterPassword: password 
    });
    lastLoginTime = now;
    
    // Load existing apps
    const data = await chrome.storage.local.get(["apps"]);
    if (data.apps) {
      apps = decryptData(data.apps);
    }
    
    loginContainer.style.display = "none";
    appContainer.style.display = "block";
    renderApps();
  } catch (error) {
    console.error("Login error:", error);
    alert("An error occurred during login. Please try again.");
  }
}

// Password Change
function showChangePasswordModal() {
  changePasswordModal.style.display = "block";
}

function hideChangePasswordModal() {
  changePasswordModal.style.display = "none";
  changePasswordForm.reset();
}

async function handlePasswordChange(event) {
  event.preventDefault();
  try {
    const currentPassword = document.getElementById("current-password").value;
    const newPassword = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    
    const storedHash = await getStoredPasswordHash();
    const currentHash = CryptoJS.SHA256(currentPassword).toString();
    
    if (currentHash !== storedHash) {
      alert("Current password is incorrect!");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    
    const newHash = CryptoJS.SHA256(newPassword).toString();
    await setPasswordHash(newHash);
    masterPassword = newPassword;
    await chrome.storage.local.set({ masterPassword: newPassword });
    hideChangePasswordModal();
    alert("Password changed successfully!");
  } catch (error) {
    console.error("Error changing password:", error);
    alert("An error occurred while changing the password. Please try again.");
  }
}

// Add OTP
function showAddOtpModal() {
  addOtpModal.style.display = "block";
}

function hideAddOtpModal() {
  addOtpModal.style.display = "none";
  addOtpForm.reset();
}

async function handleAddOtp(event) {
  event.preventDefault();
  try {
    const name = document.getElementById("otp-name").value;
    const secret = document.getElementById("otp-secret").value;
    const algorithm = document.getElementById("otp-algorithm").value;
    
    if (!name || !secret) {
      alert("Please fill in all required fields.");
      return;
    }
    
    const code = generateOTP(secret, algorithm);
    if (code === "Error") {
      alert("Invalid secret key format. Please check your input.");
      return;
    }
    
    const newApp = {
      name,
      secret,
      algorithm,
      code
    };
    
    apps.push(newApp);
    await saveApps();
    hideAddOtpModal();
  } catch (error) {
    console.error("Error adding OTP:", error);
    alert("An error occurred while adding the OTP. Please try again.");
  }
}

// Event Listeners
loginForm.addEventListener("submit", login);
changePasswordBtn.addEventListener("click", showChangePasswordModal);
cancelChangePassword.addEventListener("click", hideChangePasswordModal);
changePasswordForm.addEventListener("submit", handlePasswordChange);
addAppBtn.addEventListener("click", showAddOtpModal);
cancelAddOtp.addEventListener("click", hideAddOtpModal);
addOtpForm.addEventListener("submit", handleAddOtp);
exportBtn.addEventListener("click", exportApps);
importBtn.addEventListener("change", importApps);
document.getElementById("import-trigger-btn").addEventListener("click", () => {
  document.getElementById("import-btn").click();
});

// Check session on load
document.addEventListener("DOMContentLoaded", checkSession);

// Handle Dark Mode
function toggleDarkMode() {
  darkMode = !darkMode;
  document.body.classList.toggle("dark-mode", darkMode);
}

toggleDarkModeBtn.addEventListener("click", toggleDarkMode);

// Export & Import Apps
function exportApps() {
  try {
    if (!masterPassword) {
      throw new Error("Please login first to export OTPs");
    }
    
    // Exporter directement les données cryptées
    const data = {
      version: "1.0.0",
      timestamp: Date.now(),
      encryptedData: apps
    };
    
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "otp_backup.json";
    link.click();
  } catch (error) {
    console.error("Export error:", error);
    alert("Error exporting OTPs: " + error.message);
  }
}

function importApps(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function() {
    try {
      if (!masterPassword) {
        alert("Please login first to import OTPs");
        return;
      }

      const importedData = reader.result;
      if (!importedData) {
        throw new Error("Empty file");
      }

      const parsedData = JSON.parse(importedData);
      
      // Vérifier si c'est un fichier exporté par l'extension
      if (!parsedData.version || !parsedData.encryptedData) {
        throw new Error("Invalid backup file format");
      }

      // Vérifier la structure des données
      const validApps = parsedData.encryptedData.filter(app => 
        app && 
        typeof app === 'object' && 
        typeof app.name === 'string' && 
        typeof app.secret === 'string' && 
        typeof app.algorithm === 'string'
      );

      if (validApps.length === 0) {
        throw new Error("No valid OTP entries found");
      }

      apps = validApps;
      await saveApps();
      renderApps();
      alert(`Successfully imported ${validApps.length} OTP entries`);
    } catch (error) {
      console.error("Import error:", error);
      alert("Error importing file: " + error.message);
    }
  };
  reader.readAsText(file);
}

// OTP Management
async function loadApps() {
  try {
    const data = await chrome.storage.local.get(["apps"]);
    if (data.apps) {
      apps = decryptData(data.apps);
      renderApps();
    }
  } catch (error) {
    console.error("Error loading apps:", error);
  }
}

function renderApps() {
  const otpList = document.getElementById("otp-list");
  otpList.innerHTML = "";
  
  apps.forEach((app, index) => {
    const li = document.createElement("li");
    li.dataset.index = index;

    li.innerHTML = `
      <div class="app-info">
        <div class="app-name">${app.name}</div>
        <div class="app-code">${app.code}</div>
      </div>
      <div class="action-buttons">
        <button class="delete-btn">Delete</button>
        <button class="repair-btn">Repair</button>
      </div>
    `;

    // Ajouter les écouteurs d'événements
    const deleteBtn = li.querySelector('.delete-btn');
    const repairBtn = li.querySelector('.repair-btn');
    
    deleteBtn.addEventListener('click', () => deleteApp(index));
    repairBtn.addEventListener('click', () => repairApp(index));
    
    otpList.appendChild(li);
  });
}

async function editApp(index) {
  try {
    const app = apps[index];
    const newCode = prompt("Edit the OTP code:", app.code);
    if (newCode) {
      app.code = newCode;
      await saveApps();
    }
  } catch (error) {
    console.error("Error editing app:", error);
    alert("An error occurred while editing the OTP. Please try again.");
  }
}

async function deleteApp(index) {
  try {
    if (confirm("Are you sure you want to delete this OTP?")) {
      apps.splice(index, 1);
      await saveApps();
      renderApps();
    }
  } catch (error) {
    console.error("Error deleting app:", error);
    alert("An error occurred while deleting the OTP. Please try again.");
  }
}

async function repairApp(index) {
  try {
    const app = apps[index];
    const repairedCode = generateOTP(app.secret, app.algorithm);
    if (repairedCode !== "Error") {
      app.code = repairedCode;
      await saveApps();
      renderApps();
    } else {
      alert("Could not repair the OTP. Please check the secret key format.");
    }
  } catch (error) {
    console.error("Error repairing app:", error);
    alert("An error occurred while repairing the OTP. Please try again.");
  }
}

function generateOTP(secret, algorithm) {
  try {
    // Nettoyer la clé secrète (enlever les espaces et la formater en base32)
    const cleanSecret = secret.replace(/\s+/g, '').toUpperCase();
    
    if (algorithm === "HOTP") {
      return otplib.hotp.generate(cleanSecret, 0);
    } else {
      return otplib.authenticator.generate(cleanSecret);
    }
  } catch (error) {
    console.error("Error generating OTP:", error);
    return "Error";
  }
}

async function saveApps() {
  try {
    const encryptedApps = encryptData(apps);
    if (encryptedApps) {
      await chrome.storage.local.set({ apps: encryptedApps });
      renderApps();
    }
  } catch (error) {
    console.error("Error saving apps:", error);
    alert("An error occurred while saving the OTPs. Please try again.");
  }
}

function showCopyNotification() {
  copyNotification.classList.add("show");
  setTimeout(() => {
    copyNotification.classList.remove("show");
  }, 2000);
}

function copyCode(code) {
  navigator.clipboard.writeText(code);
  showCopyNotification();
}
