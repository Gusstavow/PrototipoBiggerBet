// ui.js – Handles DOM updates and animations
import { ACHIEVEMENTS_DATA, getLevelName, getNextLevelXP } from './gamification.js';

// --- Elements ---
const elDaysLost = document.getElementById('days-lost-counter');
const elLevelName = document.getElementById('user-level-name');
const elXpBarFill = document.getElementById('xp-bar-fill');
const elXpText = document.getElementById('xp-text');
const elWalletBalance = document.getElementById('wallet-balance');
const elSlotDisplay = document.getElementById('slot-display');
const elBtnSpinSlot = document.getElementById('btn-spin-slot');
const elRouletteWheel = document.getElementById('roulette-wheel');
const elBtnSpinRoulette = document.getElementById('btn-spin-roulette');
const elRouletteTooltip = document.getElementById('roulette-tooltip');
const elAchievementsGrid = document.getElementById('achievements-grid');

const SLOT_MESSAGES = [
    "SUA CONTA ENTROU EM COLAPSO CÓSMICO",
    "EVAPORANDO FUNDOS...",
    "MAIS UM DIA, MAIS UM LOSS",
    "BEM-VINDO À FALÊNCIA",
    "O BANCO AGRADECE SUA DOAÇÃO"
];

// --- Stats UI ---
export function updateStatsUI(days, xpData, balance = 10000) {
    // Update Days
    if (elDaysLost) {
        elDaysLost.textContent = days;
    }
    
    // Update Wallet (with ticker animation)
    if (elWalletBalance) {
        animateValue(elWalletBalance, elWalletBalance.textContent, balance);
    }

    // Update XP and Level
    if (elLevelName && elXpBarFill && elXpText) {
        elLevelName.textContent = getLevelName(xpData.level);
        
        const nextThreshold = getNextLevelXP(xpData.xp);
        const progress = Math.min((xpData.xp / nextThreshold) * 100, 100);
        
        elXpBarFill.style.width = `${progress}%`;
        elXpText.textContent = `${xpData.xp} / ${nextThreshold} XP`;
    }
}

function animateValue(obj, startStr, end) {
    let start = parseInt(startStr.replace(/[$,]/g, '')) || 0;
    if (start === end) return;
    
    const duration = 1000;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const current = Math.floor(progress * (end - start) + start);
        obj.innerHTML = current.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// --- Slot UI ---
let isSpinningSlot = false;
export function animateSlot(callback, winMessage) {
    if (isSpinningSlot) return;
    isSpinningSlot = true;
    
    elBtnSpinSlot.disabled = true;
    elSlotDisplay.classList.add('spinning');
    
    let cycles = 0;
    const interval = setInterval(() => {
        elSlotDisplay.textContent = SLOT_MESSAGES[Math.floor(Math.random() * SLOT_MESSAGES.length)];
        cycles++;
        
        if (cycles > 15) {
            clearInterval(interval);
            elSlotDisplay.classList.remove('spinning');
            
            // Show result message
            elSlotDisplay.textContent = winMessage || "TEMPO PERDIDO COM SUCESSO!";
            
            setTimeout(() => {
                isSpinningSlot = false;
                elBtnSpinSlot.disabled = false;
                callback();
            }, 1000);
        }
    }, 100);
}

// --- Roulette UI ---
let isSpinningRoulette = false;
let currentRotation = 0;

export function initRoulette() {
    const segmentsCount = 8;
    const labels = ["0 - Salário", "Dívida", "Loss", "Fator Risco", "Bancarrota", "Nada", "Mais Dívida", "100% Red"];
    
    for (let i = 0; i < segmentsCount; i++) {
        const span = document.createElement('span');
        span.style.position = 'absolute';
        span.style.top = '0';
        span.style.left = '50%';
        span.style.width = '80px';
        span.style.marginLeft = '-40px';
        span.style.height = '50%';
        span.style.transform = `rotate(${i * 45}deg)`;
        span.style.transformOrigin = 'bottom center';
        span.style.color = '#fff';
        span.style.fontWeight = 'bold';
        span.style.fontSize = '0.7rem';
        span.style.textShadow = '0 0 5px #000';
        span.style.textAlign = 'center';
        span.style.paddingTop = '15px';
        span.textContent = labels[i];
        elRouletteWheel.appendChild(span);
    }
}

export function animateRoulette(callback, winMessage) {
    if (isSpinningRoulette) return;
    isSpinningRoulette = true;
    
    elBtnSpinRoulette.disabled = true;
    elRouletteTooltip.classList.remove('show');
    
    const extraSpins = 5 * 360;
    const randomStop = Math.floor(Math.random() * 360);
    currentRotation += extraSpins + randomStop;
    
    elRouletteWheel.style.transform = `rotate(${currentRotation}deg)`;
    
    setTimeout(() => {
        elRouletteTooltip.textContent = winMessage || "Parabéns, mais um fundo perdido! 💸";
        elRouletteTooltip.classList.add('show');
        isSpinningRoulette = false;
        elBtnSpinRoulette.disabled = false;
        callback();
    }, 3100); // 3s css transition + buffer
}

// --- Achievements UI ---
export function renderAchievements(unlockedObj) {
    if (!elAchievementsGrid) return;
    elAchievementsGrid.innerHTML = '';
    
    ACHIEVEMENTS_DATA.forEach(ach => {
        const isUnlocked = unlockedObj[ach.id];
        const medal = document.createElement('div');
        medal.className = `medal ${isUnlocked ? 'unlocked' : ''}`;
        medal.dataset.tooltip = isUnlocked ? ach.desc : 'Bloqueado. Continue perdendo para liberar.';
        medal.textContent = ach.icon;
        
        elAchievementsGrid.appendChild(medal);
    });
}

export function notifyAchievement(achId) {
    const ach = ACHIEVEMENTS_DATA.find(a => a.id === achId);
    if (!ach) return;
    
    // Create a temporary toast/glitch alert on screen
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.background = 'rgba(0,0,0,0.9)';
    toast.style.border = '2px solid #f1c40f';
    toast.style.boxShadow = '0 0 20px rgba(241, 196, 15, 0.5)';
    toast.style.color = '#fff';
    toast.style.padding = '1rem';
    toast.style.borderRadius = '8px';
    toast.style.zIndex = '9999';
    toast.style.fontFamily = "'Orbitron', sans-serif";
    toast.style.animation = 'unlock-pop 0.5s';
    
    toast.innerHTML = `
        <h4 style="color: #f1c40f; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>${ach.icon}</span> NOVA CONQUISTA DESBLOQUEADA!
        </h4>
        <p style="font-family: 'Inter', sans-serif; font-size: 0.875rem;">${ach.title}: ${ach.desc}</p>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s';
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}

export function showWinPopup(amount, message, targetElement) {
    if (amount <= 0) return;
    
    // 1. Floating number above the target element
    const floater = document.createElement('div');
    floater.textContent = `+ $${amount}`;
    floater.style.position = 'absolute';
    floater.style.color = 'var(--neon-money, #00ff41)';
    floater.style.fontWeight = 'bold';
    floater.style.fontSize = '2.5rem';
    floater.style.zIndex = '1000';
    floater.style.pointerEvents = 'none';
    floater.style.animation = 'float-up 2s forwards ease-out';
    
    const rect = targetElement.getBoundingClientRect();
    floater.style.left = `${rect.left + rect.width / 2}px`;
    floater.style.top = `${rect.top}px`;
    document.body.appendChild(floater);
    
    setTimeout(() => { floater.remove() }, 2000);

    // 2. The acidic win message pop-up
    const popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.top = '20px';
    popup.style.left = '50%';
    popup.style.transform = 'translateX(-50%)';
    popup.style.background = 'rgba(10, 20, 10, 0.95)';
    popup.style.border = '2px solid var(--neon-money, #00ff41)';
    popup.style.boxShadow = '0 0 20px rgba(0, 255, 65, 0.5)';
    popup.style.color = '#fff';
    popup.style.padding = '1.5rem';
    popup.style.borderRadius = '8px';
    popup.style.zIndex = '9999';
    popup.style.fontFamily = "'Orbitron', sans-serif";
    popup.style.animation = 'unlock-pop 0.5s';
    popup.style.textAlign = 'center';
    
    popup.innerHTML = `
        <h3 style="color: var(--neon-money, #00ff41); margin-bottom: 0.5rem; text-shadow: 0 0 10px var(--neon-money);">🎉 GANHO INESPERADO: +$${amount} 🎉</h3>
        <p style="font-family: 'Inter', sans-serif; font-size: 1rem; color: #fff;">${message}</p>
    `;
    
    document.body.appendChild(popup);
    
    setTimeout(() => {
        popup.style.opacity = '0';
        popup.style.transition = 'opacity 0.5s';
        setTimeout(() => popup.remove(), 500);
    }, 4500);
}
