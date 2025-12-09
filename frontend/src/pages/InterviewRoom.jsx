import React, { useState, useEffect } from 'react';
import { LiveKitRoom, useTracks, VideoTrack, useRoomContext, RoomAudioRenderer, useIsSpeaking } from '@livekit/components-react';
import { Track } from 'livekit-client';
import {
    Mic, MicOff, Video, VideoOff, PhoneOff, Loader2, Sparkles, FileText,
    MoreVertical, Settings, Radio, Activity, Cpu, Wifi
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Import asset components
import ResumeUploader from '../components/ResumeUploader';
import GithubInput from '../components/GithubInput';

const SERVER_URL = 'wss://practerview-qgcp05tt.livekit.cloud';

const InterviewRoom = () => {
    const [token, setToken] = useState("");
    const navigate = useNavigate();
    const { type } = useParams();
    const hasFetched = React.useRef(false);

    const loadingMessages = [
        { title: "PREPARING INTERVIEW WORKSPACE", sub: "Aligning evaluation criteria with session parameters..." },
        { title: "SETTING UP ASSESSMENT FLOW", sub: "Gathering required resources for interview analysis..." },
        { title: "REVIEWING CANDIDATE INPUTS", sub: "Ensuring secure session communication channel..." },
        { title: "LOADING INTERVIEW FRAMEWORK", sub: "Compiling task modules and question sets..." },
        { title: "INITIALIZING MEETING PROTOCOL", sub: "Setting up adaptive difficulty engine..." },
        { title: "PREPARING EVALUATION MODULES", sub: "Preparing personalized interview metrics..." },
        { title: "SYNCHRONIZING INTERVIEW SYSTEM", sub: "Optimizing system for real-time interaction..." },
        { title: "ACTIVATING INTERVIEW SESSION", sub: "Running environment diagnostics and checks..." },
        { title: "CALIBRATING RESPONSE ENGINE", sub: "Updating context models for accuracy..." },
        { title: "VERIFYING SYSTEM READINESS", sub: "Finalizing assessment workflow initialization..." }
    ];

    // Stable random message selection (only runs once on mount)
    const [loadingText] = useState(() => {
        const randomIndex = Math.floor(Math.random() * loadingMessages.length);
        return loadingMessages[randomIndex];
    });

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        const fetchToken = async () => {
            try {
                // Enforce a minimum loading time of 2 seconds for the "cycle"
                const minDelay = new Promise(resolve => setTimeout(resolve, 2000));

                const tokenResponse = fetch(`http://localhost:3000/getToken?type=${type || 'default'}`).then(res => res.json());

                const [_, data] = await Promise.all([minDelay, tokenResponse]);
                setToken(data.token);
            } catch (error) {
                console.error("Failed to fetch token:", error);
            }
        };
        fetchToken();
    }, [type]);

    if (!token) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#030014] text-foreground relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="perspective-grid" />
                    <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] rounded-full bg-indigo-600/20 blur-[100px] animate-pulse-slow" />
                </div>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center gap-6 z-10 glass-panel p-12 rounded-3xl border-white/10 shadow-2xl relative"
                >
                    <div className="absolute inset-0 z-0 pointer-events-none rounded-3xl overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-border-beam" />
                    </div>

                    <div className="relative">
                        <div className="w-24 h-24 rounded-full border-r-2 border-t-2 border-indigo-500 animate-spin" />
                        <div className="absolute inset-0 rounded-full border-l-2 border-b-2 border-purple-500 animate-[spin_1.5s_linear_infinite_reverse]" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Cpu className="w-8 h-8 text-white animate-pulse" />
                        </div>
                    </div>
                    <div className="text-center">
                        <h2 className="text-2xl font-display font-bold mb-2 tracking-tight uppercase">{loadingText.title}</h2>
                        <p className="text-indigo-300 font-mono text-xs tracking-widest uppercase animate-pulse">
                            {loadingText.sub}
                        </p>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <LiveKitRoom
            video={true}
            audio={true}
            token={token}
            serverUrl={SERVER_URL}
            data-lk-theme="default"
            className="h-screen w-full bg-[#030014] overflow-hidden relative font-sans"
            onDisconnected={() => navigate('/')}
        >
            {/* Ambient Background & Grid */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="perspective-grid opacity-30" />
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px]" />
            </div>

            <RoomContent />
            <RoomAudioRenderer />
        </LiveKitRoom>
    );
};

const ParticipantTile = ({ track, participant, isLocal }) => {
    const isSpeaking = useIsSpeaking(participant);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
            className={`relative w-full h-full rounded-[2rem] overflow-hidden border transition-all duration-300 isolate group ${isSpeaking
                ? 'border-indigo-500/50 shadow-[0_0_50px_-10px_rgba(99,102,241,0.5)]'
                : 'border-white/5 hover:border-white/10'
                } bg-black/40 backdrop-blur-sm`}
        >
            {/* Corner Accents (HUD style) */}
            <div className={`absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 rounded-tl-xl transition-colors duration-300 ${isSpeaking ? 'border-indigo-500' : 'border-white/10'}`} />
            <div className={`absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 rounded-br-xl transition-colors duration-300 ${isSpeaking ? 'border-indigo-500' : 'border-white/10'}`} />

            {track ? (
                <VideoTrack trackRef={track} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full bg-[#05050a] flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

                    <div className={`w-40 h-40 rounded-full flex items-center justify-center relative z-10 transition-transform duration-300 ${isSpeaking ? "scale-110" : "scale-100"}`}>
                        {/* Complex Audio Ripple */}
                        {isSpeaking && (
                            <>
                                <div className="absolute inset-0 rounded-full border border-indigo-500/30 animate-[ping_1.5s_ease-out_infinite]" />
                                <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 animate-[ping_2s_ease-out_infinite] delay-75" />
                                <div className="absolute inset-0 rounded-full bg-indigo-500/10 blur-xl animate-pulse" />
                            </>
                        )}

                        <div className={`w-32 h-32 rounded-full flex items-center justify-center ${isLocal ? 'bg-zinc-900 border border-white/10' : 'bg-gradient-to-tr from-indigo-600 to-purple-600'} shadow-2xl relative overflow-hidden`}>
                            {!isLocal && <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay" />}
                            <span className="text-5xl filter drop-shadow-lg z-10">{isLocal ? "👤" : "🤖"}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Name Tag HUD */}
            <div className="absolute bottom-6 left-8 z-20">
                <div className="glass-panel px-5 py-2.5 rounded-full flex items-center gap-3 border-white/10">
                    <div className={`relative w-2.5 h-2.5 flex items-center justify-center`}>
                        <div className={`absolute inset-0 rounded-full ${isSpeaking ? "bg-green-500 animate-ping opacity-75" : ""}`} />
                        <div className={`relative w-2 h-2 rounded-full ${isSpeaking ? "bg-green-500" : "bg-zinc-500"}`} />
                    </div>
                    <span className="text-sm font-bold tracking-wider text-white">{isLocal ? "CANDIDATE" : "AI INTERVIEWER"}</span>
                    {!isLocal && (
                        <div className="flex items-center gap-1.5 ml-2 px-1.5 py-0.5 bg-indigo-500/20 border border-indigo-500/30 rounded text-[10px] font-mono text-indigo-300">
                            <Wifi className="w-3 h-3" />
                            LIVE
                        </div>
                    )}
                </div>
            </div>

            {/* Audio Visualizer (Simulated) */}
            {isSpeaking && !isLocal && (
                <div className="absolute top-8 right-8 flex gap-1 items-end h-8">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div
                            key={i}
                            className="w-1.5 bg-indigo-400 rounded-full animate-[pulse_0.4s_ease-in-out_infinite]"
                            style={{
                                height: `${Math.random() * 60 + 40}%`,
                                animationDelay: `${i * 0.05}s`,
                                opacity: 0.8
                            }}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    );
};

const RoomContent = () => {
    const tracks = useTracks([
        { source: Track.Source.Camera, withPlaceholder: true },
        { source: Track.Source.ScreenShare, withPlaceholder: false },
    ]);

    const room = useRoomContext();
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCamOn, setIsCamOn] = useState(true);
    const [showAssets, setShowAssets] = useState(false);

    const toggleMic = async () => {
        if (room.localParticipant) {
            const newState = !isMicOn;
            await room.localParticipant.setMicrophoneEnabled(newState);
            setIsMicOn(newState);
        }
    };

    const toggleCam = async () => {
        if (room.localParticipant) {
            const newState = !isCamOn;
            await room.localParticipant.setCameraEnabled(newState);
            setIsCamOn(newState);
        }
    };

    const leaveRoom = () => room.disconnect();

    const localTrack = tracks.find(t => t.participant.isLocal);
    const remoteTracks = tracks.filter(t => !t.participant.isLocal);
    const agentTrack = remoteTracks.length > 0 ? remoteTracks[0] : null;
    const agentParticipant = agentTrack?.participant;

    return (
        <div className="h-full flex flex-col relative z-10 p-4 md:p-6">
            {/* Top Bar HUD */}
            <header className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity" />
                            <span className="text-white font-black text-xl tracking-tighter">PV</span>
                        </div>
                        <div>
                            <h1 className="font-display font-bold text-lg tracking-tight leading-none">PracterViews</h1>
                            <span className="text-[10px] font-mono text-indigo-400 tracking-widest uppercase">Simulation Room 01</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/20 border border-white/5 text-xs text-muted font-mono">
                        <Activity className="w-3 h-3 text-green-500" />
                        <span>{agentParticipant ? "SYSTEM: STABLE" : "SYSTEM: WAITING"}</span>
                    </div>

                    <motion.button
                        onClick={() => setShowAssets(!showAssets)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`
                            flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all
                            border backdrop-blur-md shadow-lg
                            ${showAssets
                                ? 'bg-indigo-500 text-white border-indigo-400 shadow-indigo-500/20'
                                : 'glass-panel text-white hover:bg-white/10'
                            }
                        `}
                    >
                        <FileText className="w-4 h-4" />
                        <span>Context Data</span>
                    </motion.button>
                </div>
            </header>

            {/* Main Stage */}
            <div className="flex-1 flex gap-6 min-h-0 relative">
                {/* Agent View (Main) */}
                <div className="flex-1 relative flex items-center justify-center perspective-container">
                    <AnimatePresence mode="wait">
                        {agentParticipant ? (
                            <ParticipantTile key="agent" track={agentTrack} participant={agentParticipant} isLocal={false} />
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="w-full h-full max-h-[85vh] aspect-video rounded-[2rem] border border-white/5 bg-[#0a0a0f] flex flex-col items-center justify-center gap-8 relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay" />
                                {/* Scanning Line Effect */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/50 blur-sm animate-[scan_3s_ease-in-out_infinite]" />

                                <div className="relative z-10 flex flex-col items-center gap-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full animate-pulse" />
                                        <div className="w-32 h-32 rounded-full border border-white/10 bg-black/50 backdrop-blur-md flex items-center justify-center">
                                            <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
                                        </div>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h3 className="text-xl font-display font-medium text-white tracking-wide">ESTABLISHING CONNECTION</h3>
                                        <p className="text-indigo-400/60 font-mono text-xs tracking-widest">WAITING FOR SYSTEM RESPONSE...</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* User View (Picture-in-Picture Style) */}
                    {room.localParticipant && (
                        <motion.div
                            className="absolute bottom-6 right-6 w-72 aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 z-30 bg-black"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            drag
                            dragConstraints={{ left: -1000, right: 0, top: -500, bottom: 0 }}
                            whileDrag={{ scale: 1.05, cursor: "grabbing" }}
                        >
                            <ParticipantTile track={localTrack} participant={room.localParticipant} isLocal={true} />
                        </motion.div>
                    )}
                </div>

                {/* Sliding Assets Panel */}
                <AnimatePresence>
                    {showAssets && (
                        <motion.div
                            initial={{ x: 400, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 400, opacity: 0 }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="w-[400px] h-full glass-panel rounded-3xl border border-white/10 p-6 flex flex-col gap-6"
                        >
                            <div className="flex items-center justify-between pb-4 border-b border-white/5">
                                <h3 className="font-display font-bold text-lg flex items-center gap-2 text-white">
                                    <FileText className="w-5 h-5 text-indigo-400" />
                                    CONTEXT INJECTION
                                </h3>
                                <button onClick={() => setShowAssets(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-muted hover:text-white">✕</button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
                                <section>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-1 h-4 bg-indigo-500 rounded-full" />
                                        <h4 className="text-xs font-bold text-muted uppercase tracking-wider">Resume Data</h4>
                                    </div>
                                    <ResumeUploader />
                                </section>

                                <section>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-1 h-4 bg-purple-500 rounded-full" />
                                        <h4 className="text-xs font-bold text-muted uppercase tracking-wider">Codebase Context</h4>
                                    </div>
                                    <GithubInput />
                                </section>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Float Dock Controls */}
            <div className="flex justify-center mt-6 mb-2">
                <motion.div
                    className="glass-panel px-8 py-4 rounded-full flex items-center gap-8 shadow-2xl shadow-indigo-900/20 border border-white/10 bg-black/40 backdrop-blur-xl"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                >
                    <div className="flex items-center gap-4">
                        <ControlButton
                            onClick={toggleMic}
                            isActive={isMicOn}
                            onIcon={<Mic />}
                            offIcon={<MicOff />}
                            activeClass="bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                            inactiveClass="bg-red-500/20 text-red-500 border border-red-500/30"
                        />
                        <ControlButton
                            onClick={toggleCam}
                            isActive={isCamOn}
                            onIcon={<Video />}
                            offIcon={<VideoOff />}
                            activeClass="bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                            inactiveClass="bg-red-500/20 text-red-500 border border-red-500/30"
                        />
                    </div>

                    <div className="w-px h-10 bg-white/10" />

                    <motion.button
                        whileHover={{ scale: 1.05, backgroundColor: "#ef4444" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={leaveRoom}
                        className="px-8 py-4 bg-red-600/90 text-white rounded-full font-bold text-sm flex items-center gap-2 shadow-lg shadow-red-500/20 transition-all border border-red-500/50"
                    >
                        <PhoneOff className="w-4 h-4" />
                        TERMINATE
                    </motion.button>
                </motion.div>
            </div>
        </div>
    );
};

const ControlButton = ({ onClick, isActive, onIcon, offIcon, activeClass, inactiveClass }) => (
    <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? activeClass : inactiveClass}`}
    >
        {isActive ? React.cloneElement(onIcon, { size: 24 }) : React.cloneElement(offIcon, { size: 24 })}
    </motion.button>
);

export default InterviewRoom;
