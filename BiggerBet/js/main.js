// main.js – Application Bootstrap
import { getXPData, getDaysLost, getAchievements, getWallet } from './storage.js';
import { incrementDayIfNew, logSpin } from './gamification.js';
import { updateStatsUI, initRoulette, animateSlot, animateRoulette, renderAchievements, notifyAchievement, showWinPopup } from './ui.js';

export function syncUI() {
    const xpData = getXPData();
    const daysData = getDaysLost();
    const achievements = getAchievements();
    const wallet = getWallet();
    
    // updateStatsUI safely updates values if elements exist
    updateStatsUI(daysData.count, xpData, wallet.balance);
    
    // renderAchievements safely updates if #achievements-grid exists
    renderAchievements(achievements);
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Check and update Daily Login on load
    incrementDayIfNew();
    
    // 2. Sync State to UI across pages
    syncUI();
    
    // 3. Page specific bootstrapping
    const isDashboard = document.getElementById('assets-list') !== null;
    const isGames = document.getElementById('slot-display') !== null;
    
    if (isDashboard) {
        // Only import life system in the dashboard
        import('./life.js').then(module => {
            module.initDashboard(syncUI);
        });
    }
    
    if (isGames) {
        initRoulette();
        
        const btnSlot = document.getElementById('btn-spin-slot');
        if (btnSlot) {
            btnSlot.addEventListener('click', () => {
                const betInput = document.getElementById('slot-bet');
                const betAmount = parseInt(betInput.value) || 0;
                
                const result = logSpin('slot', betAmount);
                
                animateSlot(() => {
                    syncUI();
                    if (result.winAmount > 0) {
                        showWinPopup(result.winAmount, result.winMessage, btnSlot);
                    }
                }, result.winMessage);
            });
        }

        const btnRoulette = document.getElementById('btn-spin-roulette');
        if (btnRoulette) {
            btnRoulette.addEventListener('click', () => {
                const betInput = document.getElementById('roulette-bet');
                const betAmount = parseInt(betInput.value) || 0;
                
                const result = logSpin('roulette', betAmount);
                
                animateRoulette(() => {
                    syncUI();
                    if (result.winAmount > 0) {
                        showWinPopup(result.winAmount, result.winMessage, btnRoulette);
                    }
                }, result.winMessage);
            });
        }
    }
});

// Listen to custom achievement events
document.addEventListener('achievementUnlocked', (e) => {
    const achId = e.detail;
    notifyAchievement(achId);
    renderAchievements(getAchievements());
});
