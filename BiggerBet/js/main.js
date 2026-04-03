// main.js – Application Bootstrap
import { getXPData, getDaysLost, getAchievements, getWallet } from './storage.js';
import { incrementDayIfNew, logSpin } from './gamification.js';
import { updateStatsUI, initRoulette, animateSlot, animateRoulette, renderAchievements, notifyAchievement, showWinPopup } from './ui.js';

function syncUI() {
    const xpData = getXPData();
    const daysData = getDaysLost();
    const achievements = getAchievements();
    const wallet = getWallet();
    
    updateStatsUI(daysData.count, xpData, wallet.balance);
    renderAchievements(achievements);
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Check and update Daily Login on load
    incrementDayIfNew();
    
    // 2. Initialize Visuals
    initRoulette();
    
    // 3. Sync State to UI
    syncUI();
    
    // 4. Attach Event Listeners
    const btnSlot = document.getElementById('btn-spin-slot');
    if (btnSlot) {
        btnSlot.addEventListener('click', () => {
            const betInput = document.getElementById('slot-bet');
            const betAmount = parseInt(betInput.value) || 0;
            
            // Calculate outcome first to get winMessage
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
            
            // Calculate outcome first
            const result = logSpin('roulette', betAmount);
            
            animateRoulette(() => {
                syncUI();
                if (result.winAmount > 0) {
                    showWinPopup(result.winAmount, result.winMessage, btnRoulette);
                }
            }, result.winMessage);
        });
    }
});

// Listen to custom achievement events
document.addEventListener('achievementUnlocked', (e) => {
    const achId = e.detail;
    notifyAchievement(achId);
    // Render immediately as well
    renderAchievements(getAchievements());
});
