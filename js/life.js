// life.js - Handles the "My Assets" logic
import { getAssets, sellAsset } from './storage.js';

export function initDashboard(syncUICallback) {
    renderAssets(syncUICallback);
}

export function renderAssets(syncUICallback) {
    const list = document.getElementById('assets-list');
    if (!list) return;
    
    const assets = getAssets();
    list.innerHTML = '';
    
    // Check if only time is left, or completely empty
    if (assets.length === 0 || (assets.length === 1 && assets[0].id === 'time')) {
        let msg = "Você já arruinou sua vida por completo. Não restam bens para vender e continuar apostando.";
        
        list.innerHTML = `
            <div style="text-align:center; padding: 2rem; color: var(--text-secondary); background: rgba(255,0,0,0.05); border-radius: 8px;">
                <h3 style="color: var(--neon-pink); margin-bottom: 0.5rem;">Fundo do Poço Total</h3>
                <p>${msg}</p>
            </div>
        `;
        // Still render time if it's there
        if (assets.length === 1) {
            renderAssetItem(assets[0], list, syncUICallback, assets);
        }
        return;
    }
    
    assets.forEach(asset => {
        renderAssetItem(asset, list, syncUICallback, assets);
    });
}

function renderAssetItem(asset, list, syncUICallback, assets) {
    const item = document.createElement('div');
    item.className = 'asset-item';
    
    const isTime = asset.id === 'time';
    const btnHTML = isTime 
        ? `<button class="btn btn-secondary" disabled style="opacity:0.5; cursor:not-allowed; padding: 0.5rem 1rem;">Indisponível</button>`
        : `<button class="btn btn-primary sell-btn" style="padding: 0.5rem 1rem;" data-id="${asset.id}">Vender</button>`;
        
    item.innerHTML = `
        <div class="asset-info">
            <div class="asset-icon">${asset.icon || '📦'}</div>
            <div class="asset-details">
                <h3>${asset.name}</h3>
                <p>${asset.description}</p>
            </div>
        </div>
        <div class="asset-action">
            <div class="asset-value">$${asset.value}</div>
            ${btnHTML}
        </div>
    `;
    
    list.appendChild(item);

    if (!isTime) {
        const btn = item.querySelector('.sell-btn');
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            const assetToSell = assets.find(a => a.id === id);
            
            // Satirical confirmation
            let confMsg = `Vender "${assetToSell.name}" por $${assetToSell.value}?\n\nExcelente ideia! Imagine quantas rodadas no Space Slot isso não vai render? Sua família vai entender.`;
            if (confirm(confMsg)) {
                const sold = sellAsset(id);
                if (sold) {
                    alert(`Vendido! +$${sold.value} na sua conta.`);
                    renderAssets(syncUICallback);
                    if (syncUICallback) syncUICallback();
                }
            }
        });
    }
}
