# 🃏 Insertion Sort Visualizer — Interactive Educational Lab

A modern, highly interactive, educational web app visualizing the **Insertion Sort** algorithm through the metaphor of **"Sorting a hand of playing cards"**. Built with vanilla HTML5, CSS3, and JavaScript, featuring 60fps CSS hardware-accelerated animations, a built-in Web Audio synthesizer, live complexity metrics, interactive Quiz & Challenge modes, and multi-language implementation tabs.

---

## 🚀 Live Demo & Quick Start

No installations, build steps, or local servers are required!
1. Clone or download this repository.
2. Double-click `index.html` to open it in your browser (Chrome, Edge, Firefox, Safari).

---

## ✨ Key Features

- **Cards & Bars Modes**:
  - **Playing Cards Mode**: Hand of styled playing cards (♠ ♥ ♦ ♣) with corner values, central watermarks, soft elevation shadows, and 3D hover tilt.
  - **Classic Neon Bars Mode**: Proportional equalizer bars with heights mapped to values and glowing gradient fills.
- **60fps Hardware-Accelerated Animations**:
  - FLIP technique using `translate3d(x, y, 0)` and `scale()`.
  - The **key card** visibly lifts out of the array into the air (`translateY(-68px)` + gold aura), slides horizontally across the track, and drops into its target gap with an elastic bounce.
  - The vacated slot is indicated with an animated dashed gap marker (`⇣ Gap [slot]`).
  - Larger elements slide right into the gap one by one.
  - 24-particle sparkle burst on each card insertion.
  - Celebratory wave animation and 120-piece confetti physics explosion upon completion.
- **Pure Web Audio Synthesizer**:
  - Zero external `.mp3` or `.wav` files.
  - Custom procedural synthesis via the Web Audio API (`AudioContext`, `OscillatorNode`, `GainNode`):
    - Comparison tick (560 Hz sine).
    - Shift slide whoosh (380 Hz triangle).
    - Insertion marimba drop (660 Hz + 880 Hz harmonic).
    - Victory fanfare arpeggio ($C_5 \to E_5 \to G_5 \to C_6$).
  - Sound toggle with persistent icon state and keyboard shortcut (`M`).
- **Interactive Modes**:
  - **Visualizer Mode**: Play, pause, step forward, step backward, timeline scrubber, and speed slider ($0.25\times$ to $3.0\times$).
  - **Quiz Mode**: Prompts the user with *"Where will key card X be inserted in the sorted sublist?"* User clicks on target slots to earn points and maintain a streak.
  - **Challenge Mode**: The user takes the role of the CPU, manually placing each pass's key card with immediate validation and educational feedback.
- **Array Inputs & Presets**:
  - Drag-and-drop reordering of cards before sorting.
  - Custom comma-separated numbers input.
  - Array size slider (5 to 15 elements).
  - Presets: `Random`, `Nearly Sorted (Best Case O(n))`, `Reverse (Worst Case O(n²))`, `Already Sorted`, and `With Duplicates (Stability Demo)`.
- **Educational Panels**:
  - **Live Pseudocode**: Line-by-line sync highlighting the active instruction.
  - **Variables Inspector**: Live state for $i$, $j$, $\text{key}$, and condition $A[j] > \text{key}$.
  - **Multi-Language Tabs**: Complete implementations in **Python, JavaScript, Java, and C** with syntax styling and 1-click clipboard copy.
  - **Asymptotic Complexity Chips**: Best $O(n)$, Average $O(n^2)$, Worst $O(n^2)$, Space $O(1)$, Stable: Yes, In-Place: Yes, dynamically highlighting based on the active preset.
  - **Live Canvas Comparison Chart**: Empirical comparisons plotted in real-time against theoretical best ($n-1$), average ($n(n-1)/4$), and worst ($n(n-1)/2$) curves.
  - **Mascot ("Sorty")**: Reactive robot with eye expressions and contextual speech.
  - **Viva Voce Cheat Sheet**: Built-in accordion answering common technical and interview questions (Timsort/Introsort small-array optimization, adaptive runtime, stability proofs).

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
| :---: | :--- |
| <kbd>Space</kbd> | Play / Pause animation |
| <kbd>→</kbd> | Step forward one micro-step |
| <kbd>←</kbd> | Step backward one micro-step |
| <kbd>R</kbd> | Reset array to initial state |
| <kbd>M</kbd> | Toggle Web Audio sound on / off |
| <kbd>T</kbd> | Toggle Dark / Light theme |
| <kbd>C</kbd> | Toggle Cards vs Bars mode |
| <kbd>?</kbd> | Show Keyboard Shortcuts modal |
| <kbd>Esc</kbd> | Close open modals |

---

## 📁 Repository Structure

```text
├── index.html     # Semantic markup & accessible UI layout
├── style.css      # Design system, glassmorphism, card anatomy & 60fps animations
├── script.js      # Snapshot generator, FLIP engine, Web Audio synth & quiz logic
└── README.md      # Documentation, features & viva guide
```

---

## 🎓 Algorithm Overview

Insertion Sort builds the final sorted array one item at a time. It is:
- **Adaptive**: $O(n)$ time when input is already or nearly sorted.
- **Stable**: Does not change the relative order of elements with equal keys.
- **In-Place**: Requires only $O(1)$ auxiliary memory.
- **Practical for Small $n$**: Powers the base case ($n \le 16-64$) of modern production algorithms like Python's **Timsort** and C++'s **Introsort (`std::sort`)**.

---

## 📄 License

MIT License. Open source and free for educational use.
