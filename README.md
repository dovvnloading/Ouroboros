# Ouroboros

Ouroboros is a recursive, self-constructing interface environment. It functions as a runtime container where an autonomous multi-agent AI system designs, codes, and deploys React applications in real-time. By utilizing in-browser transpilation, the system allows the interface to modify its own capabilities permanently, bypassing traditional build pipelines.

## System Architecture

The core logic is distributed across a three-stage generative pipeline integrated with a custom React runtime.

### 1. Generative Pipeline
*   **Orchestrator:** Evaluates user intent against existing dashboard state. It plans atomic actions (Create, Update, Delete) to maintain or evolve the canvas.
*   **Architect:** Synthesizes a technical specification and selects a UI archetype (Dashboard, Kanban, Chat, Tool). It defines the visual hierarchy and ensures localization compliance.
*   **Engineer:** Consumes the blueprint and a Just-In-Time (JIT) template. It generates functional TSX code, incorporating logic, state management, and specialized hooks.

### 2. Runtime Environment
The system leverages `@babel/standalone` to transpile TSX into CommonJS at runtime. Code execution is isolated within a factory function that provides scoped access to:
*   **React 19**
*   **Lucide React** (Standard Iconography)
*   **Recharts** (Declarative Visualization)
*   **@dnd-kit** (Spatial Manipulation)
*   **Ouroboros SDK** (AI capability hooks)

### 3. Aura Mode
A specialized synthesis engine for non-verbal or sensory-seeking workflows. Users combine semantic tokens—Vibes, Actions, and Subjects—which the system translates into rigorous engineering prompts, enabling high-fidelity tool creation without textual input.

## Accessibility and Sensory Integration

*   **Voice Control:** Semantic tokenization of the DOM allows for hands-free navigation and input via numerical identifiers and keyword routing.
*   **Emergency Mode:** Provides immediate browser-level masking, brown noise generation, and box-breathing visualizers to assist in sensory regulation.
*   **A11y Engine:** Enforces WCAG 2.1 AA standards on generated components, including semantic HTML and ARIA focus management.

## AI Capability SDK

Generated widgets utilize the `ouroboros` module to access integrated AI features:

*   `useChat`: Multi-modal LLM interaction with search and mapping grounding.
*   `useImageGen`: Direct access to generative image models.
*   `useVision`: Real-time image analysis and transcription.
*   `useLiveAPI`: Low-latency WebSocket-based voice conversation (Gemini 2.5).

## Configuration

| Action | Shortcut |
| :--- | :--- |
| Agent Focus | `Mod + K` |
| Emergency Mode | `Mod + Shift + E` |
| Auto Layout | `Shift + L` |
| Reset View | `R` |

## Installation

```bash
npm install
npm run dev
```

## Media Gallery

<div align="center">
<img width="1920" height="1080" alt="6" src="https://github.com/user-attachments/assets/5999d8c3-a6e6-4178-8421-e9649bd6855f" />
<img width="1920" height="1080" alt="5" src="https://github.com/user-attachments/assets/5d404317-32fc-4405-9be0-e4821c78f24c" />
<img width="1920" height="1080" alt="4" src="https://github.com/user-attachments/assets/1d017d2f-d924-442e-a3a6-fe4139fbdf9c" />
<img width="1920" height="1080" alt="3" src="https://github.com/user-attachments/assets/36c61931-eaa9-4fb8-8ff2-0f4bd506ca50" />
<img width="1920" height="1080" alt="2" src="https://github.com/user-attachments/assets/5b1da918-e03c-4e38-bc61-457501131e72" />
<img width="1920" height="1080" alt="1" src="https://github.com/user-attachments/assets/d83f55a2-670c-4a1e-89f3-9cb915e4dcd4" />
</div>
