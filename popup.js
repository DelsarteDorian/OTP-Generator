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
let categories = ["Personal", "Work", "Social"]; // Default categories
let masterPassword = null;
let darkMode = false;
let lastLoginTime = null;
let is2FAEnabled = false;
const SESSION_DURATION = 3600000; // 1 hour in milliseconds

// Initialize with default password hash
const DEFAULT_PASSWORD_HASH = CryptoJS.SHA256("admin").toString();

// Storage Management
const storage = {
  async get(keys) {
    try {
      const data = {};
      if (Array.isArray(keys)) {
        keys.forEach(key => {
          const value = localStorage.getItem(key);
          if (value) {
            try {
              data[key] = JSON.parse(value);
            } catch {
              data[key] = value;
            }
          }
        });
      }
      return data;
    } catch (error) {
      console.error("Storage get error:", error);
      return {};
    }
  },

  async set(data) {
    try {
      Object.entries(data).forEach(([key, value]) => {
        localStorage.setItem(key, JSON.stringify(value));
      });
    } catch (error) {
      console.error("Storage set error:", error);
    }
  }
};

// Session Management
async function checkSession() {
  try {
    const data = await storage.get(["lastLoginTime", "masterPassword"]);
    const now = Date.now();
    
    if (data.lastLoginTime && (now - data.lastLoginTime) < SESSION_DURATION) {
      masterPassword = data.masterPassword;
      if (masterPassword) {
        const appsData = await storage.get(["apps"]);
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
    const data = await storage.get(["passwordHash"]);
    return data.passwordHash || DEFAULT_PASSWORD_HASH;
  } catch (error) {
    console.error("Error getting password hash:", error);
    return DEFAULT_PASSWORD_HASH;
  }
}

async function setPasswordHash(hash) {
  try {
    await storage.set({ passwordHash: hash });
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
    await storage.set({ 
      lastLoginTime: now,
      masterPassword: password 
    });
    lastLoginTime = now;
    
    const data = await storage.get(["apps"]);
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
    await storage.set({ masterPassword: newPassword });
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
    const category = document.getElementById("otp-category").value;
    
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
      category,
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

// Edit OTP
function showEditOtpModal(index) {
  const app = apps[index];
  const modal = document.getElementById("edit-otp-modal");
  const form = document.getElementById("edit-otp-form");
  
  // Update category options
  const editCategorySelect = document.getElementById("edit-otp-category");
  const options = categories.map(category => 
    `<option value="${category}">${category}</option>`
  ).join("");
  editCategorySelect.innerHTML = `<option value="">Select Category</option>${options}`;
  
  // Fill form with current values
  document.getElementById("edit-otp-name").value = app.name;
  document.getElementById("edit-otp-secret").value = app.secret;
  document.getElementById("edit-otp-algorithm").value = app.algorithm;
  editCategorySelect.value = app.category || "";
  
  // Store the index for later use
  form.dataset.index = index;
  
  modal.style.display = "block";
}

function hideEditOtpModal() {
  const modal = document.getElementById("edit-otp-modal");
  modal.style.display = "none";
  document.getElementById("edit-otp-form").reset();
}

async function handleEditOtp(event) {
  event.preventDefault();
  try {
    const index = parseInt(event.target.dataset.index);
    const name = document.getElementById("edit-otp-name").value;
    const secret = document.getElementById("edit-otp-secret").value;
    const algorithm = document.getElementById("edit-otp-algorithm").value;
    const category = document.getElementById("edit-otp-category").value;
    
    if (!name || !secret) {
      alert("Please fill in all required fields.");
      return;
    }
    
    const code = generateOTP(secret, algorithm);
    if (code === "Error") {
      alert("Invalid secret key format. Please check your input.");
      return;
    }
    
    apps[index] = {
      name,
      secret,
      algorithm,
      category,
      code
    };
    
    await saveApps();
    hideEditOtpModal();
  } catch (error) {
    console.error("Error editing OTP:", error);
    alert("An error occurred while editing the OTP. Please try again.");
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
document.getElementById("edit-otp-form").addEventListener("submit", handleEditOtp);
document.getElementById("cancel-edit-otp").addEventListener("click", hideEditOtpModal);

// Check session on load
document.addEventListener("DOMContentLoaded", checkSession);

// Handle Dark Mode
async function toggleDarkMode() {
  darkMode = !darkMode;
  document.body.classList.toggle("dark-mode", darkMode);
  await storage.set({ darkMode });
}

// Initialize dark mode from storage
async function initializeDarkMode() {
  try {
    const data = await storage.get(["darkMode"]);
    darkMode = data.darkMode || false;
    document.body.classList.toggle("dark-mode", darkMode);
  } catch (error) {
    console.error("Error loading dark mode preference:", error);
  }
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
    const data = await storage.get(["apps"]);
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
  const selectedCategory = document.getElementById("category-filter").value;
  
  otpList.innerHTML = "";
  
  const filteredApps = selectedCategory === "all" 
    ? apps 
    : apps.filter(app => app.category === selectedCategory);
  
  filteredApps.forEach((app, index) => {
    const li = document.createElement("li");
    li.dataset.index = apps.indexOf(app); // Use original index for operations
    li.draggable = true;

    li.innerHTML = `
      <div class="app-info">
        <div class="app-name">${app.name}</div>
        <div class="app-code">${app.code}</div>
        ${app.category ? `<div class="app-category">${app.category}</div>` : ''}
      </div>
      <div class="action-buttons">
        <button class="edit-btn" title="Edit OTP">Edit</button>
        <button class="delete-btn" title="Delete OTP">Delete</button>
        <button class="repair-btn" title="Regenerate Code">Repair</button>
      </div>
    `;

    // Add event listeners
    const deleteBtn = li.querySelector('.delete-btn');
    const repairBtn = li.querySelector('.repair-btn');
    const editBtn = li.querySelector('.edit-btn');
    
    deleteBtn.addEventListener('click', () => deleteApp(apps.indexOf(app)));
    repairBtn.addEventListener('click', () => repairApp(apps.indexOf(app)));
    editBtn.addEventListener('click', () => showEditOtpModal(apps.indexOf(app)));
    
    // Add click handler for copying code
    li.querySelector('.app-code').addEventListener('click', () => {
      copyCode(app.code);
    });
    
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
      await storage.set({ apps: encryptedApps });
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

// Category Management
function showManageCategoriesModal() {
  const modal = document.getElementById("manage-categories-modal");
  modal.style.display = "block";
  renderCategories();
}

function hideManageCategoriesModal() {
  const modal = document.getElementById("manage-categories-modal");
  modal.style.display = "none";
}

function renderCategories() {
  const categoriesList = document.getElementById("categories-list");
  categoriesList.innerHTML = categories.map(category => `
    <div class="category-item">
      <span>${category}</span>
      <button class="delete-category-btn" data-category="${category}">Delete</button>
    </div>
  `).join("");

  // Add event listeners for delete buttons
  document.querySelectorAll(".delete-category-btn").forEach(btn => {
    btn.addEventListener("click", () => deleteCategory(btn.dataset.category));
  });
}

async function addCategory(event) {
  event.preventDefault();
  const newCategory = document.getElementById("new-category").value.trim();
  if (newCategory && !categories.includes(newCategory)) {
    categories.push(newCategory);
    await saveCategories();
    renderCategories();
    updateCategorySelects();
    document.getElementById("new-category").value = "";
  }
}

async function deleteCategory(category) {
  if (confirm(`Are you sure you want to delete the category "${category}"?`)) {
    categories = categories.filter(c => c !== category);
    await saveCategories();
    renderCategories();
    updateCategorySelects();
  }
}

async function saveCategories() {
  try {
    await storage.set({ categories });
  } catch (error) {
    console.error("Error saving categories:", error);
  }
}

function updateCategorySelects() {
  const categoryFilter = document.getElementById("category-filter");
  const otpCategory = document.getElementById("otp-category");
  
  const options = categories.map(category => 
    `<option value="${category}">${category}</option>`
  ).join("");
  
  categoryFilter.innerHTML = `<option value="all">All</option>${options}`;
  otpCategory.innerHTML = `<option value="">Select Category</option>${options}`;
}

// Drag and Drop
function initDragAndDrop() {
  const otpList = document.getElementById("otp-list");
  let draggedItem = null;
  let dragOverItem = null;

  otpList.addEventListener("dragstart", (e) => {
    draggedItem = e.target;
    e.target.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", e.target.dataset.index);
  });

  otpList.addEventListener("dragend", (e) => {
    e.target.classList.remove("dragging");
    draggedItem = null;
    // Remove drag-over class from all items
    document.querySelectorAll("#otp-list li").forEach(item => {
      item.classList.remove("drag-over");
    });
  });

  otpList.addEventListener("dragover", (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(otpList, e.clientY);
    
    // Remove drag-over class from previous item
    if (dragOverItem) {
      dragOverItem.classList.remove("drag-over");
    }
    
    if (afterElement) {
      afterElement.classList.add("drag-over");
      dragOverItem = afterElement;
    }
  });

  otpList.addEventListener("dragleave", (e) => {
    if (e.target.classList.contains("drag-over")) {
      e.target.classList.remove("drag-over");
    }
  });

  otpList.addEventListener("drop", async (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(otpList, e.clientY);
    
    if (afterElement) {
      otpList.insertBefore(draggedItem, afterElement);
    } else {
      otpList.appendChild(draggedItem);
    }
    
    // Update the order in the apps array
    const newOrder = Array.from(otpList.children).map(li => parseInt(li.dataset.index));
    apps = newOrder.map(index => apps[index]);
    await saveApps();
    
    // Remove drag-over class
    if (dragOverItem) {
      dragOverItem.classList.remove("drag-over");
      dragOverItem = null;
    }
  });
}

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll("li:not(.dragging)")];
  
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// 2FA Setup
function show2FASetupModal() {
  const modal = document.getElementById("setup-2fa-modal");
  modal.style.display = "block";
  generate2FASecret();
}

function hide2FASetupModal() {
  const modal = document.getElementById("setup-2fa-modal");
  modal.style.display = "none";
}

function generate2FASecret() {
  const secret = otplib.authenticator.generateSecret();
  const qrCode = `otpauth://totp/OTPGenerator:${encodeURIComponent(masterPassword)}?secret=${secret}&issuer=OTPGenerator`;
  
  document.getElementById("2fa-secret").value = secret;
  // Generate QR code using a library like qrcode.js
  // For now, we'll just show the secret
}

async function verify2FA(event) {
  event.preventDefault();
  const code = document.getElementById("2fa-code").value;
  const secret = document.getElementById("2fa-secret").value;
  
  if (otplib.authenticator.verify({ token: code, secret })) {
    is2FAEnabled = true;
    await storage.set({ 
      is2FAEnabled: true,
      twoFASecret: secret 
    });
    hide2FASetupModal();
    alert("Two-factor authentication enabled successfully!");
  } else {
    alert("Invalid code. Please try again.");
  }
}

// Event Listeners
document.getElementById("manage-categories-btn").addEventListener("click", showManageCategoriesModal);
document.getElementById("cancel-manage-categories").addEventListener("click", hideManageCategoriesModal);
document.getElementById("add-category-form").addEventListener("submit", addCategory);
document.getElementById("setup-2fa-btn").addEventListener("click", show2FASetupModal);
document.getElementById("cancel-2fa-setup").addEventListener("click", hide2FASetupModal);
document.getElementById("verify-2fa-form").addEventListener("submit", verify2FA);

// Add category filter event listener
document.getElementById("category-filter").addEventListener("change", renderApps);

// Initialize
async function initialize() {
  try {
    const data = await storage.get(["categories", "is2FAEnabled"]);
    if (data.categories) {
      categories = data.categories;
    }
    is2FAEnabled = data.is2FAEnabled || false;
    updateCategorySelects();
    initDragAndDrop();
    await initializeDarkMode();
  } catch (error) {
    console.error("Initialization error:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  checkSession();
  initialize();
});
