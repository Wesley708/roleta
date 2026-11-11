/**
 * ROLETA NATALINA 🎄
 * Aplicação 100% estática em Vanilla JavaScript
 * Adequado para hospedagem estática no GitHub Pages
 * Versão Atualizada: Roleta Gigante & Gaveta Lateral Temática
 */

(function () {
  'use strict';

  // ============================================================================
  // 1. CONFIGURAÇÕES & PRESETS
  // ============================================================================

  const STORAGE_KEYS = {
    ITEMS: 'roleta_natalina_items',
    AUTO_REMOVE: 'roleta_natalina_auto_remove',
    SOUND: 'roleta_natalina_sound_enabled'
  };

  // Cores Natalinas Oficiais das Fatias (Intercalando Vermelho, Branco e Verde Pinho)
  const TRIO_COLORS = [
    { bg: '#C41E3A', text: '#FFFFFF', dot: '#C41E3A' }, // Vermelho Natalino
    { bg: '#FFFFFF', text: '#153124', dot: '#FFFFFF' }, // Branco Neve (texto verde escuro/legível)
    { bg: '#1B4D3E', text: '#FFFFFF', dot: '#1B4D3E' }  // Verde Pinho
  ];

  // Gera a paleta para N itens garantindo que fatias adjacentes nunca repitam cor
  function getSlicePalette(total) {
    if (total <= 0) return [];
    if (total === 1) return [TRIO_COLORS[0]];
    if (total === 2) return [TRIO_COLORS[0], TRIO_COLORS[1]];

    const palette = [];
    for (let i = 0; i < total; i++) {
      palette.push(TRIO_COLORS[i % 3]);
    }

    // Se o último item coincidir com o primeiro (Vermelho):
    if (palette[total - 1].bg === palette[0].bg) {
      if (palette[total - 2].bg === TRIO_COLORS[1].bg) {
        palette[total - 1] = TRIO_COLORS[2]; // Verde
      } else {
        palette[total - 1] = TRIO_COLORS[1]; // Branco
      }
    }
    return palette;
  }

  // Listas Rápidas Pré-prontas (Presets)
  const PRESETS = {
    'secret-santa': [
      'Papai Noel 🎅',
      'Mamãe Noel 🤶',
      'Duende Mágico 🧝',
      'Rena Rodolfo 🦌',
      'Boneco de Neve ⛄',
      'Quebra-Nozes 💂',
      'Biscoito Gengibre 🍪',
      'Grinch 💚'
    ],
    'supper-menu': [
      'Peru Assado 🦃',
      'Tender com Abacaxi 🍍',
      'Salpicão Tradicional 🥗',
      'Arroz com Passas 🍚',
      'Farofa Crocante 🥓',
      'Rabanada com Canela 🥖',
      'Panetone Trufado 🍞',
      'Pavê de Chocolate 🍫'
    ],
    'challenges': [
      'Cantar "Então é Natal" 🎤',
      'Imitar Papai Noel (Ho-Ho-Ho) 🎅',
      'Dançar como uma Rena 🦌',
      'Contar uma piada de tiozão 🤣',
      'Pose de Árvore de Natal 🎄',
      'Abraçar quem está à direita 🤗',
      'Dizer 3 desejos para 2027 ✨',
      'Comer um doce sem usar as mãos 🥧'
    ],
    'prizes': [
      'Panetone Especial 🎁',
      'Caixa de Bombons 🍬',
      'Caneca Natalina ☕',
      'Par de Meias Quentinhas 🧦',
      'Vale Presente R$ 50 💳',
      'Vinho ou Espumante 🍾',
      'Vela Aromática 🕯️',
      'Abraço Coletivo Grátis 🫂'
    ]
  };

  // ============================================================================
  // 2. ESTADO DA APLICAÇÃO
  // ============================================================================

  let items = [];
  let isSpinning = false;
  let currentAngle = 0; // Ângulo atual da roleta em radianos
  let autoRemoveWinner = false;
  let soundEnabled = true;
  let lastPegIndex = -1;
  let lastWinningItem = null;

  // Elementos do DOM: Roleta e Cabeçalho
  const wheelCanvas = document.getElementById('wheel-canvas');
  const wheelCtx = wheelCanvas.getContext('2d');
  const wheelPointer = document.getElementById('wheel-pointer');
  const spinBtn = document.getElementById('spin-btn');
  const soundToggleBtn = document.getElementById('sound-toggle-btn');
  const soundIcon = document.getElementById('sound-icon');

  // Elementos da Gaveta de Configurações
  const settingsDrawer = document.getElementById('settings-drawer');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const openDrawerBtn = document.getElementById('open-drawer-btn');
  const closeDrawerBtn = document.getElementById('close-drawer-btn');
  const itemsListEl = document.getElementById('items-list');
  const itemsCountBadge = document.getElementById('items-count-badge');
  const minItemsWarning = document.getElementById('min-items-warning');
  const addItemForm = document.getElementById('add-item-form');
  const itemInput = document.getElementById('item-input');
  const autoRemoveToggle = document.getElementById('auto-remove-toggle');
  const shuffleBtn = document.getElementById('shuffle-btn');
  const clearAllBtn = document.getElementById('clear-all-btn');
  const presetButtons = document.querySelectorAll('.preset-pill');

  // Elementos do Modal de Resultado
  const winnerModal = document.getElementById('winner-modal');
  const winnerNameEl = document.getElementById('winner-name');
  const autoRemoveNotice = document.getElementById('auto-remove-notice');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const spinAgainModalBtn = document.getElementById('spin-again-modal-btn');
  const removeWinnerModalBtn = document.getElementById('remove-winner-modal-btn');

  // ============================================================================
  // 3. MOTOR DE ÁUDIO SINTETIZADO (WEB AUDIO API)
  // ============================================================================

  let audioCtx = null;

  function initAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTickSound() {
    if (!soundEnabled) return;
    try {
      initAudioContext();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      const now = audioCtx.currentTime;
      osc.frequency.setValueAtTime(800 + Math.random() * 200, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.045);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {
      // Ignora silenciosamente
    }
  }

  function playFanfareSound() {
    if (!soundEnabled) return;
    try {
      initAudioContext();
      if (!audioCtx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50];
      const now = audioCtx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        const startTime = now + idx * 0.1;
        const noteDuration = idx === notes.length - 1 ? 0.8 : 0.25;

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(startTime);
        osc.stop(startTime + noteDuration);
      });
    } catch (e) {
      // Falha graciosa
    }
  }

  // ============================================================================
  // 4. PERSISTÊNCIA LOCAL (LOCALSTORAGE)
  // ============================================================================

  function loadState() {
    try {
      const savedItems = localStorage.getItem(STORAGE_KEYS.ITEMS);
      if (savedItems) {
        const parsed = JSON.parse(savedItems);
        if (Array.isArray(parsed) && parsed.length > 0) {
          items = parsed;
        } else {
          items = [...PRESETS['challenges']];
        }
      } else {
        items = [...PRESETS['challenges']];
      }
    } catch (e) {
      items = [...PRESETS['challenges']];
    }

    const savedAutoRemove = localStorage.getItem(STORAGE_KEYS.AUTO_REMOVE);
    autoRemoveWinner = savedAutoRemove === 'true';
    autoRemoveToggle.checked = autoRemoveWinner;

    const savedSound = localStorage.getItem(STORAGE_KEYS.SOUND);
    soundEnabled = savedSound !== null ? savedSound === 'true' : true;
    updateSoundUI();
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
      localStorage.setItem(STORAGE_KEYS.AUTO_REMOVE, String(autoRemoveWinner));
      localStorage.setItem(STORAGE_KEYS.SOUND, String(soundEnabled));
    } catch (e) {
      console.warn('Erro ao salvar no localStorage:', e);
    }
  }

  function updateSoundUI() {
    if (soundEnabled) {
      soundIcon.textContent = '🔊';
      soundToggleBtn.querySelector('.btn-text').textContent = 'Som: Ligado';
      soundToggleBtn.style.opacity = '1';
    } else {
      soundIcon.textContent = '🔇';
      soundToggleBtn.querySelector('.btn-text').textContent = 'Som: Mudo';
      soundToggleBtn.style.opacity = '0.7';
    }
  }

  // ============================================================================
  // 5. RENDERIZAÇÃO DA ROLETA NO CANVAS (ALTA RESOLUÇÃO 720px)
  // ============================================================================

  function setupCanvasDPI() {
    const dpr = window.devicePixelRatio || 1;
    const size = 720;
    wheelCanvas.width = size * dpr;
    wheelCanvas.height = size * dpr;
    wheelCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawWheel() {
    const size = 720;
    const centerX = size / 2;
    const centerY = size / 2;
    const outerRadius = size / 2 - 18;
    const innerHubRadius = 66;

    wheelCtx.clearRect(0, 0, size, size);

    const total = items.length;

    if (total < 2) {
      drawEmptyWheel(centerX, centerY, outerRadius);
      spinBtn.disabled = true;
      minItemsWarning.classList.remove('hidden');
      return;
    }

    spinBtn.disabled = isSpinning;
    minItemsWarning.classList.add('hidden');

    const sliceAngle = (2 * Math.PI) / total;
    const palette = getSlicePalette(total);

    wheelCtx.save();
    wheelCtx.translate(centerX, centerY);
    wheelCtx.rotate(currentAngle);

    // 1. Desenha as Fatias com a Paleta Natalina Oficial (Vermelho, Branco e Verde)
    for (let i = 0; i < total; i++) {
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;
      const colorScheme = palette[i];

      wheelCtx.beginPath();
      wheelCtx.moveTo(0, 0);
      wheelCtx.arc(0, 0, outerRadius, startAngle, endAngle);
      wheelCtx.closePath();

      // Gradiente sutil
      const midAngle = startAngle + sliceAngle / 2;
      const grad = wheelCtx.createRadialGradient(0, 0, innerHubRadius, 0, 0, outerRadius);
      if (colorScheme.bg === '#FFFFFF') {
        grad.addColorStop(0, '#f2f2f2');
        grad.addColorStop(1, '#ffffff');
      } else {
        grad.addColorStop(0, lightenDarkenColor(colorScheme.bg, 18));
        grad.addColorStop(1, colorScheme.bg);
      }

      wheelCtx.fillStyle = grad;
      wheelCtx.fill();

      // Linha divisória fina entre fatias
      wheelCtx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
      wheelCtx.lineWidth = 1.8;
      wheelCtx.stroke();

      // Ponto decorativo próximo à borda (branco pérola ou vermelho)
      const dotRadius = outerRadius - 18;
      const dotX = Math.cos(midAngle) * dotRadius;
      const dotY = Math.sin(midAngle) * dotRadius;
      wheelCtx.beginPath();
      wheelCtx.arc(dotX, dotY, 4.5, 0, 2 * Math.PI);
      wheelCtx.fillStyle = colorScheme.bg === '#FFFFFF' ? '#C41E3A' : '#FFFFFF';
      wheelCtx.fill();
      wheelCtx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
      wheelCtx.lineWidth = 1;
      wheelCtx.stroke();

      // 2. Texto do item na fatia
      wheelCtx.save();
      wheelCtx.rotate(midAngle);
      wheelCtx.textAlign = 'right';
      wheelCtx.textBaseline = 'middle';

      let fontSize = 18;
      if (total <= 6) fontSize = 21;
      else if (total <= 12) fontSize = 17;
      else if (total <= 20) fontSize = 14;
      else fontSize = 12;

      wheelCtx.font = `600 ${fontSize}px Poppins, sans-serif`;
      wheelCtx.fillStyle = colorScheme.text;

      if (colorScheme.bg === '#FFFFFF') {
        wheelCtx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        wheelCtx.shadowBlur = 1;
        wheelCtx.shadowOffsetX = 0;
        wheelCtx.shadowOffsetY = 0;
      } else {
        wheelCtx.shadowColor = 'rgba(0, 0, 0, 0.85)';
        wheelCtx.shadowBlur = 5;
        wheelCtx.shadowOffsetX = 1;
        wheelCtx.shadowOffsetY = 1;
      }

      const availableWidth = outerRadius - innerHubRadius - 48;
      const truncatedText = truncateTextToWidth(wheelCtx, items[i], availableWidth);

      wheelCtx.fillText(truncatedText, outerRadius - 32, 0);
      wheelCtx.restore();
    }

    // 3. Moldura Externa Vermelha Natalina com Cravos Brancos
    wheelCtx.beginPath();
    wheelCtx.arc(0, 0, outerRadius + 8, 0, 2 * Math.PI);
    wheelCtx.strokeStyle = '#8B0000';
    wheelCtx.lineWidth = 14;
    wheelCtx.stroke();

    wheelCtx.beginPath();
    wheelCtx.arc(0, 0, outerRadius + 8, 0, 2 * Math.PI);
    wheelCtx.strokeStyle = '#C41E3A';
    wheelCtx.lineWidth = 10;
    wheelCtx.stroke();

    // Cravos / Pérolas brancas na borda externa
    const pegCount = Math.max(total * 2, 24);
    for (let p = 0; p < pegCount; p++) {
      const pegAngle = (p * 2 * Math.PI) / pegCount;
      const px = Math.cos(pegAngle) * (outerRadius + 8);
      const py = Math.sin(pegAngle) * (outerRadius + 8);

      wheelCtx.beginPath();
      wheelCtx.arc(px, py, 3, 0, 2 * Math.PI);
      wheelCtx.fillStyle = '#FFFFFF';
      wheelCtx.fill();
    }

    // 4. Anel Branco Interno contornando o botão central
    wheelCtx.beginPath();
    wheelCtx.arc(0, 0, innerHubRadius + 4, 0, 2 * Math.PI);
    wheelCtx.strokeStyle = '#FFFFFF';
    wheelCtx.lineWidth = 3;
    wheelCtx.stroke();

    wheelCtx.restore();
  }

  function drawEmptyWheel(cx, cy, r) {
    wheelCtx.save();
    wheelCtx.translate(cx, cy);

    wheelCtx.beginPath();
    wheelCtx.arc(0, 0, r, 0, 2 * Math.PI);
    wheelCtx.fillStyle = '#0f241a';
    wheelCtx.fill();
    wheelCtx.strokeStyle = '#C41E3A';
    wheelCtx.lineWidth = 6;
    wheelCtx.stroke();

    wheelCtx.font = '600 20px Poppins, sans-serif';
    wheelCtx.fillStyle = '#FFFFFF';
    wheelCtx.textAlign = 'center';
    wheelCtx.textBaseline = 'middle';
    wheelCtx.fillText('Adicione pelo menos 2 itens', 0, -12);
    wheelCtx.font = '16px Poppins, sans-serif';
    wheelCtx.fillStyle = '#a9dfbf';
    wheelCtx.fillText('na gaveta lateral para girar! 🎄', 0, 18);

    wheelCtx.restore();
  }

  function lightenDarkenColor(col, amt) {
    let usePound = false;
    if (col[0] === '#') {
      col = col.slice(1);
      usePound = true;
    }
    const num = parseInt(col, 16);
    let r = (num >> 16) + amt;
    if (r > 255) r = 255; else if (r < 0) r = 0;
    let b = ((num >> 8) & 0x00FF) + amt;
    if (b > 255) b = 255; else if (b < 0) b = 0;
    let g = (num & 0x0000FF) + amt;
    if (g > 255) g = 255; else if (g < 0) g = 0;
    return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
  }

  function truncateTextToWidth(ctx, text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) {
      return text;
    }
    let truncated = text;
    while (truncated.length > 1 && ctx.measureText(truncated + '…').width > maxWidth) {
      truncated = truncated.slice(0, -1);
    }
    return truncated + '…';
  }

  // ============================================================================
  // 6. MECÂNICA DE GIRO & FÍSICA
  // ============================================================================

  function easeOutQuint(t) {
    return 1 - Math.pow(1 - t, 5);
  }

  function getSliceAtTopPointer(angle) {
    const total = items.length;
    if (total === 0) return 0;
    const sliceAngle = (2 * Math.PI) / total;

    // Ponteiro aponta para baixo a partir de 270° (3π/2)
    const pointerGlobalAngle = (3 * Math.PI) / 2;
    let localAngle = (pointerGlobalAngle - angle) % (2 * Math.PI);
    if (localAngle < 0) {
      localAngle += 2 * Math.PI;
    }
    const index = Math.floor(localAngle / sliceAngle);
    return Math.min(Math.max(index, 0), total - 1);
  }

  function spinWheel() {
    if (isSpinning || items.length < 2) return;

    initAudioContext();
    isSpinning = true;
    spinBtn.disabled = true;

    const duration = 5200;
    const startTime = performance.now();
    const startAngle = currentAngle;

    const fullSpins = 6 + Math.floor(Math.random() * 4);
    const randomOffset = Math.random() * 2 * Math.PI;
    const totalDelta = fullSpins * (2 * Math.PI) + randomOffset;

    lastPegIndex = getSliceAtTopPointer(startAngle);

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuint(progress);

      currentAngle = startAngle + totalDelta * easedProgress;
      drawWheel();

      const currentSlice = getSliceAtTopPointer(currentAngle);
      if (currentSlice !== lastPegIndex) {
        lastPegIndex = currentSlice;
        playTickSound();
        triggerPointerWiggle();
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        finishSpin();
      }
    }

    requestAnimationFrame(animate);
  }

  function triggerPointerWiggle() {
    wheelPointer.classList.add('wiggle');
    setTimeout(() => {
      wheelPointer.classList.remove('wiggle');
    }, 60);
  }

  function finishSpin() {
    isSpinning = false;
    spinBtn.disabled = false;

    currentAngle = currentAngle % (2 * Math.PI);
    const winnerIndex = getSliceAtTopPointer(currentAngle);
    const winnerItem = items[winnerIndex];
    lastWinningItem = { index: winnerIndex, name: winnerItem };

    playFanfareSound();
    launchConfetti();
    showWinnerModal(winnerItem);

    if (autoRemoveWinner) {
      setTimeout(() => {
        removeItem(winnerIndex);
      }, 500);
    }
  }

  // ============================================================================
  // 7. MODAL DE RESULTADO
  // ============================================================================

  function showWinnerModal(winnerName) {
    winnerNameEl.textContent = winnerName;
    winnerModal.classList.remove('hidden');

    if (autoRemoveWinner) {
      autoRemoveNotice.classList.remove('hidden');
      removeWinnerModalBtn.style.display = 'none';
    } else {
      autoRemoveNotice.classList.add('hidden');
      removeWinnerModalBtn.style.display = 'inline-block';
    }
  }

  function closeWinnerModal() {
    winnerModal.classList.add('hidden');
  }

  // ============================================================================
  // 8. CONTROLE DA GAVETA LATERAL (DRAWER)
  // ============================================================================

  function openDrawer() {
    settingsDrawer.classList.add('open');
    drawerBackdrop.classList.add('active');
  }

  function closeDrawer() {
    settingsDrawer.classList.remove('open');
    drawerBackdrop.classList.remove('active');
  }

  function toggleDrawer() {
    if (settingsDrawer.classList.contains('open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  }

  // ============================================================================
  // 9. GERENCIAMENTO DA LISTA DE ITENS
  // ============================================================================

  function renderItemsList() {
    itemsListEl.innerHTML = '';
    itemsCountBadge.textContent = `${items.length} ${items.length === 1 ? 'item' : 'itens'}`;

    const palette = getSlicePalette(items.length);

    items.forEach((itemText, idx) => {
      const li = document.createElement('li');
      li.className = 'item-row';

      const left = document.createElement('div');
      left.className = 'item-left';

      const dot = document.createElement('span');
      dot.className = 'item-color-dot';
      const colorScheme = palette[idx] || TRIO_COLORS[0];
      dot.style.backgroundColor = colorScheme.bg;
      if (colorScheme.bg === '#FFFFFF') {
        dot.style.borderColor = '#C41E3A';
      }

      const name = document.createElement('span');
      name.className = 'item-name';
      name.textContent = itemText;
      name.title = itemText;

      left.appendChild(dot);
      left.appendChild(name);

      // Botão vermelho com lixeira
      const removeBtn = document.createElement('button');
      removeBtn.className = 'btn-remove-item';
      removeBtn.innerHTML = '🗑️';
      removeBtn.title = `Remover "${itemText}"`;
      removeBtn.setAttribute('aria-label', `Remover ${itemText}`);
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeItem(idx);
      });

      li.appendChild(left);
      li.appendChild(removeBtn);
      itemsListEl.appendChild(li);
    });

    drawWheel();
  }

  function addItem(name) {
    const trimmed = name.trim();
    if (!trimmed) return;
    items.push(trimmed);
    saveState();
    renderItemsList();
  }

  function removeItem(index) {
    if (isSpinning) return;
    if (index >= 0 && index < items.length) {
      items.splice(index, 1);
      saveState();
      renderItemsList();
    }
  }

  function shuffleItems() {
    if (isSpinning || items.length < 2) return;
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    saveState();
    renderItemsList();
    playTickSound();
  }

  function clearAllItems() {
    if (isSpinning) return;
    if (items.length === 0) return;
    if (confirm('Tem certeza que deseja limpar todos os itens da roleta?')) {
      items = [];
      saveState();
      renderItemsList();
    }
  }

  function loadPreset(presetKey) {
    if (isSpinning) return;
    if (PRESETS[presetKey]) {
      items = [...PRESETS[presetKey]];
      saveState();
      renderItemsList();
      playTickSound();
    }
  }

  // ============================================================================
  // 10. SISTEMA DE CONFETES (CANVAS 2D)
  // ============================================================================

  const confettiCanvas = document.getElementById('confetti-canvas');
  const confettiCtx = confettiCanvas.getContext('2d');
  let confettiParticles = [];
  let confettiAnimationId = null;

  function resizeConfettiCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeConfettiCanvas);
  resizeConfettiCanvas();

  function launchConfetti() {
    if (confettiAnimationId) {
      cancelAnimationFrame(confettiAnimationId);
    }
    resizeConfettiCanvas();

    confettiParticles = [];
    const count = 150;
    const festiveColors = ['#FFFFFF', '#C41E3A', '#1B4D3E', '#FF3344', '#E63946', '#2ECC71'];

    for (let i = 0; i < count; i++) {
      confettiParticles.push({
        x: window.innerWidth * 0.45 + (Math.random() - 0.5) * 220,
        y: window.innerHeight * 0.45 + (Math.random() - 0.5) * 80,
        vx: (Math.random() - 0.5) * 16,
        vy: -Math.random() * 16 - 6,
        size: Math.random() * 9 + 5,
        color: festiveColors[Math.floor(Math.random() * festiveColors.length)],
        tilt: Math.random() * 10 - 5,
        tiltAngle: Math.random() * Math.PI,
        tiltAngleIncrement: Math.random() * 0.08 + 0.04,
        type: Math.random() > 0.35 ? 'rect' : 'circle',
        opacity: 1
      });
    }

    const start = performance.now();
    const duration = 4000;

    function renderConfetti(time) {
      const elapsed = time - start;
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

      let activeParticles = 0;

      for (let p of confettiParticles) {
        p.vy += 0.42;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.985;
        p.tiltAngle += p.tiltAngleIncrement;
        p.tilt = Math.sin(p.tiltAngle) * 12;

        if (elapsed > duration - 1000) {
          p.opacity = Math.max(0, 1 - (elapsed - (duration - 1000)) / 1000);
        }

        if (p.y < confettiCanvas.height && p.opacity > 0) {
          activeParticles++;
          confettiCtx.save();
          confettiCtx.globalAlpha = p.opacity;
          confettiCtx.fillStyle = p.color;
          confettiCtx.beginPath();

          if (p.type === 'rect') {
            confettiCtx.translate(p.x, p.y);
            confettiCtx.rotate(p.tiltAngle);
            confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          } else {
            confettiCtx.arc(p.x, p.y, p.size / 2, 0, 2 * Math.PI);
            confettiCtx.fill();
          }
          confettiCtx.restore();
        }
      }

      if (elapsed < duration && activeParticles > 0) {
        confettiAnimationId = requestAnimationFrame(renderConfetti);
      } else {
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        confettiAnimationId = null;
      }
    }

    confettiAnimationId = requestAnimationFrame(renderConfetti);
  }

  // ============================================================================
  // 11. NEVE CAINDO AO FUNDO (SNOWFALL CANVAS)
  // ============================================================================

  const snowCanvas = document.getElementById('snow-canvas');
  const snowCtx = snowCanvas.getContext('2d');
  let snowflakes = [];

  function resizeSnowCanvas() {
    snowCanvas.width = window.innerWidth;
    snowCanvas.height = window.innerHeight;
    initSnowflakes();
  }

  function initSnowflakes() {
    const flakeCount = Math.floor(window.innerWidth / 15);
    snowflakes = [];
    for (let i = 0; i < flakeCount; i++) {
      snowflakes.push({
        x: Math.random() * snowCanvas.width,
        y: Math.random() * snowCanvas.height,
        radius: Math.random() * 2.5 + 0.8,
        density: Math.random() * 1 + 0.5,
        speedY: Math.random() * 0.9 + 0.5,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.02 + 0.01,
        alpha: Math.random() * 0.7 + 0.3
      });
    }
  }

  function updateAndDrawSnow() {
    snowCtx.clearRect(0, 0, snowCanvas.width, snowCanvas.height);
    snowCtx.fillStyle = '#ffffff';

    for (let flake of snowflakes) {
      flake.y += flake.speedY;
      flake.wobble += flake.wobbleSpeed;
      flake.x += Math.sin(flake.wobble) * 0.5;

      if (flake.y > snowCanvas.height + 5) {
        flake.y = -5;
        flake.x = Math.random() * snowCanvas.width;
      }
      if (flake.x > snowCanvas.width + 5) {
        flake.x = -5;
      } else if (flake.x < -5) {
        flake.x = snowCanvas.width + 5;
      }

      snowCtx.save();
      snowCtx.globalAlpha = flake.alpha;
      snowCtx.beginPath();
      snowCtx.arc(flake.x, flake.y, flake.radius, 0, 2 * Math.PI);
      snowCtx.fill();
      snowCtx.restore();
    }

    requestAnimationFrame(updateAndDrawSnow);
  }

  window.addEventListener('resize', resizeSnowCanvas);
  resizeSnowCanvas();
  requestAnimationFrame(updateAndDrawSnow);

  // ============================================================================
  // 12. EVENT LISTENERS
  // ============================================================================

  // Giro da Roleta
  spinBtn.addEventListener('click', spinWheel);
  wheelCanvas.addEventListener('click', spinWheel);

  // Tecla de Espaço (Spacebar)
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.key === ' ') {
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (activeTag === 'input' || activeTag === 'textarea') {
        return;
      }
      e.preventDefault();
      spinWheel();
    }
  });

  // Gaveta Lateral
  openDrawerBtn.addEventListener('click', toggleDrawer);
  closeDrawerBtn.addEventListener('click', closeDrawer);
  drawerBackdrop.addEventListener('click', closeDrawer);

  // Fechar com Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!winnerModal.classList.contains('hidden')) {
        closeWinnerModal();
      } else if (settingsDrawer.classList.contains('open')) {
        closeDrawer();
      }
    }
  });

  // Adicionar Item
  addItemForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = itemInput.value;
    if (val.trim()) {
      addItem(val);
      itemInput.value = '';
      itemInput.focus();
    }
  });

  // Checkbox de Remoção Automática
  autoRemoveToggle.addEventListener('change', (e) => {
    autoRemoveWinner = e.target.checked;
    saveState();
  });

  // Ações de Embaralhar e Limpar
  shuffleBtn.addEventListener('click', shuffleItems);
  clearAllBtn.addEventListener('click', clearAllItems);

  // Presets Rápidos
  presetButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const presetKey = btn.dataset.preset;
      loadPreset(presetKey);
    });
  });

  // Alternar Som
  soundToggleBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    saveState();
    updateSoundUI();
    if (soundEnabled) {
      playTickSound();
    }
  });

  // Modal
  closeModalBtn.addEventListener('click', closeWinnerModal);
  winnerModal.addEventListener('click', (e) => {
    if (e.target === winnerModal) {
      closeWinnerModal();
    }
  });

  spinAgainModalBtn.addEventListener('click', () => {
    closeWinnerModal();
    setTimeout(() => {
      spinWheel();
    }, 250);
  });

  removeWinnerModalBtn.addEventListener('click', () => {
    if (lastWinningItem) {
      const idx = items.indexOf(lastWinningItem.name);
      if (idx !== -1) {
        removeItem(idx);
      }
      lastWinningItem = null;
    }
    closeWinnerModal();
  });

  // ============================================================================
  // 13. INICIALIZAÇÃO
  // ============================================================================
  setupCanvasDPI();
  window.addEventListener('resize', () => {
    setupCanvasDPI();
    drawWheel();
  });
  loadState();
  renderItemsList();
})();
