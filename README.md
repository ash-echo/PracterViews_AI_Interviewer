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

    User([👤 CANDIDATE])
    
    subgraph Cloud_Layer [☁️ GLOBAL REAL-TIME NETWORK]
        LK[⚡ LiveKit Edge Network]
    end

    subgraph Client_Layer [💻 IMMERSIVE FRONTEND]
        Dashboard[📱 Holo-Dashboard]
        Room[🎥 4K Interview Room]
        Visualizer[📊 Audio Visualizer]
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
