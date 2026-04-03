// storage.js – Handles localStorage operations

const KEYS = {
    XP: 'biggerBet_xp',
    DAYS: 'biggerBet_daysLost',
    ACHIEVEMENTS: 'biggerBet_achievements',
    WALLET: 'biggerBet_wallet'
};

// --- Helper Functions ---
function getJSON(key, defaultVal) {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultVal;
    } catch (e) {
        console.error(`Error parsing localStorage key "${key}":`, e);
        return defaultVal;
    }
}

function setJSON(key, val) {
    try {
        localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
        console.error(`Error setting localStorage key "${key}":`, e);
    }
}

// --- XP Methods ---
export function getXPData() {
    return getJSON(KEYS.XP, { xp: 0, level: 1 });
}

export function saveXPData(xp, level) {
    setJSON(KEYS.XP, { xp, level });
}

// --- Days Lost Methods ---
export function getDaysLost() {
    return getJSON(KEYS.DAYS, { count: 0, lastVisit: '' });
}

export function saveDaysLost(count, lastVisit) {
    setJSON(KEYS.DAYS, { count, lastVisit });
}

// --- Achievements Methods ---
export function getAchievements() {
    return getJSON(KEYS.ACHIEVEMENTS, {
        firstLoss: false,
        faithfulRed: false,
        spinAddict: false,
        brokeAstronomer: false
    });
}

export function unlockAchievement(achievementId) {
    const achievements = getAchievements();
    if (!achievements[achievementId]) {
        achievements[achievementId] = true;
        setJSON(KEYS.ACHIEVEMENTS, achievements);
        return true; // Successfully unlocked just now
    }
    return false; // Already unlocked
}

// --- Wallet Methods ---
export function getWallet() {
    return getJSON(KEYS.WALLET, { balance: 10000 });
}

export function saveWallet(balance) {
    setJSON(KEYS.WALLET, { balance });
}
