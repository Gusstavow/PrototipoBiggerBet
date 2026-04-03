// gamification.js – Core logic for XP, levels, and achievements
import { getXPData, saveXPData, getDaysLost, saveDaysLost, unlockAchievement, getWallet, saveWallet } from './storage.js';

// Level Names (Satirical)
export const LEVEL_NAMES = [
    { level: 1, name: "Doador de Salário", threshold: 0 },
    { level: 2, name: "Patrocinador de Casa de Praia", threshold: 100 },
    { level: 3, name: "Investidor de Vento", threshold: 250 },
    { level: 4, name: "Estatístico Iludido", threshold: 500 },
    { level: 5, name: "Fiador Cósmico", threshold: 1000 },
    { level: 6, name: "Buraco Negro Financeiro", threshold: 2000 },
    { level: 10, name: "Dono da Banca (Oposto)", threshold: 10000 }
];

export const ACHIEVEMENTS_DATA = [
    { id: 'firstLoss', icon: '🤡', title: "Primeiro Loss", desc: "Você acabou de perder seu primeiro minuto aqui." },
    { id: 'faithfulRed', icon: '📉', title: "Fiel ao Red", desc: "Alcançou 3 dias de perdas seguidos." },
    { id: 'spinAddict', icon: '🎰', title: "Viciado na Alavanca", desc: "Girou para apostar o tempo mais de 5 vezes na mesma sessão." },
    { id: 'brokeAstronomer', icon: '🔭', title: "Astrônomo Falido", desc: "Girou a roleta galáctica e, claro, perdeu." },
    { id: 'goneBroke', icon: '💸', title: "Falência Total", desc: "Seu saldo chegou a zero. Parabéns pelo investimento!" }
];

let sessionSpins = 0;

export function addXP(amount) {
    const data = getXPData();
    data.xp += amount;
    
    // Check for level up
    let newLevel = data.level;
    for (let i = LEVEL_NAMES.length - 1; i >= 0; i--) {
        if (data.xp >= LEVEL_NAMES[i].threshold) {
            newLevel = Math.max(newLevel, LEVEL_NAMES[i].level);
            break;
        }
    }
    
    saveXPData(data.xp, newLevel);
    return { xp: data.xp, level: newLevel, leveledUp: newLevel > data.level };
}

export function incrementDayIfNew() {
    const data = getDaysLost();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (data.lastVisit !== today) {
        data.count += 1;
        data.lastVisit = today;
        saveDaysLost(data.count, data.lastVisit);
        
        if (data.count >= 3) {
            checkUnlock('faithfulRed');
        }
        return { updated: true, count: data.count };
    }
    return { updated: false, count: data.count };
}

export function logSpin(type, betAmount = 0) {
    let xpGain = 10;
    const wallet = getWallet();
    
    // Deduct bet
    wallet.balance -= betAmount;
    
    // Calculate potential "win" (mostly satirical/low)
    let winAmount = 0;
    let winMessage = "";
    const luck = Math.random();
    
    const DRAW_MESSAGES = [
        "Até um relógio parado acerta a hora... uma vez.",
        "Acontece de vez em quando, não se acostume.",
        "A sorte de um tolo é curta. Aproveite, será a última.",
        "Isso foi um erro no sistema, certamente não se repetirá.",
        "Ganhou? Na verdade, você só perdeu menos hoje."
    ];

    if (type === 'slot') {
        sessionSpins++;
        xpGain = 15;
        checkUnlock('firstLoss');
        
        // 2x Win condition (very rare)
        if (luck > 0.98) {
            winAmount = betAmount * 2;
            winMessage = DRAW_MESSAGES[Math.floor(Math.random() * DRAW_MESSAGES.length)];
        } else if (luck > 0.90) {
            winAmount = betAmount * 1.5;
        } else if (luck > 0.70) {
            winAmount = betAmount * 0.5;
        }
        
        if (sessionSpins >= 5) {
            checkUnlock('spinAddict');
        }
    } else if (type === 'roulette') {
        xpGain = 25;
        checkUnlock('firstLoss');
        checkUnlock('brokeAstronomer');
        
        // Roulette 2x win
        if (luck > 0.85) {
            winAmount = betAmount * 2;
            winMessage = DRAW_MESSAGES[Math.floor(Math.random() * DRAW_MESSAGES.length)];
        }
    }
    
    wallet.balance += winAmount;
    
    if (wallet.balance <= 0) {
        checkUnlock('goneBroke');
    }
    
    saveWallet(wallet.balance);
    
    return { 
        ...addXP(xpGain), 
        winAmount, 
        balance: wallet.balance,
        winMessage: winMessage
    };
}

export function checkUnlock(achievementId) {
    const unlockedNow = unlockAchievement(achievementId);
    if (unlockedNow) {
        // We will dispatch a custom event to notify UI
        document.dispatchEvent(new CustomEvent('achievementUnlocked', { detail: achievementId }));
    }
}

export function getNextLevelXP(currentXP) {
    for (let i = 0; i < LEVEL_NAMES.length; i++) {
        if (LEVEL_NAMES[i].threshold > currentXP) {
            return LEVEL_NAMES[i].threshold;
        }
    }
    return currentXP; // Max level handling
}

export function getLevelName(level) {
    const lvl = LEVEL_NAMES.find(l => l.level === level) || LEVEL_NAMES[LEVEL_NAMES.length - 1];
    return lvl.name;
}
