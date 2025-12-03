# 🚀 PracterViews: The Future of AI Interviewing

![PracterViews Banner](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge&color=00ff00) ![AI](https://img.shields.io/badge/AI-Gemini%202.0-blue?style=for-the-badge&logo=google&logoColor=white) ![Realtime](https://img.shields.io/badge/Latency-Ultra%20Low-red?style=for-the-badge) ![Experience](https://img.shields.io/badge/UX-Premium-purple?style=for-the-badge)

> **"The most advanced, resilient, and immersive interview simulation platform ever built."**

**PracterViews** isn't just an interview bot—it's a **hyper-realistic simulation engine**. By orchestrating state-of-the-art Multimodal LLMs, high-fidelity video avatars, and real-time audio processing, we bridge the gap between human interaction and artificial intelligence.

---

## 🌌 The Architecture of Intelligence

Behold the **Neural Workflow** that powers every millisecond of the PracterViews experience. This system handles audio, video, and logic in parallel to deliver zero-latency interactions.

```mermaid
graph TD
    %% Node Styles
    classDef user fill:#ff4b4b,stroke:#333,stroke-width:4px,color:white,font-weight:bold;
    classDef frontend fill:#2d3748,stroke:#63b3ed,stroke-width:2px,color:white;
    classDef backend fill:#2d3748,stroke:#9f7aea,stroke-width:2px,color:white;
    classDef ai fill:#2d3748,stroke:#f6e05e,stroke-width:2px,color:white;
    classDef cloud fill:#2d3748,stroke:#48bb78,stroke-width:2px,color:white;

    User([👤 CANDIDATE]) ::: user
    
    subgraph Cloud_Layer [☁️ GLOBAL REAL-TIME NETWORK]
        LK[⚡ LiveKit Edge Network] ::: cloud
    end

    subgraph Client_Layer [💻 IMMERSIVE FRONTEND]
        Dashboard[📱 Holo-Dashboard] ::: frontend
        Room[🎥 4K Interview Room] ::: frontend
        Visualizer[📊 Audio Visualizer] ::: frontend
    end
    
    subgraph Core_Layer [🧠 NEURAL BACKEND]
        Agent[🤖 Orchestrator Agent]
        TokenServer[🛡️ Sentinel Auth]
        
        subgraph AI_Cluster [✨ GENERATIVE ENGINES]
            Gemini[🧠 Gemini 2.0 Flash\nReasoning Core]
            
            subgraph Avatar_System [🎭 DYNAMIC AVATAR PIPELINE]
                Tavus[🗣️ TAVUS\nHigh-Fidelity]
                Bey[👻 BEYOND PRESENCE\nInstant Fallback]
            end
        end
    end

    %% Critical Paths
    User <==>|WebRTC Audio/Video| Room
    Room <==>|WebSocket Stream| LK
    LK <==>|Data Channels| Agent
    
    %% Logic Flows
    Agent <==>|Multimodal Context| Gemini
    Agent ==>|Render Stream| Tavus
    
    %% Fallback Logic
    Tavus -.->|❌ CRITICAL FAILURE| Bey
    Bey -.->|✅ AUTO-RECOVERY| Room
    
    %% Visualizer
    Room -.->|Audio Data| Visualizer

    %% Apply Styles
    class User user
    class Dashboard,Room,Visualizer frontend
    class Agent,TokenServer backend
    class Gemini,Tavus,Bey ai
    class LK cloud
```

---

## 💎 Features That Defy Expectations

### 🧠 **Hyper-Contextual Intelligence**
Powered by **Google Gemini 2.0 Flash**, the agent doesn't just ask questions—it *understands* nuance.
*   **Dynamic Role Adaptation**: Instantly shifts persona from a strict **DevOps Engineer** to an empathetic **HR Manager**.
*   **Hackathon Judge Mode**: A specialized module designed to critique pitches, analyze innovation, and stress-test technical viability.

### 🛡️ **Unbreakable "Immortal" Fallback System**
We engineered a system that **cannot fail**.
*   **Primary Core**: Uses **Tavus** for cinema-quality video generation.
*   **Failover Protocol**: If Tavus hits a rate limit or error, the system **instantly** hot-swaps to **Beyond Presence**.
*   **Voice Morphing**: The AI automatically shifts its voice from **Female (Aoede)** to **Male (Puck)** to match the new avatar identity. *The user never experiences a disconnect.*

### 🎨 **Cinematic Frontend Experience**
Built with **React 18** and **Framer Motion**, the UI feels alive.
*   **Glassmorphism 2.0**: Translucent layers with real-time background blurring.
*   **Physics-Based Animations**: Elements spring, slide, and fade with natural momentum.
*   **Reactive Audio**: Visualizers pulse in sync with the AI's voice.

---

## 🛠️ The Tech Stack of Titans

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Core Brain** | **Python 3.10** | AsyncIO Event Loop & Logic Orchestration |
| **AI Model** | **Gemini 2.0 Flash** | Multimodal Reasoning (Audio-in/Audio-out) |
| **Real-time** | **LiveKit** | WebRTC Transport & Room Management |
| **Frontend** | **React + Vite** | High-Performance UI Rendering |
| **Styling** | **Tailwind CSS** | Utility-First Design System |
| **Motion** | **Framer Motion** | Complex Animation Orchestration |
| **Avatars** | **Tavus & Beyond** | Generative Video Synthesis |

---

## 🚀 Deployment Protocol

Follow these steps to initialize the simulation.

### Phase 1: Environment Injection
Create a `.env` file with your credentials.

```env
# ⚡ LiveKit Cloud
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=sk_...
LIVEKIT_API_SECRET=secret_...

# 🧠 Google AI
GOOGLE_API_KEY=AIza...

# 🎭 Avatar Credentials
TAVUS_API_KEY=...
REPLICA_ID=...
PERSONA_ID=...

# 👻 Fallback Avatar
BEY_API_KEY=...
BEY_AVATAR_ID=...
```

### Phase 2: System Ignition

You must initialize three parallel subsystems.

**1. The Gatekeeper (Token Server)**
```bash
python token_server.py
# Status: ONLINE @ Port 3000
```

**2. The Brain (AI Agent)**
```bash
python agent.py dev
# Status: LISTENING for incoming streams
```

**3. The Interface (Frontend)**
```bash
cd frontend && npm run dev
# Status: RENDERED @ localhost:5173
```

---

## � Future Roadmap

*   [ ] **Emotion Analysis**: Real-time sentiment tracking of the candidate's face.
*   [ ] **Code Board**: Collaborative coding environment synced with the AI.
*   [ ] **VR Mode**: Fully immersive interview inside a virtual office.

---

> *Built with 💻 and ☕ by the PracterViews Team.*
