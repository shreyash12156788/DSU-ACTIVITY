/**
 * ============================================================================
 * INSERTION SORT VISUALIZER — CORE JAVASCRIPT ENGINE
 * 60fps CSS Hardware-Accelerated FLIP Transforms & Web Audio Synthesis
 * ============================================================================
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. CONSTANTS & METRICS
  // --------------------------------------------------------------------------
  const SUITS = ['spades', 'hearts', 'diamonds', 'clubs'];
  const SUIT_SYMBOLS = {
    spades: '♠',
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣'
  };

  const CODE_SNIPPETS = {
    python: `def insertion_sort(arr):
    n = len(arr)
    # Traverse through 1 to len(arr)
    for i in range(1, n):
        key = arr[i]
        j = i - 1
        
        # Move elements greater than key 1 position ahead
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
            
        arr[j + 1] = key
    return arr`,

    javascript: `function insertionSort(arr) {
  const n = arr.length;
  // Outer loop builds sorted subarray from left to right
  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;

    // Shift elements that are greater than key to the right
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}`,

    java: `public class InsertionSort {
    public static void sort(int[] arr) {
        int n = arr.length;
        for (int i = 1; i < n; i++) {
            int key = arr[i];
            int j = i - 1;

            /* Shift elements of arr[0..i-1] that are
               greater than key, to one position ahead */
            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j];
                j = j - 1;
            }
            arr[j + 1] = key;
        }
    }
}`,

    c: `void insertionSort(int arr[], int n) {
    int i, key, j;
    for (i = 1; i < n; i++) {
        key = arr[i];
        j = i - 1;

        /* Move elements of arr[0..i-1], that are
           greater than key, to one position ahead */
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j = j - 1;
        }
        arr[j + 1] = key;
    }
}`
  };

  function getLayoutMetrics() {
    const isMobile = window.innerWidth <= 768;
    const cardWidth = isMobile ? 54 : 68;
    const cardHeight = isMobile ? 84 : 104;
    const cardGap = isMobile ? 8 : 12;
    return {
      cardWidth,
      cardHeight,
      cardGap,
      stepWidth: cardWidth + cardGap
    };
  }

  // --------------------------------------------------------------------------
  // 2. APPLICATION STATE
  // --------------------------------------------------------------------------
  const state = {
    rawArray: [],         // Array of { id, value, suit }
    snapshots: [],        // Precomputed execution steps
    currentStep: 0,
    isPlaying: false,
    timerId: null,
    playbackSpeed: 1.0,
    baseDelay: 850,       // Base ms per step at 1.0x
    viewMode: 'cards',    // 'cards' | 'bars'
    appMode: 'visualizer',// 'visualizer' | 'quiz' | 'challenge'
    activeLang: 'python',
    activePreset: 'random',
    soundEnabled: true,
    
    // Quiz state
    quiz: {
      active: false,
      targetKey: null,
      correctSlot: 0,
      score: 0,
      streak: 0,
      answered: false
    },

    // Challenge state
    challenge: {
      active: false,
      currentPass: 1,
      totalPasses: 0,
      workingValues: [],
      score: 0
    }
  };

  // --------------------------------------------------------------------------
  // 3. DOM ELEMENT REFERENCES
  // --------------------------------------------------------------------------
  const DOM = {
    html: document.documentElement,
    cardTrack: document.getElementById('card-track'),
    slotsLane: document.getElementById('slots-lane'),
    dropZonesLane: document.getElementById('drop-zones-lane'),
    pointersLane: document.getElementById('pointers-lane'),
    pointerI: document.getElementById('pointer-i'),
    pointerJ: document.getElementById('pointer-j'),
    sortedBracket: document.getElementById('sorted-bracket'),
    
    // Controls
    btnPlayPause: document.getElementById('btn-play-pause'),
    playPauseIcon: document.getElementById('play-pause-icon'),
    playPauseText: document.getElementById('play-pause-text'),
    btnStepBack: document.getElementById('btn-step-back'),
    btnStepForward: document.getElementById('btn-step-forward'),
    btnReset: document.getElementById('btn-reset'),
    stepScrubber: document.getElementById('step-scrubber'),
    scrubberCounter: document.getElementById('scrubber-counter'),
    speedSlider: document.getElementById('speed-slider'),
    speedDisplay: document.getElementById('speed-display'),

    // Input & Presets
    customInput: document.getElementById('custom-array-input'),
    btnApplyCustom: document.getElementById('btn-apply-custom'),
    sizeSlider: document.getElementById('array-size-slider'),
    sizeDisplay: document.getElementById('array-size-display'),
    presetPills: document.querySelectorAll('.preset-pill'),
    btnRandomize: document.getElementById('btn-randomize'),
    dragHint: document.getElementById('drag-hint'),

    // Mode Switchers
    modeBtnViz: document.getElementById('mode-btn-viz'),
    modeBtnQuiz: document.getElementById('mode-btn-quiz'),
    modeBtnChallenge: document.getElementById('mode-btn-challenge'),
    viewCardsBtn: document.getElementById('view-cards-btn'),
    viewBarsBtn: document.getElementById('view-bars-btn'),
    interactiveBanner: document.getElementById('interactive-mode-banner'),
    bannerBadge: document.getElementById('banner-badge'),
    bannerText: document.getElementById('banner-text'),
    bannerStats: document.getElementById('banner-stats'),
    quizScore: document.getElementById('quiz-score'),
    quizStreak: document.getElementById('quiz-streak'),
    bannerActionBtn: document.getElementById('banner-action-btn'),

    // Telemetry & Variables
    counterComparisons: document.getElementById('counter-comparisons'),
    counterShifts: document.getElementById('counter-shifts'),
    counterPasses: document.getElementById('counter-passes'),
    counterSteps: document.getElementById('counter-steps'),
    progressBarFill: document.getElementById('progress-bar-fill'),
    progressPercent: document.getElementById('progress-percent'),
    passIndicator: document.getElementById('pass-indicator'),

    varI: document.getElementById('var-i-val'),
    varJ: document.getElementById('var-j-val'),
    varKey: document.getElementById('var-key-val'),
    varCond: document.getElementById('var-cond-val'),
    pseudocodePre: document.getElementById('pseudocode-code'),

    // Complexity Chips
    chipBest: document.getElementById('chip-best'),
    chipAvg: document.getElementById('chip-avg'),
    chipWorst: document.getElementById('chip-worst'),

    // Narration & Mascot
    narrationTag: document.getElementById('narration-tag'),
    narrationText: document.getElementById('narration-text'),
    mascotBubble: document.getElementById('mascot-speech'),
    mascotEyes: document.getElementById('mascot-eyes'),

    // Utilities & Modals
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
    themeIcon: document.getElementById('theme-icon'),
    soundToggleBtn: document.getElementById('sound-toggle-btn'),
    soundIcon: document.getElementById('sound-icon'),
    shortcutsBtn: document.getElementById('shortcuts-btn'),
    shortcutsModal: document.getElementById('shortcuts-modal'),
    btnCloseModal: document.getElementById('btn-close-modal'),
    btnModalOk: document.getElementById('btn-modal-ok'),
    toastContainer: document.getElementById('toast-container'),

    // Code tabs
    codeTabBtns: document.querySelectorAll('.code-tab-btn'),
    codeSnippetPre: document.getElementById('code-snippet-pre'),
    btnCopyCode: document.getElementById('btn-copy-code'),

    // Charts & Canvases
    complexityChart: document.getElementById('complexity-chart'),
    confettiCanvas: document.getElementById('confetti-canvas'),
    particleCanvas: document.getElementById('particle-canvas'),

    // Viva Accordion
    vivaToggle: document.getElementById('viva-toggle'),
    vivaContent: document.getElementById('viva-content'),
    vivaArrow: document.getElementById('viva-arrow')
  };

  // --------------------------------------------------------------------------
  // 4. WEB AUDIO SYNTHESIZER
  // --------------------------------------------------------------------------
  class WebAudioSynthesizer {
    constructor() {
      this.ctx = null;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playTone(frequency, type, duration, gainStart = 0.15) {
      if (!state.soundEnabled) return;
      this.init();
      if (!this.ctx) return;

      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

        gain.gain.setValueAtTime(gainStart, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        // Fallback for audio restrictions
      }
    }

    playCompare() {
      this.playTone(560, 'sine', 0.06, 0.12);
    }

    playShift() {
      this.playTone(380, 'triangle', 0.12, 0.14);
    }

    playInsert() {
      this.playTone(660, 'sine', 0.18, 0.22);
      setTimeout(() => this.playTone(880, 'sine', 0.14, 0.15), 35);
    }

    playSuccess() {
      this.playTone(523.25, 'triangle', 0.12, 0.15); // C5
      setTimeout(() => this.playTone(659.25, 'triangle', 0.16, 0.18), 70); // E5
      setTimeout(() => this.playTone(783.99, 'triangle', 0.22, 0.2), 140); // G5
    }

    playError() {
      this.playTone(180, 'sawtooth', 0.2, 0.12);
    }

    playFanfare() {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playTone(freq, 'sine', 0.35, 0.25);
        }, idx * 100);
      });
    }
  }

  const audioSynth = new WebAudioSynthesizer();

  // --------------------------------------------------------------------------
  // 5. PARTICLE & CONFETTI ENGINES
  // --------------------------------------------------------------------------
  const particleEngine = {
    canvas: DOM.particleCanvas,
    ctx: DOM.particleCanvas.getContext('2d'),
    particles: [],
    animId: null,

    init() {
      this.resize();
      window.addEventListener('resize', () => this.resize());
    },

    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    },

    burst(x, y, color = '#fbbf24') {
      const count = 24;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 5;
        this.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.5,
          color: i % 2 === 0 ? color : '#38bdf8',
          radius: 2.5 + Math.random() * 3.5,
          alpha: 1,
          decay: 0.02 + Math.random() * 0.025
        });
      }
      if (!this.animId) {
        this.loop();
      }
    },

    loop() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.globalAlpha = p.alpha;
        this.ctx.fillStyle = p.color;
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = 6;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }

      if (this.particles.length > 0) {
        this.animId = requestAnimationFrame(() => this.loop());
      } else {
        this.animId = null;
      }
    }
  };

  const confettiEngine = {
    canvas: DOM.confettiCanvas,
    ctx: DOM.confettiCanvas.getContext('2d'),
    pieces: [],
    animId: null,

    init() {
      this.resize();
      window.addEventListener('resize', () => this.resize());
    },

    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    },

    fire() {
      const colors = ['#fbbf24', '#f43f5e', '#38bdf8', '#10b981', '#8b5cf6', '#ec4899'];
      const count = 120;
      this.pieces = [];

      for (let i = 0; i < count; i++) {
        this.pieces.push({
          x: window.innerWidth * 0.2 + Math.random() * (window.innerWidth * 0.6),
          y: window.innerHeight * 0.35 + (Math.random() * 80 - 40),
          vx: (Math.random() - 0.5) * 12,
          vy: -6 - Math.random() * 8,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 7 + Math.random() * 8,
          rotation: Math.random() * 360,
          rotSpeed: (Math.random() - 0.5) * 8
        });
      }

      if (!this.animId) {
        this.loop();
      }
    },

    loop() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      for (let i = this.pieces.length - 1; i >= 0; i--) {
        const p = this.pieces[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25;
        p.vx *= 0.98;
        p.rotation += p.rotSpeed;

        if (p.y > window.innerHeight + 20) {
          this.pieces.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.fillStyle = p.color;
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = 4;
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        this.ctx.restore();
      }

      if (this.pieces.length > 0) {
        this.animId = requestAnimationFrame(() => this.loop());
      } else {
        this.animId = null;
      }
    }
  };

  // --------------------------------------------------------------------------
  // 6. TOAST SYSTEM
  // --------------------------------------------------------------------------
  function showToast(message, type = 'info', icon = '💡') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span class="toast-icon">${icon}</span> <span>${message}</span>`;
    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 3000);
  }

  // --------------------------------------------------------------------------
  // 7. MASCOT CONTROLLER
  // --------------------------------------------------------------------------
  const mascot = {
    say(text) {
      DOM.mascotBubble.textContent = text;
    },
    setExpression(mood) {
      if (!DOM.mascotEyes) return;
      if (mood === 'thinking') {
        DOM.mascotEyes.innerHTML = `
          <ellipse cx="42" cy="57" rx="4.5" ry="2" fill="#fbbf24" class="eye eye-left" />
          <ellipse cx="58" cy="57" rx="4.5" ry="4" fill="#fbbf24" class="eye eye-right" />
        `;
      } else if (mood === 'happy') {
        DOM.mascotEyes.innerHTML = `
          <path d="M 38 58 Q 42 52 46 58" stroke="#10b981" stroke-width="2.5" fill="none" stroke-linecap="round" />
          <path d="M 54 58 Q 58 52 62 58" stroke="#10b981" stroke-width="2.5" fill="none" stroke-linecap="round" />
        `;
      } else if (mood === 'celebrating') {
        DOM.mascotEyes.innerHTML = `
          <text x="42" y="61" font-size="9" text-anchor="middle" fill="#ec4899">★</text>
          <text x="58" y="61" font-size="9" text-anchor="middle" fill="#ec4899">★</text>
        `;
      } else {
        DOM.mascotEyes.innerHTML = `
          <circle cx="42" cy="57" r="4.5" fill="#38bdf8" class="eye eye-left" />
          <circle cx="58" cy="57" r="4.5" fill="#38bdf8" class="eye eye-right" />
        `;
      }
    }
  };

  // --------------------------------------------------------------------------
  // 8. SNAPSHOT ENGINE (Precomputed Exact Layout Coordinates)
  // --------------------------------------------------------------------------
  function generateSnapshots(initialCards) {
    const snapshots = [];
    const n = initialCards.length;

    let slots = initialCards.map((c, idx) => ({ ...c, slotIndex: idx }));

    let comparisons = 0;
    let shifts = 0;

    function cloneSlots() {
      return slots.map(c => ({ ...c }));
    }

    // Step 0: Initial
    snapshots.push({
      stepIndex: 0,
      cards: cloneSlots(),
      gapSlot: null,
      i: null,
      j: null,
      keyCardId: null,
      keyHoverSlot: null,
      liftedKey: false,
      comparingCardId: null,
      shiftedCardId: null,
      insertedCardId: null,
      sortedUpTo: 0,
      pseudocodeLine: 1,
      narration: `Hand of ${n} playing cards initialized. The first card at index [0] (${slots[0].value}) is trivially sorted. Ready for Pass 1.`,
      comparisons: 0,
      shifts: 0,
      passNumber: 0,
      actionType: 'INIT',
      mascotMood: 'normal'
    });

    if (n <= 1) {
      snapshots.push({
        stepIndex: 1,
        cards: cloneSlots(),
        gapSlot: null,
        i: 0,
        j: 0,
        keyCardId: null,
        keyHoverSlot: null,
        liftedKey: false,
        comparingCardId: null,
        shiftedCardId: null,
        insertedCardId: null,
        sortedUpTo: 0,
        pseudocodeLine: 7,
        narration: `Array has only 1 card. It is already sorted!`,
        comparisons: 0,
        shifts: 0,
        passNumber: 1,
        actionType: 'COMPLETE',
        mascotMood: 'celebrating'
      });
      return snapshots;
    }

    // Outer Loop: i = 1 to n - 1
    for (let i = 1; i < n; i++) {
      const keyCard = slots.find(c => c.slotIndex === i);
      const keyId = keyCard.id;
      const keyVal = keyCard.value;

      let gapSlot = i;
      let j = i - 1;

      // STEP A: Lift Key Card
      snapshots.push({
        stepIndex: snapshots.length,
        cards: cloneSlots(),
        gapSlot: gapSlot,
        i: i,
        j: j,
        keyCardId: keyId,
        keyHoverSlot: i,
        liftedKey: true,
        comparingCardId: null,
        shiftedCardId: null,
        insertedCardId: null,
        sortedUpTo: i - 1,
        pseudocodeLine: 2,
        narration: `Pass ${i}: Lift up key card <strong>${keyVal}</strong> from slot [${i}]. Finding where it fits in sorted partition [0..${i - 1}].`,
        comparisons,
        shifts,
        passNumber: i,
        actionType: 'LIFT_KEY',
        mascotMood: 'thinking'
      });

      let insertionFound = false;

      while (j >= 0 && !insertionFound) {
        comparisons++;
        const comparedCard = slots.find(c => c.slotIndex === j);
        const comparedVal = comparedCard.value;
        const isGreater = comparedVal > keyVal;

        // STEP B: Compare
        snapshots.push({
          stepIndex: snapshots.length,
          cards: cloneSlots(),
          gapSlot: gapSlot,
          i: i,
          j: j,
          keyCardId: keyId,
          keyHoverSlot: j + 1,
          liftedKey: true,
          comparingCardId: comparedCard.id,
          shiftedCardId: null,
          insertedCardId: null,
          sortedUpTo: i - 1,
          pseudocodeLine: 4,
          narration: `Compare key (<strong>${keyVal}</strong>) with slot [${j}] (<strong>${comparedVal}</strong>). Is ${comparedVal} &gt; ${keyVal}? <strong>${isGreater ? 'YES' : 'NO'}</strong>.`,
          comparisons,
          shifts,
          passNumber: i,
          actionType: 'COMPARE',
          mascotMood: 'thinking'
        });

        if (isGreater) {
          // STEP C: Shift compared card to the right into the gap
          comparedCard.slotIndex = j + 1;
          gapSlot = j;
          shifts++;

          snapshots.push({
            stepIndex: snapshots.length,
            cards: cloneSlots(),
            gapSlot: gapSlot,
            i: i,
            j: j,
            keyCardId: keyId,
            keyHoverSlot: j,
            liftedKey: true,
            comparingCardId: null,
            shiftedCardId: comparedCard.id,
            insertedCardId: null,
            sortedUpTo: i - 1,
            pseudocodeLine: 5,
            narration: `${comparedVal} &gt; ${keyVal}: Shift card <strong>${comparedVal}</strong> right into slot [${j + 1}]. Gap is now at slot [${j}].`,
            comparisons,
            shifts,
            passNumber: i,
            actionType: 'SHIFT',
            mascotMood: 'normal'
          });

          j--;

          if (j < 0) {
            snapshots.push({
              stepIndex: snapshots.length,
              cards: cloneSlots(),
              gapSlot: gapSlot,
              i: i,
              j: -1,
              keyCardId: keyId,
              keyHoverSlot: 0,
              liftedKey: true,
              comparingCardId: null,
              shiftedCardId: null,
              insertedCardId: null,
              sortedUpTo: i - 1,
              pseudocodeLine: 6,
              narration: `Reached beginning of hand (j = -1). Key card belongs in the first gap at slot [0].`,
              comparisons,
              shifts,
              passNumber: i,
              actionType: 'REACHED_START',
              mascotMood: 'thinking'
            });
          }
        } else {
          insertionFound = true;
          snapshots.push({
            stepIndex: snapshots.length,
            cards: cloneSlots(),
            gapSlot: gapSlot,
            i: i,
            j: j,
            keyCardId: keyId,
            keyHoverSlot: j + 1,
            liftedKey: true,
            comparingCardId: comparedCard.id,
            shiftedCardId: null,
            insertedCardId: null,
            sortedUpTo: i - 1,
            pseudocodeLine: 4,
            narration: `${comparedVal} &le; ${keyVal}: Stop scanning! Target insertion position confirmed at slot [<strong>${j + 1}</strong>].`,
            comparisons,
            shifts,
            passNumber: i,
            actionType: 'POSITION_FOUND',
            mascotMood: 'happy'
          });
        }
      }

      // STEP D: Drop Key into gap at j + 1
      const targetSlot = j + 1;
      keyCard.slotIndex = targetSlot;

      snapshots.push({
        stepIndex: snapshots.length,
        cards: cloneSlots(),
        gapSlot: null,
        i: i,
        j: targetSlot,
        keyCardId: null,
        keyHoverSlot: targetSlot,
        liftedKey: false,
        comparingCardId: null,
        shiftedCardId: null,
        insertedCardId: keyId,
        sortedUpTo: i,
        pseudocodeLine: 7,
        narration: `Drop key card <strong>${keyVal}</strong> into slot [${targetSlot}]. Subarray [0..${i}] is now completely sorted!`,
        comparisons,
        shifts,
        passNumber: i,
        actionType: 'INSERT',
        mascotMood: 'happy'
      });
    }

    // Final Snapshot: COMPLETE
    snapshots.push({
      stepIndex: snapshots.length,
      cards: cloneSlots(),
      gapSlot: null,
      i: n - 1,
      j: n - 1,
      keyCardId: null,
      keyHoverSlot: null,
      liftedKey: false,
      comparingCardId: null,
      shiftedCardId: null,
      insertedCardId: null,
      sortedUpTo: n - 1,
      pseudocodeLine: 1,
      narration: `🎉 <strong>Array is fully sorted!</strong> Finished in ${comparisons} comparisons and ${shifts} shifts.`,
      comparisons,
      shifts,
      passNumber: n - 1,
      actionType: 'COMPLETE',
      mascotMood: 'celebrating'
    });

    return snapshots;
  }

  // --------------------------------------------------------------------------
  // 9. 60FPS FLIP RENDERING ENGINE
  // --------------------------------------------------------------------------
  let gapPlaceholderEl = null;

  function renderSnapshot(snap) {
    if (!snap) return;

    const n = snap.cards.length;
    const { cardWidth, cardHeight, cardGap, stepWidth } = getLayoutMetrics();
    const totalWidth = n * stepWidth - cardGap;

    DOM.cardTrack.style.width = `${totalWidth}px`;
    DOM.slotsLane.style.width = `${totalWidth}px`;
    DOM.dropZonesLane.style.width = `${totalWidth}px`;

    // 1. Ensure Gap Placeholder exists
    if (!gapPlaceholderEl) {
      gapPlaceholderEl = document.createElement('div');
      gapPlaceholderEl.className = 'card-gap-placeholder';
      gapPlaceholderEl.innerHTML = `<span>⇣</span> Gap`;
      DOM.cardTrack.appendChild(gapPlaceholderEl);
    }

    if (snap.gapSlot !== null) {
      gapPlaceholderEl.style.display = 'flex';
      const gapX = snap.gapSlot * stepWidth;
      gapPlaceholderEl.style.transform = `translate3d(${gapX}px, 0, 0)`;
      gapPlaceholderEl.innerHTML = `<span>⇣</span> [${snap.gapSlot}]`;
    } else {
      gapPlaceholderEl.style.display = 'none';
    }

    // 2. Render / Update Slots Lane
    if (DOM.slotsLane.children.length !== n) {
      DOM.slotsLane.innerHTML = '';
      for (let s = 0; s < n; s++) {
        const slotEl = document.createElement('div');
        slotEl.className = 'slot-index';
        slotEl.textContent = `[${s}]`;
        slotEl.style.transform = `translate3d(${s * stepWidth}px, 0, 0)`;
        DOM.slotsLane.appendChild(slotEl);
      }
    }

    // 3. Render / Update Cards
    const maxVal = Math.max(...snap.cards.map(c => c.value), 50);

    snap.cards.forEach(card => {
      let cardEl = DOM.cardTrack.querySelector(`[data-id="${card.id}"]`);

      let stateClass = '';
      const isLifted = snap.liftedKey && card.id === snap.keyCardId;

      if (isLifted) {
        stateClass = 'state-key';
      } else if (card.id === snap.comparingCardId) {
        stateClass = 'state-compare';
      } else if (card.id === snap.shiftedCardId) {
        stateClass = 'state-shifted';
      } else if (card.slotIndex <= snap.sortedUpTo) {
        stateClass = 'state-sorted';
      } else {
        stateClass = 'state-unsorted';
      }

      if (snap.actionType === 'INSERT' && card.id === snap.insertedCardId) {
        stateClass += ' anim-insert-bounce';
      }
      if (snap.actionType === 'COMPLETE') {
        stateClass = 'state-sorted anim-wave';
      }

      let targetX, targetY, targetScale;
      if (isLifted) {
        targetX = snap.keyHoverSlot * stepWidth;
        targetY = state.viewMode === 'cards' ? -68 : -52;
        targetScale = 1.1;
      } else {
        targetX = card.slotIndex * stepWidth;
        targetY = 0;
        targetScale = 1.0;
      }

      if (state.viewMode === 'cards') {
        if (!cardEl || !cardEl.classList.contains('sort-card')) {
          if (cardEl) cardEl.remove();
          cardEl = document.createElement('div');
          cardEl.className = `sort-card suit-${card.suit}`;
          cardEl.dataset.id = card.id;

          const symbol = SUIT_SYMBOLS[card.suit] || '♠';
          cardEl.innerHTML = `
            <div class="card-corner top-left">
              <span class="corner-val">${card.value}</span>
              <span class="corner-suit">${symbol}</span>
            </div>
            <div class="card-center">
              <span class="center-suit-watermark">${symbol}</span>
              <span class="center-val-big">${card.value}</span>
            </div>
            <div class="card-corner bottom-right">
              <span class="corner-val">${card.value}</span>
              <span class="corner-suit">${symbol}</span>
            </div>
          `;
          DOM.cardTrack.appendChild(cardEl);
        }

        cardEl.className = `sort-card suit-${card.suit} ${stateClass}`;
        cardEl.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) scale(${targetScale})`;

        if (state.currentStep === 0 && !state.isPlaying) {
          cardEl.draggable = true;
          setupCardDragAndDrop(cardEl, card.id);
        } else {
          cardEl.draggable = false;
        }

      } else {
        if (!cardEl || !cardEl.classList.contains('sort-bar')) {
          if (cardEl) cardEl.remove();
          cardEl = document.createElement('div');
          cardEl.className = `sort-bar`;
          cardEl.dataset.id = card.id;
          DOM.cardTrack.appendChild(cardEl);
        }

        const heightPercent = Math.max(18, Math.round((card.value / maxVal) * 100));
        cardEl.style.height = `${heightPercent}%`;
        cardEl.className = `sort-bar ${stateClass}`;
        cardEl.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) scale(${targetScale})`;
        cardEl.innerHTML = `<span class="bar-val">${card.value}</span>`;

        if (state.currentStep === 0 && !state.isPlaying) {
          cardEl.draggable = true;
          setupCardDragAndDrop(cardEl, card.id);
        } else {
          cardEl.draggable = false;
        }
      }
    });

    // 4. Update Pointer Arrows
    if (snap.i !== null && snap.actionType !== 'COMPLETE') {
      const iX = snap.i * stepWidth + cardWidth / 2;
      DOM.pointerI.style.display = 'flex';
      DOM.pointerI.style.left = `${iX}px`;
    } else {
      DOM.pointerI.style.display = 'none';
    }

    if (snap.j !== null && snap.j >= 0 && snap.actionType !== 'COMPLETE') {
      const jX = snap.j * stepWidth + cardWidth / 2;
      DOM.pointerJ.style.display = 'flex';
      DOM.pointerJ.style.left = `${jX}px`;
    } else {
      DOM.pointerJ.style.display = 'none';
    }

    // 5. Update Sorted Boundary Bracket
    if (snap.sortedUpTo >= 0) {
      const bracketW = (snap.sortedUpTo + 1) * stepWidth - cardGap;
      DOM.sortedBracket.style.display = 'block';
      DOM.sortedBracket.style.left = '0px';
      DOM.sortedBracket.style.width = `${bracketW}px`;
    } else {
      DOM.sortedBracket.style.display = 'none';
    }

    // 6. Update Pseudocode Active Line
    highlightPseudocodeLine(snap.pseudocodeLine);

    // 7. Update Variables Inspector
    DOM.varI.textContent = snap.i !== null ? snap.i : '-';
    DOM.varJ.textContent = snap.j !== null ? snap.j : '-';
    
    const currentKeyCard = snap.cards.find(c => c.id === snap.keyCardId);
    DOM.varKey.textContent = currentKeyCard ? currentKeyCard.value : (snap.liftedKey ? '...' : '-');

    if (snap.comparingCardId !== null && currentKeyCard) {
      const compCard = snap.cards.find(c => c.id === snap.comparingCardId);
      if (compCard) {
        DOM.varCond.textContent = `${compCard.value} > ${currentKeyCard.value} (${compCard.value > currentKeyCard.value})`;
      } else {
        DOM.varCond.textContent = '-';
      }
    } else {
      DOM.varCond.textContent = '-';
    }

    // 8. Update Telemetry Counters
    DOM.counterComparisons.textContent = snap.comparisons;
    DOM.counterShifts.textContent = snap.shifts;
    const totalPasses = Math.max(1, n - 1);
    DOM.counterPasses.textContent = `${Math.min(snap.passNumber, totalPasses)} / ${totalPasses}`;
    DOM.counterSteps.textContent = `${snap.stepIndex} / ${state.snapshots.length - 1}`;

    // 9. Update Scrubber
    DOM.stepScrubber.value = snap.stepIndex;
    DOM.scrubberCounter.textContent = `${snap.stepIndex} / ${state.snapshots.length - 1}`;

    // 10. Update Progress Bar
    const percent = Math.min(100, Math.round(((snap.sortedUpTo + 1) / n) * 100));
    DOM.progressBarFill.style.width = `${percent}%`;
    DOM.progressPercent.textContent = `${percent}% Sorted`;

    if (snap.actionType === 'COMPLETE') {
      DOM.passIndicator.innerHTML = `Pass: <strong style="color: #10b981;">Complete!</strong>`;
    } else if (snap.passNumber > 0) {
      DOM.passIndicator.innerHTML = `Pass: <strong>${snap.passNumber} of ${totalPasses}</strong>`;
    } else {
      DOM.passIndicator.innerHTML = `Pass: <strong>Ready</strong>`;
    }

    // 11. Update Narration & Mascot
    DOM.narrationTag.textContent = `STEP ${snap.stepIndex} • ${snap.actionType.replace('_', ' ')}`;
    DOM.narrationText.innerHTML = snap.narration;
    mascot.say(getMascotSpeech(snap));
    mascot.setExpression(snap.mascotMood);

    // 12. Audio & Particle FX
    triggerStepSideEffects(snap);

    // 13. Comparison Chart
    drawComparisonChart(snap.comparisons, n);
  }

  function getMascotSpeech(snap) {
    switch (snap.actionType) {
      case 'INIT':
        return "Pick a preset or drag cards to reorder, then press Play!";
      case 'LIFT_KEY':
        return `Lifted key card! Scanning left partition...`;
      case 'COMPARE':
        return `Comparing values carefully...`;
      case 'SHIFT':
        return `Card is greater, shifting right into the gap!`;
      case 'REACHED_START':
        return `Reached slot 0! Insertion spot found.`;
      case 'POSITION_FOUND':
        return `Found the perfect gap!`;
      case 'INSERT':
        return `Dropped into place! Subarray sorted!`;
      case 'COMPLETE':
        return `🎉 All cards perfectly sorted in ascending order!`;
      default:
        return "Sorting along smoothly!";
    }
  }

  function triggerStepSideEffects(snap) {
    if (snap.actionType === 'COMPARE') {
      audioSynth.playCompare();
    } else if (snap.actionType === 'SHIFT') {
      audioSynth.playShift();
    } else if (snap.actionType === 'INSERT') {
      audioSynth.playInsert();

      setTimeout(() => {
        const targetCard = snap.cards.find(c => c.id === snap.insertedCardId);
        if (targetCard) {
          const { stepWidth, cardWidth, cardHeight } = getLayoutMetrics();
          const arenaRect = DOM.cardTrack.getBoundingClientRect();
          const x = arenaRect.left + (targetCard.slotIndex * stepWidth) + cardWidth / 2;
          const y = arenaRect.top + 75 + cardHeight / 2;
          particleEngine.burst(x, y, '#fbbf24');
        }
      }, 60);
    } else if (snap.actionType === 'COMPLETE') {
      audioSynth.playFanfare();
      confettiEngine.fire();
      showToast('🎉 Array successfully sorted!', 'success', '🏆');
    }
  }

  function highlightPseudocodeLine(lineNum) {
    const lines = DOM.pseudocodePre.querySelectorAll('.code-line');
    lines.forEach(line => {
      const num = parseInt(line.dataset.line, 10);
      line.classList.toggle('active', num === lineNum);
    });
  }

  // --------------------------------------------------------------------------
  // 10. PLAYBACK CONTROLLER
  // --------------------------------------------------------------------------
  function play() {
    if (state.isPlaying) return;

    if (state.currentStep >= state.snapshots.length - 1) {
      state.currentStep = 0;
    }

    audioSynth.init();
    state.isPlaying = true;
    DOM.btnPlayPause.classList.remove('btn-primary');
    DOM.btnPlayPause.classList.add('btn-accent');
    DOM.playPauseIcon.textContent = '⏸';
    DOM.playPauseText.textContent = 'Pause';
    DOM.dragHint.style.display = 'none';

    tick();
  }

  function pause() {
    if (!state.isPlaying) return;
    state.isPlaying = false;
    clearTimeout(state.timerId);
    DOM.btnPlayPause.classList.add('btn-primary');
    DOM.btnPlayPause.classList.remove('btn-accent');
    DOM.playPauseIcon.textContent = '▶';
    DOM.playPauseText.textContent = 'Play';

    if (state.currentStep === 0) {
      DOM.dragHint.style.display = 'block';
    }
  }

  function tick() {
    if (!state.isPlaying) return;

    if (state.currentStep < state.snapshots.length - 1) {
      state.currentStep++;
      renderSnapshot(state.snapshots[state.currentStep]);

      const delay = Math.max(120, state.baseDelay / state.playbackSpeed);
      state.timerId = setTimeout(() => {
        tick();
      }, delay);
    } else {
      pause();
    }
  }

  function stepForward() {
    pause();
    if (state.currentStep < state.snapshots.length - 1) {
      state.currentStep++;
      renderSnapshot(state.snapshots[state.currentStep]);
    } else {
      showToast('Already at the final sorted state', 'info');
    }
  }

  function stepBackward() {
    pause();
    if (state.currentStep > 0) {
      state.currentStep--;
      renderSnapshot(state.snapshots[state.currentStep]);
    } else {
      showToast('Already at the initial step', 'info');
    }
  }

  function reset() {
    pause();
    state.currentStep = 0;
    renderSnapshot(state.snapshots[0]);
    DOM.dragHint.style.display = 'block';
    showToast('Reset to initial array', 'info', '↺');
  }

  function scrubToStep(stepIndex) {
    pause();
    state.currentStep = Math.max(0, Math.min(stepIndex, state.snapshots.length - 1));
    renderSnapshot(state.snapshots[state.currentStep]);
  }

  // --------------------------------------------------------------------------
  // 11. DRAG AND DROP REORDERING (At Initial Step)
  // --------------------------------------------------------------------------
  let draggedCardId = null;

  function setupCardDragAndDrop(cardEl, cardId) {
    cardEl.addEventListener('dragstart', (e) => {
      draggedCardId = cardId;
      cardEl.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', cardId);
    });

    cardEl.addEventListener('dragend', () => {
      cardEl.classList.remove('dragging');
      document.querySelectorAll('.sort-card, .sort-bar').forEach(el => el.classList.remove('drag-over'));
    });

    cardEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      cardEl.classList.add('drag-over');
    });

    cardEl.addEventListener('dragleave', () => {
      cardEl.classList.remove('drag-over');
    });

    cardEl.addEventListener('drop', (e) => {
      e.preventDefault();
      cardEl.classList.remove('drag-over');
      const targetCardId = cardId;

      if (draggedCardId !== null && draggedCardId !== targetCardId) {
        const fromIdx = state.rawArray.findIndex(c => c.id === draggedCardId);
        const toIdx = state.rawArray.findIndex(c => c.id === targetCardId);

        if (fromIdx !== -1 && toIdx !== -1) {
          const moved = state.rawArray.splice(fromIdx, 1)[0];
          state.rawArray.splice(toIdx, 0, moved);

          state.snapshots = generateSnapshots(state.rawArray);
          state.currentStep = 0;
          DOM.stepScrubber.max = state.snapshots.length - 1;

          DOM.cardTrack.innerHTML = '';
          gapPlaceholderEl = null;

          renderSnapshot(state.snapshots[0]);
          audioSynth.playShift();
          showToast(`Reordered card to position [${toIdx}]`, 'info', '✋');
        }
      }
      draggedCardId = null;
    });
  }

  // --------------------------------------------------------------------------
  // 12. PRESETS & ARRAY INITIALIZATION
  // --------------------------------------------------------------------------
  function createCard(value, id) {
    const suit = SUITS[id % SUITS.length];
    return { id, value, suit };
  }

  function generatePresetArray(type, size) {
    state.activePreset = type;
    updatePresetChipsHighlight(type);

    let values = [];
    if (type === 'random') {
      for (let i = 0; i < size; i++) {
        values.push(Math.floor(Math.random() * 45) + 5);
      }
    } else if (type === 'nearly-sorted') {
      let base = 6;
      for (let i = 0; i < size; i++) {
        base += Math.floor(Math.random() * 5) + 3;
        values.push(base);
      }
      if (values.length >= 4) {
        const mid = Math.floor(values.length / 2);
        const temp = values[mid];
        values[mid] = values[mid + 1];
        values[mid + 1] = temp;
      }
    } else if (type === 'reversed') {
      let base = 50;
      for (let i = 0; i < size; i++) {
        values.push(base);
        base -= Math.floor(Math.random() * 4) + 3;
      }
    } else if (type === 'sorted') {
      let base = 5;
      for (let i = 0; i < size; i++) {
        base += Math.floor(Math.random() * 5) + 2;
        values.push(base);
      }
    } else if (type === 'duplicates') {
      const pool = [8, 14, 22, 35];
      for (let i = 0; i < size; i++) {
        values.push(pool[i % pool.length]);
      }
    }

    setWorkingArray(values);
  }

  function setWorkingArray(values) {
    pause();
    state.rawArray = values.map((val, idx) => createCard(val, idx + 1));
    state.snapshots = generateSnapshots(state.rawArray);
    state.currentStep = 0;

    DOM.stepScrubber.max = state.snapshots.length - 1;
    DOM.stepScrubber.value = 0;

    DOM.cardTrack.innerHTML = '';
    gapPlaceholderEl = null;

    renderSnapshot(state.snapshots[0]);
    DOM.dragHint.style.display = 'block';
  }

  function updatePresetChipsHighlight(presetType) {
    DOM.chipBest.classList.remove('highlight-best');
    DOM.chipAvg.classList.remove('highlight-avg');
    DOM.chipWorst.classList.remove('highlight-worst');

    if (presetType === 'sorted' || presetType === 'nearly-sorted') {
      DOM.chipBest.classList.add('highlight-best');
    } else if (presetType === 'reversed') {
      DOM.chipWorst.classList.add('highlight-worst');
    } else {
      DOM.chipAvg.classList.add('highlight-avg');
    }
  }

  // --------------------------------------------------------------------------
  // 13. COMPARISON CHART ENGINE
  // --------------------------------------------------------------------------
  function drawComparisonChart(actualComparisons = 0, currentN = 8) {
    const canvas = DOM.complexityChart;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const padding = { top: 20, right: 30, bottom: 25, left: 45 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxN = 16;
    const maxComps = (maxN * (maxN - 1)) / 2; // 120

    const mapX = (n) => padding.left + ((n - 2) / (maxN - 2)) * chartW;
    const mapY = (c) => padding.top + chartH - (c / maxComps) * chartH;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.font = '10px Fira Code';
    ctx.fillStyle = '#64748b';

    for (let c = 0; c <= maxComps; c += 30) {
      const y = mapY(c);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartW, y);
      ctx.stroke();
      ctx.fillText(c, padding.left - 24, y + 3);
    }

    function drawCurve(calcFn, color, isDashed = false) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      if (isDashed) ctx.setLineDash([4, 4]);
      else ctx.setLineDash([]);

      ctx.beginPath();
      for (let n = 2; n <= maxN; n++) {
        const x = mapX(n);
        const y = mapY(calcFn(n));
        if (n === 2) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    drawCurve(n => n - 1, '#10b981');
    drawCurve(n => (n * (n - 1)) / 4, '#38bdf8');
    drawCurve(n => (n * (n - 1)) / 2, '#f43f5e');

    if (currentN >= 2) {
      const curX = mapX(currentN);
      const curY = mapY(Math.min(actualComparisons, maxComps));

      ctx.beginPath();
      ctx.arc(curX, curY, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(251, 191, 36, 0.35)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(curX, curY, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#fbbf24';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 10px Fira Code';
      ctx.fillText(`Run: ${actualComparisons} comps`, curX + 10, curY - 6);
    }
  }

  // --------------------------------------------------------------------------
  // 14. QUIZ MODE ENGINE
  // --------------------------------------------------------------------------
  function setupQuizMode() {
    state.appMode = 'quiz';
    pause();

    DOM.interactiveBanner.classList.remove('hidden');
    DOM.bannerBadge.textContent = 'QUIZ ACTIVE';
    DOM.bannerBadge.style.background = '#ec4899';
    DOM.bannerStats.style.display = 'flex';
    DOM.bannerActionBtn.textContent = 'Next Question';
    DOM.dropZonesLane.style.display = 'flex';

    generateQuizQuestion();
  }

  function generateQuizQuestion() {
    state.quiz.answered = false;
    const n = state.rawArray.length;
    const targetPass = Math.floor(Math.random() * (n - 1)) + 1;

    const snap = state.snapshots.find(s => s.passNumber === targetPass && s.actionType === 'LIFT_KEY');
    if (!snap) {
      showToast('Generating new question...', 'info');
      return;
    }

    state.currentStep = snap.stepIndex;
    renderSnapshot(snap);

    const keyCard = snap.cards.find(c => c.id === snap.keyCardId);
    const keyVal = keyCard ? keyCard.value : 10;

    let correctSlot = 0;
    for (let k = targetPass - 1; k >= 0; k--) {
      const cardAtK = snap.cards.find(c => c.slotIndex === k);
      if (cardAtK && cardAtK.value <= keyVal) {
        correctSlot = k + 1;
        break;
      }
    }

    state.quiz.correctSlot = correctSlot;
    state.quiz.targetKey = keyVal;

    DOM.bannerText.innerHTML = `Where should key card <strong>${keyVal}</strong> be inserted in the sorted sublist [0..${targetPass - 1}]? <em>Click on the target slot!</em>`;

    const { stepWidth } = getLayoutMetrics();
    DOM.dropZonesLane.innerHTML = '';

    for (let s = 0; s <= targetPass; s++) {
      const slotBtn = document.createElement('div');
      slotBtn.className = 'drop-target-slot';
      slotBtn.textContent = `Slot [${s}]`;
      slotBtn.style.transform = `translate3d(${s * stepWidth}px, 0, 0)`;
      slotBtn.dataset.slot = s;

      slotBtn.addEventListener('click', () => handleQuizAnswer(s));
      DOM.dropZonesLane.appendChild(slotBtn);
    }
  }

  function handleQuizAnswer(selectedSlot) {
    if (state.quiz.answered) return;
    state.quiz.answered = true;

    const slots = DOM.dropZonesLane.querySelectorAll('.drop-target-slot');
    const isCorrect = selectedSlot === state.quiz.correctSlot;

    slots.forEach(s => {
      const idx = parseInt(s.dataset.slot, 10);
      if (idx === state.quiz.correctSlot) {
        s.classList.add('correct');
      } else if (idx === selectedSlot && !isCorrect) {
        s.classList.add('incorrect');
      }
    });

    if (isCorrect) {
      state.quiz.score += 100;
      state.quiz.streak++;
      audioSynth.playSuccess();
      mascot.setExpression('happy');
      mascot.say("Spot on! That's the exact insertion position!");
      showToast(`+100 Points! Correct! Slot [${selectedSlot}]`, 'success', '🎯');
    } else {
      state.quiz.streak = 0;
      audioSynth.playError();
      mascot.setExpression('thinking');
      mascot.say(`Oops! It belongs at slot [${state.quiz.correctSlot}].`);
      showToast(`Incorrect! The correct position is Slot [${state.quiz.correctSlot}]`, 'error', '❌');
    }

    DOM.quizScore.textContent = state.quiz.score;
    DOM.quizStreak.textContent = `${state.quiz.streak} 🔥`;
  }

  // --------------------------------------------------------------------------
  // 15. CHALLENGE MODE ENGINE ("User Plays Insertion Sort!")
  // --------------------------------------------------------------------------
  function setupChallengeMode() {
    state.appMode = 'challenge';
    pause();

    DOM.interactiveBanner.classList.remove('hidden');
    DOM.bannerBadge.textContent = 'CHALLENGE MODE';
    DOM.bannerBadge.style.background = '#8b5cf6';
    DOM.bannerStats.style.display = 'none';
    DOM.dropZonesLane.style.display = 'flex';

    state.challenge.currentPass = 1;
    state.challenge.totalPasses = state.rawArray.length - 1;
    state.challenge.workingValues = state.rawArray.map(c => c.value);

    renderChallengePass();
  }

  function renderChallengePass() {
    const i = state.challenge.currentPass;
    const n = state.challenge.workingValues.length;

    if (i >= n) {
      audioSynth.playFanfare();
      confettiEngine.fire();
      DOM.bannerText.innerHTML = `🏆 <strong>Master of Insertion Sort!</strong> You successfully completed all passes!`;
      DOM.dropZonesLane.innerHTML = '';
      mascot.setExpression('celebrating');
      mascot.say("You mastered Insertion Sort like a pro!");
      showToast('Challenge Passed with Flying Colors!', 'success', '🏆');
      return;
    }

    const key = state.challenge.workingValues[i];
    DOM.bannerText.innerHTML = `<strong>Pass ${i}:</strong> Key is <strong>${key}</strong>. Click the correct slot [0..${i}] where it belongs!`;

    let correctSlot = 0;
    for (let k = i - 1; k >= 0; k--) {
      if (state.challenge.workingValues[k] <= key) {
        correctSlot = k + 1;
        break;
      }
    }
    state.challenge.correctSlot = correctSlot;

    const { stepWidth } = getLayoutMetrics();
    DOM.dropZonesLane.innerHTML = '';

    for (let s = 0; s <= i; s++) {
      const slotBtn = document.createElement('div');
      slotBtn.className = 'drop-target-slot';
      slotBtn.textContent = `Insert at [${s}]`;
      slotBtn.style.transform = `translate3d(${s * stepWidth}px, 0, 0)`;
      slotBtn.dataset.slot = s;

      slotBtn.addEventListener('click', () => handleChallengeMove(s));
      DOM.dropZonesLane.appendChild(slotBtn);
    }
  }

  function handleChallengeMove(chosenSlot) {
    const i = state.challenge.currentPass;
    const correctSlot = state.challenge.correctSlot;

    if (chosenSlot === correctSlot) {
      audioSynth.playSuccess();
      showToast(`Pass ${i} complete! Shifted elements correctly.`, 'success', '✓');

      const keyVal = state.challenge.workingValues[i];
      for (let k = i; k > correctSlot; k--) {
        state.challenge.workingValues[k] = state.challenge.workingValues[k - 1];
      }
      state.challenge.workingValues[correctSlot] = keyVal;

      state.challenge.currentPass++;
      setWorkingArray(state.challenge.workingValues);
      renderChallengePass();
    } else {
      audioSynth.playError();
      showToast(`Incorrect! Look at elements in [0..${i - 1}] that are greater than key.`, 'error', '❌');
    }
  }

  function exitInteractiveModes() {
    state.appMode = 'visualizer';
    DOM.interactiveBanner.classList.add('hidden');
    DOM.dropZonesLane.style.display = 'none';
    DOM.modeBtnViz.classList.add('active');
    DOM.modeBtnQuiz.classList.remove('active');
    DOM.modeBtnChallenge.classList.remove('active');
    renderSnapshot(state.snapshots[state.currentStep]);
  }

  // --------------------------------------------------------------------------
  // 16. CODE TABS
  // --------------------------------------------------------------------------
  function renderCodeSnippet(lang) {
    state.activeLang = lang;
    const code = CODE_SNIPPETS[lang] || CODE_SNIPPETS.python;
    DOM.codeSnippetPre.textContent = code;

    DOM.codeTabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  }

  // --------------------------------------------------------------------------
  // 17. EVENT LISTENERS
  // --------------------------------------------------------------------------
  function initEventListeners() {
    DOM.btnPlayPause.addEventListener('click', () => {
      audioSynth.init();
      if (state.isPlaying) pause();
      else play();
    });

    DOM.btnStepForward.addEventListener('click', () => {
      audioSynth.init();
      stepForward();
    });

    DOM.btnStepBack.addEventListener('click', () => {
      audioSynth.init();
      stepBackward();
    });

    DOM.btnReset.addEventListener('click', () => {
      reset();
    });

    DOM.stepScrubber.addEventListener('input', (e) => {
      scrubToStep(parseInt(e.target.value, 10));
    });

    DOM.speedSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      state.playbackSpeed = val;
      DOM.speedDisplay.textContent = `${val.toFixed(1)}x`;
    });

    DOM.viewCardsBtn.addEventListener('click', () => {
      state.viewMode = 'cards';
      DOM.viewCardsBtn.classList.add('active');
      DOM.viewBarsBtn.classList.remove('active');
      DOM.cardTrack.innerHTML = '';
      gapPlaceholderEl = null;
      renderSnapshot(state.snapshots[state.currentStep]);
    });

    DOM.viewBarsBtn.addEventListener('click', () => {
      state.viewMode = 'bars';
      DOM.viewBarsBtn.classList.add('active');
      DOM.viewCardsBtn.classList.remove('active');
      DOM.cardTrack.innerHTML = '';
      gapPlaceholderEl = null;
      renderSnapshot(state.snapshots[state.currentStep]);
    });

    DOM.modeBtnViz.addEventListener('click', () => {
      exitInteractiveModes();
    });

    DOM.modeBtnQuiz.addEventListener('click', () => {
      DOM.modeBtnViz.classList.remove('active');
      DOM.modeBtnChallenge.classList.remove('active');
      DOM.modeBtnQuiz.classList.add('active');
      setupQuizMode();
    });

    DOM.modeBtnChallenge.addEventListener('click', () => {
      DOM.modeBtnViz.classList.remove('active');
      DOM.modeBtnQuiz.classList.remove('active');
      DOM.modeBtnChallenge.classList.add('active');
      setupChallengeMode();
    });

    DOM.bannerActionBtn.addEventListener('click', () => {
      if (state.appMode === 'quiz') {
        generateQuizQuestion();
      }
    });

    DOM.sizeSlider.addEventListener('input', (e) => {
      const size = parseInt(e.target.value, 10);
      DOM.sizeDisplay.textContent = size;
      generatePresetArray(state.activePreset, size);
    });

    DOM.presetPills.forEach(pill => {
      pill.addEventListener('click', () => {
        DOM.presetPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const preset = pill.dataset.preset;
        const size = parseInt(DOM.sizeSlider.value, 10);
        generatePresetArray(preset, size);
        showToast(`Loaded ${pill.textContent} preset`, 'info');
      });
    });

    DOM.btnRandomize.addEventListener('click', () => {
      const size = parseInt(DOM.sizeSlider.value, 10);
      generatePresetArray('random', size);
      showToast('Deck shuffled!', 'info', '⚡');
    });

    DOM.btnApplyCustom.addEventListener('click', applyCustomArray);
    DOM.customInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') applyCustomArray();
    });

    function applyCustomArray() {
      const raw = DOM.customInput.value.trim();
      if (!raw) {
        showToast('Please type numbers separated by commas', 'error');
        return;
      }

      const parsed = raw.split(/[\s,]+/).map(v => parseInt(v, 10)).filter(v => !isNaN(v) && v > 0 && v < 100);

      if (parsed.length < 2) {
        showToast('Please enter at least 2 numbers (between 1 and 99)', 'error');
        return;
      }

      if (parsed.length > 15) {
        showToast('Array size capped at 15 for optimal display', 'info');
        parsed.length = 15;
      }

      DOM.sizeSlider.value = parsed.length;
      DOM.sizeDisplay.textContent = parsed.length;
      DOM.presetPills.forEach(p => p.classList.remove('active'));
      setWorkingArray(parsed);
      showToast(`Loaded custom array of ${parsed.length} numbers`, 'success');
    }

    DOM.codeTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        renderCodeSnippet(btn.dataset.lang);
      });
    });

    DOM.btnCopyCode.addEventListener('click', () => {
      const code = DOM.codeSnippetPre.textContent;
      navigator.clipboard.writeText(code).then(() => {
        showToast(`${state.activeLang.toUpperCase()} code copied to clipboard!`, 'success', '📋');
      }).catch(() => {
        showToast('Clipboard access denied', 'error');
      });
    });

    DOM.vivaToggle.addEventListener('click', () => {
      const expanded = DOM.vivaToggle.getAttribute('aria-expanded') === 'true';
      DOM.vivaToggle.setAttribute('aria-expanded', !expanded);
      DOM.vivaContent.classList.toggle('collapsed', expanded);
    });

    DOM.themeToggleBtn.addEventListener('click', toggleTheme);

    DOM.soundToggleBtn.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      DOM.soundIcon.textContent = state.soundEnabled ? '🔊' : '🔇';
      showToast(`Sound ${state.soundEnabled ? 'Enabled' : 'Muted'}`, 'info');
    });

    DOM.shortcutsBtn.addEventListener('click', () => {
      DOM.shortcutsModal.classList.remove('hidden');
    });
    DOM.btnCloseModal.addEventListener('click', () => {
      DOM.shortcutsModal.classList.add('hidden');
    });
    DOM.btnModalOk.addEventListener('click', () => {
      DOM.shortcutsModal.classList.add('hidden');
    });
    DOM.shortcutsModal.addEventListener('click', (e) => {
      if (e.target === DOM.shortcutsModal) {
        DOM.shortcutsModal.classList.add('hidden');
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.target === DOM.customInput) return;

      if (e.code === 'Space') {
        e.preventDefault();
        DOM.btnPlayPause.click();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        stepForward();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        stepBackward();
      } else if (e.key === 'r' || e.key === 'R') {
        reset();
      } else if (e.key === 'm' || e.key === 'M') {
        DOM.soundToggleBtn.click();
      } else if (e.key === 't' || e.key === 'T') {
        toggleTheme();
      } else if (e.key === 'c' || e.key === 'C') {
        if (state.viewMode === 'cards') DOM.viewBarsBtn.click();
        else DOM.viewCardsBtn.click();
      } else if (e.key === '?') {
        DOM.shortcutsModal.classList.toggle('hidden');
      } else if (e.key === 'Escape') {
        DOM.shortcutsModal.classList.add('hidden');
      }
    });

    window.addEventListener('resize', () => {
      renderSnapshot(state.snapshots[state.currentStep]);
    });

    const mascotEl = document.getElementById('mascot');
    if (mascotEl) {
      mascotEl.addEventListener('click', () => {
        audioSynth.playSuccess();
        mascot.setExpression('happy');
        const quotes = [
          "Did you know? Insertion Sort is O(n) for already sorted arrays!",
          "Card sorting in real life is almost always Insertion Sort!",
          "Timsort in Python uses Insertion Sort for chunks <= 64!",
          "Stability matters: identical cards never swap places!"
        ];
        mascot.say(quotes[Math.floor(Math.random() * quotes.length)]);
      });
    }
  }

  function toggleTheme() {
    const current = DOM.html.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    DOM.html.setAttribute('data-theme', next);
    DOM.themeIcon.textContent = next === 'dark' ? '🌙' : '☀️';
    showToast(`Switched to ${next.toUpperCase()} theme`, 'info');
    drawComparisonChart(state.snapshots[state.currentStep]?.comparisons || 0, state.rawArray.length);
  }

  // --------------------------------------------------------------------------
  // 18. INITIALIZATION LIFECYCLE
  // --------------------------------------------------------------------------
  function init() {
    particleEngine.init();
    confettiEngine.init();
    initEventListeners();
    renderCodeSnippet('python');

    generatePresetArray('random', 8);
    drawComparisonChart(0, 8);

    setTimeout(() => {
      showToast('Welcome to Insertion Sort Lab! Click Play to begin.', 'info', '🃏');
    }, 600);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
