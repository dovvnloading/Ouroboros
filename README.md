# Ouroboros
### The Recursive, Self-Constructing Interface

[![React 19](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Powered by Gemini](https://img.shields.io/badge/AI-Gemini%20Pro-8E75B2?logo=google-gemini)](https://deepmind.google/technologies/gemini/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Ouroboros** is a runtime environment that allows an AI Agent to design, code, and deploy React applications *inside itself* in real-time. It bypasses traditional CI/CD pipelines by utilizing in-browser transpilation (`@babel/standalone`), creating an infinite, zoomable canvas where tools are built on-demand via natural language or semantic tokens.

Designed with a "Neurodivergent-First" philosophy, it includes a dedicated Accessibility Engine (Voice, Sensory Regulation, Screen Reader Optimization) embedded at the kernel level.

---

##  Media Gallery

<div align="center">
<img width="800" alt="1" src="https://github.com/user-attachments/assets/d83f55a2-670c-4a1e-89f3-9cb915e4dcd4" />
<br/>
<details>
<summary><b>View More Screenshots</b></summary>
<br/>
<img width="800" alt="2" src="https://github.com/user-attachments/assets/5b1da918-e03c-4e38-bc61-457501131e72" />
<img width="800" alt="3" src="https://github.com/user-attachments/assets/36c61931-eaa9-4fb8-8ff2-0f4bd506ca50" />
<img width="800" alt="4" src="https://github.com/user-attachments/assets/1d017d2f-d924-442e-a3a6-fe4139fbdf9c" />
<img width="800" alt="5" src="https://github.com/user-attachments/assets/5d404317-32fc-4405-9be0-e4821c78f24c" />
<img width="800" alt="6" src="https://github.com/user-attachments/assets/5999d8c3-a6e6-4178-8421-e9649bd6855f" />
</details>
</div>

---

##  Core Architecture

Ouroboros is not a chatbot; it is a **Generative Runtime**. It distributes cognition across three specialized agents to ensure code quality and execution safety.

### 1. The Multi-Agent Pipeline
The system uses a Chain-of-Thought (CoT) handoff process:
*   **The Orchestrator:** Manages the dashboard state. It decides *what* to change (Create, Update, Delete) without worrying about *how*. It prevents the AI from hallucinating deletions of existing work.
*   **The Architect:** Receives the task and generates a **Technical Blueprint**. It selects UI Archetypes (Dashboard, Chat, Kanban, Tool), enforces Design Systems (Tailwind), and handles Localization (English/Spanish).
*   **The Engineer:** The final coder. It receives the Blueprint and uses **Just-In-Time (JIT) Template Injection**—injecting proven skeleton code into the prompt context to ensure the resulting TSX has perfect imports and structure.

### 2. The Runtime Engine
Code is executed safely in the browser without `eval()`.
*   **Transpilation:** Raw TSX strings are compiled to CommonJS via Babel.
*   **Scoped Execution:** A custom `require()` function injects a whitelisted set of dependencies, preventing malicious code from accessing the wider DOM or window object.
*   **Dependencies Available to Widgets:**
    *   `react`, `lucide-react`, `recharts`, `@dnd-kit/core`
    *   `ouroboros` (The internal AI SDK)

### 3. Neuro-Inclusive Interaction
*   **Aura Mode:** A non-verbal synthesis engine. Users select "Tokens" (e.g., *Neon Vibe* + *Music Subject* + *Sort Action*) to prompt the engineer without writing text.
*   **Voice Control Layer:** A computer-vision-style overlay that tags every interactive DOM element with a number. Users can say *"Click 4"* or *"Type 'Hello' in 2"* for complete hands-free control.
*   **Emergency Mode:** A panic button (`Ctrl+Shift+E`) that immediately simplifies the UI, plays brown noise (auditory masking), and initiates a box-breathing visualizer for sensory regulation.

---

##  The Ouroboros SDK

Generated widgets are not isolated; they can access powerful AI capabilities via the internal `ouroboros` package.

```typescript
import { useChat, useImageGen, useLiveAPI } from 'ouroboros';

export default function MySuperWidget() {
  // 1. Text & Reasoning (GPT-4 / Gemini / Claude)
  const { sendMessage, messages } = useChat({ mode: 'thinking' });

  // 2. Generative Images
  const { generate } = useImageGen();

  // 3. Real-time Voice (WebSocket / WebRTC)
  const { connect, isSpeaking } = useLiveAPI();
  
  // Widgets can build themselves recursively using these hooks.
}
```

---

##  Getting Started

### Prerequisites
*   Node.js 18+
*   A Google Gemini API Key (or OpenAI/Anthropic keys)

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-username/ouroboros.git
    cd ouroboros
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env.local` file in the root:
    ```env
    VITE_GEMINI_API_KEY=your_api_key_here
    ```

4.  **Ignition**
    ```bash
    npm run dev
    ```

---

## ⌨️ Command & Control

| Context | Shortcut | Action |
| :--- | :--- | :--- |
| **Global** | `Mod + K` | **Focus Agent Input** (The Command Bar) |
| **Global** | `Mod + Shift + E` | **Emergency Mode** (Sensory Reset) |
| **Global** | `Mod + Shift + T` | Toggle Light/Dark Theme |
| **View** | `Space + Drag` | Pan Infinite Canvas |
| **View** | `Shift + L` | Auto-Layout Widgets |
| **View** | `R` | Reset Zoom/Position |
| **Widget** | `Delete` | Remove Selected Widget |
| **Widget** | `Shift + Arrows` | Fast Nudge Position |

---

##  Presets & Suites

The system comes pre-loaded with "Suites"—collections of widgets generated by the AI for specific personas.

*   **Researcher Suite:** Web Search Tool + Kanban Board + Pomodoro Timer + Scratchpad.
*   **Analyst Suite:** Crypto Ticker (Recharts) + Expense Tracker (Pie Charts).
*   **Designer Suite:** AI Image Studio + Neural TTS Narrator.
*   **Arcade Suite:** Playable Snake Game + Audio Sequencer (Web Audio API).

---

##  License & Safety

**Prototype Status:** This project is a research prototype (v0.2.5). 
**Safety:** The runtime sandbox prevents unauthorized network calls, but generated code should always be treated as untrusted.

