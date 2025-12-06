import React, { useState, useEffect } from 'react';
import { LiveKitRoom, useTracks, VideoTrack, useRoomContext, RoomAudioRenderer, useIsSpeaking } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Loader2, Sparkles, FileText } from 'lucide-react';
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

    useEffect(() => {
        // Prevent double fetch from React StrictMode
        if (hasFetched.current) return;
        hasFetched.current = true;

        const fetchToken = async () => {
            try {
                const response = await fetch(`http://localhost:3000/getToken?type=${type || 'default'}`);
                const data = await response.json();
                setToken(data.token);
            } catch (error) {
                console.error("Failed to fetch token:", error);
            }
        };
        fetchToken();
    }, [type]);

    if (!token) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#09090b] text-white">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
                        </div>
                    </div>
                    <h2 className="text-xl font-medium text-gray-300">Preparing Interview Environment...</h2>
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
            className="h-screen w-full bg-[#09090b] overflow-hidden"
            onDisconnected={() => navigate('/')}
        >
            <RoomContent />
            <RoomAudioRenderer />
        </LiveKitRoom>
    );
};

// Sub-component to handle participant logic safely
const ParticipantTile = ({ track, participant, isLocal }) => {
    const isSpeaking = useIsSpeaking(participant);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={`relative w-full h-full bg-[#121214] rounded-3xl overflow-hidden border transition-all duration-300 ease-in-out flex flex-col items-center justify-center group ${isSpeaking
                ? 'border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.3)]'
                : 'border-white/10 hover:border-white/20'
                }`}
        >
            {track ? (
                <VideoTrack trackRef={track} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center relative overflow-hidden">
                    {/* Animated Background for Placeholder */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

                    <div className={`w-32 h-32 rounded-full flex items-center justify-center relative z-10 ${isLocal ? 'bg-gray-800' : 'bg-indigo-900/30'}`}>
                        {isSpeaking && (
                            <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping" />
                        )}
                        <span className="text-4xl">{isLocal ? "👤" : "🤖"}</span>
                    </div>
                </div>
            )}

            <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                {isSpeaking && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                {isLocal ? "You" : "AI Interviewer"}
            </div>
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

    const leaveRoom = () => {
        room.disconnect();
    };

    // Separate tracks into local (User) and remote (AI Agent)
    const localTrack = tracks.find(t => t.participant.isLocal);
    const remoteTracks = tracks.filter(t => !t.participant.isLocal);

    // Assuming the first remote track is the AI agent
    const agentTrack = remoteTracks.length > 0 ? remoteTracks[0] : null;
    const agentParticipant = agentTrack?.participant;

    return (
        <div className="h-full flex flex-col p-6 max-w-[1600px] mx-auto">
            {/* Header */}
            <header className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <span className="text-white font-bold text-xl">P</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold">PracterViews</h1>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            Live Session
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Assets Toggle Button */}
                    <button
                        onClick={() => setShowAssets(!showAssets)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 border ${showAssets
                            ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'
                            }`}
                    >
                        <FileText className="w-4 h-4" />
                        Assets
                    </button>

                    {/* Connection Status */}
                    <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-full text-sm text-gray-300 backdrop-blur-sm">
                        {agentParticipant ? "Connected" : "Waiting for Interviewer..."}
                    </div>
                </div>
            </header>

            {/* Main Content Area - Split Screen */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 relative">

                {/* Left: AI Interviewer */}
                <AnimatePresence mode="wait">
                    {agentParticipant ? (
                        <ParticipantTile
                            key="agent"
                            track={agentTrack}
                            participant={agentParticipant}
                            isLocal={false}
                        />
                    ) : (
                        // Placeholder while waiting for agent to join
                        <motion.div
                            key="placeholder"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="relative w-full h-full bg-[#121214] rounded-3xl overflow-hidden border border-white/10 flex flex-col items-center justify-center"
                        >
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />

                            <div className="flex flex-col items-center gap-6 relative z-10">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full animate-pulse" />
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-b from-indigo-900 to-black border border-indigo-500/30 flex items-center justify-center relative">
                                        <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
                                    </div>
                                </div>
                                <div className="text-center">
                                    <h3 className="text-xl font-semibold mb-2">AI Interviewer</h3>
                                    <p className="text-gray-400 text-sm">Joining the session...</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Right: User (You) */}
                {room.localParticipant ? (
                    <ParticipantTile
                        track={localTrack}
                        participant={room.localParticipant}
                        isLocal={true}
                    />
                ) : (
                    <div className="flex items-center justify-center border border-white/10 rounded-3xl bg-[#121214]">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                    </div>
                )}

                {/* Sliding Assets Panel */}
                <AnimatePresence>
                    {showAssets && (
                        <motion.div
                            initial={{ x: 400, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 400, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="absolute right-0 top-0 h-full w-80 bg-[#121214]/95 backdrop-blur-xl border-l border-white/10 p-5 flex flex-col gap-6 z-50 shadow-2xl"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-indigo-400" />
                                    Interview Assets
                                </h3>
                                <button
                                    onClick={() => setShowAssets(false)}
                                    className="text-gray-500 hover:text-white transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            <p className="text-xs text-gray-500 bg-white/5 p-3 rounded-xl border border-white/5">
                                Upload your resume or link your GitHub to help the interviewer ask personalized questions.
                            </p>

                            <ResumeUploader />

                            <div className="w-full h-px bg-white/10" />

                            <GithubInput />
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>

            {/* Bottom Controls */}
            <motion.div
                className="flex justify-center items-center gap-6"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <div className="bg-[#18181b]/80 backdrop-blur-xl border border-white/10 p-2 rounded-full flex items-center gap-2 shadow-2xl">
                    <motion.button
                        onClick={toggleMic}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-4 rounded-full transition-all duration-300 ${isMicOn
                            ? 'bg-white/10 hover:bg-white/20 text-white'
                            : 'bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/50'
                            }`}
                        title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
                    >
                        {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                    </motion.button>

                    <motion.button
                        onClick={toggleCam}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-4 rounded-full transition-all duration-300 ${isCamOn
                            ? 'bg-white/10 hover:bg-white/20 text-white'
                            : 'bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/50'
                            }`}
                        title={isCamOn ? "Turn Off Camera" : "Turn On Camera"}
                    >
                        {isCamOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                    </motion.button>

                    <div className="w-px h-8 bg-white/10 mx-2" />

                    <motion.button
                        onClick={leaveRoom}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-full font-medium transition-colors flex items-center gap-2 shadow-lg shadow-red-500/20"
                    >
                        <PhoneOff className="w-5 h-5" />
                        End Interview
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

export default InterviewRoom;
