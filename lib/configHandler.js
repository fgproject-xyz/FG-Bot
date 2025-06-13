const fs = require('fs');
const path = require('path');

const configFilePath = path.resolve(__dirname, '../config.json');

let config = null;

// --- Load config dari file ---
function loadConfig() {
  try {
    const raw = fs.readFileSync(configFilePath, 'utf-8');
    config = JSON.parse(raw);
  } catch (e) {
    console.warn('Config file tidak ditemukan atau corrupt, membuat config baru.');
    config = {};
    saveConfig();
  }
}

// --- Save config ke file ---
function saveConfig() {
  try {
    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
  } catch (e) {
    console.error('Gagal menyimpan config:', e);
  }
}

// --- Helper memastikan struktur db.groups ada ---
function ensureDbStructure() {
  if (!config.db) config.db = {};
  if (!config.db.groups) config.db.groups = {};
}

// --- Fungsi cek group ---
function isGroupExist(groupid) {
  ensureDbStructure();
  return !!config.db.groups[groupid];
}

// --- Tambah group baru ---
function addGroup(groupid) {
  ensureDbStructure();
  if (!isGroupExist(groupid)) {
    config.db.groups[groupid] = {
      antitagsw: false,
      antihidetag: false,
      setmaxwarn: 3,
      warntagsw: {}
    };
    saveConfig();
    return true;
  }
  return false;
}

// --- Cek warn user ---
function cekWarnUser(groupid, userId) {
  ensureDbStructure();
  if (!isGroupExist(groupid)) return null;
  const warnCount = config.db.groups[groupid].warntagsw?.[userId];
  return typeof warnCount === 'number' ? warnCount : 0;
}

// --- Tambah user ke group ---
function addUserToGroup(groupid, userId, warnCount = 0) {
  ensureDbStructure();
  if (!isGroupExist(groupid)) return false;
  if (!config.db.groups[groupid].warntagsw) config.db.groups[groupid].warntagsw = {};
  if (!config.db.groups[groupid].warntagsw.hasOwnProperty(userId)) {
    config.db.groups[groupid].warntagsw[userId] = warnCount;
    saveConfig();
    return true;
  }
  return false;
}

// --- Increment warn user ---
function incrementWarn(groupid, userId) {
  ensureDbStructure();
  if (!isGroupExist(groupid)) return null;
  if (!config.db.groups[groupid].warntagsw?.hasOwnProperty(userId)) return null;
  config.db.groups[groupid].warntagsw[userId]++;
  saveConfig();
  return config.db.groups[groupid].warntagsw[userId];
}

// --- Toggle status boolean di group ---
function toggleGroupStatus(groupid, key) {
  ensureDbStructure();
  if (!isGroupExist(groupid)) return null;
  if (typeof config.db.groups[groupid][key] !== 'boolean') return null;
  config.db.groups[groupid][key] = !config.db.groups[groupid][key];
  saveConfig();
  return config.db.groups[groupid][key];
}

// --- Cek status boolean key di group ---
function cekToggleGroup(groupid, key) {
  ensureDbStructure();
  if (!isGroupExist(groupid)) return null;
  if (typeof config.db.groups[groupid][key] !== 'boolean') return null;
  return config.db.groups[groupid][key];
}

// --- Load config sekali saat modul di-import ---
loadConfig();

module.exports = {
  config,
  loadConfig,
  saveConfig,
  isGroupExist,
  addGroup,
  cekWarnUser,
  addUserToGroup,
  incrementWarn,
  toggleGroupStatus,
  cekToggleGroup
};
