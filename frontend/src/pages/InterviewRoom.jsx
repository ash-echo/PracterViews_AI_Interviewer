import React, { useState, useEffect } from 'react';
import { LiveKitRoom, useTracks, VideoTrack, useRoomContext, RoomAudioRenderer, useIsSpeaking, StartAudio } from '@livekit/components-react';
import { Track } from 'livekit-client';
import {
    Mic, MicOff, Video, VideoOff, PhoneOff, Loader2, Sparkles, FileText, Code,
    MoreVertical, Settings, Radio, Activity, Cpu, Wifi
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Import asset components
import ResumeUploader from '../components/ResumeUploader';
import GithubInput from '../components/GithubInput';
import ParticleBackground from '../components/ParticleBackground';

// LiveKit server URL is fetched dynamically from token server

const InterviewRoom = () => {
    const [token, setToken] = useState("");
    const navigate = useNavigate();
    const { type } = useParams();
    const hasFetched = React.useRef(false);

    // Ordered 10-Step Sequence
    const loadingSteps = [
        { title: "INITIALIZING SESSION WORKSPACE", sub: "Allocating secure environment resources..." },
        { title: "ESTABLISHING SECURE UPLINK", sub: "Verifying encrypted handshake protocols..." },
        { title: "LOADING ASSESSMENT MODULES", sub: "Retrieving role-specific evaluation criteria..." },
        { title: "SYNCHRONIZING CONTEXT ENGINE", sub: "Injecting resume data and technical parameters..." },
        { title: "CALIBRATING AI MODELS", sub: "Optimizing neural response latency..." },
        { title: "CONFIGURING AUDIO STREAMS", sub: "Setting up noise cancellation inputs..." },
        { title: "GENERATING INTERVIEW GRAPH", sub: "Building dynamic question logic pathways..." },
        { title: "VERIFYING SYSTEM INTEGRITY", sub: "Running final diagnostic checks..." },
        { title: "BUFFERING ASSETS", sub: "Pre-loading high-fidelity interface elements..." },
        { title: "LAUNCHING SEQUENCED PROTOCOL", sub: "Activating live simulation interface..." }
    ];

    const [currentStep, setCurrentStep] = useState(0);
    const [tokenReady, setTokenReady] = useState(null);
    const [serverUrl, setServerUrl] = useState("");

    // 1. Fetch Token Immediately (Background)
    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        const fetchToken = async () => {
            try {
                const response = await fetch(`http://localhost:3000/getToken?type=${type || 'default'}`);
                const data = await response.json();
                setTokenReady(data.token);
                setServerUrl(data.url);  // Get URL from token server
            } catch (error) {
                console.error("Failed to fetch token:", error);
            }
        };
        fetchToken();
    }, [type]);

    // 2. Run Sequence Animation
    useEffect(() => {
        if (currentStep < loadingSteps.length - 1) {
            const timer = setTimeout(() => {
                setCurrentStep(prev => prev + 1);
            }, 600); // 600ms per step = ~6 seconds total
            return () => clearTimeout(timer);
        } else if (currentStep === loadingSteps.length - 1) {
            // Sequence done. Check if token is ready.
            if (tokenReady) {
                // Add a small delay for the final step to be readable before switching
                const finalDelay = setTimeout(() => {
                    setToken(tokenReady);
                }, 800);
                return () => clearTimeout(finalDelay);
            }
            // If token not ready yet, it will wait here until tokenReady changes
        }
    }, [currentStep, tokenReady]);

    const activeStep = loadingSteps[currentStep];
    const progress = ((currentStep + 1) / loadingSteps.length) * 100;

    if (!token) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#030014] text-foreground relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="perspective-grid" />
                    <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] rounded-full bg-indigo-600/20 blur-[100px] animate-pulse-slow" />
                </div>
                <motion.div
                    key="loader"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center gap-8 z-10 glass-panel p-12 rounded-3xl border-white/10 shadow-2xl relative w-full max-w-xl"
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

                    <div className="text-center space-y-4 w-full">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeStep.title} // Triggers animation on change
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-2"
                            >
                                <h2 className="text-2xl font-display font-bold tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                                    {activeStep.title}
                                </h2>
                                <p className="text-indigo-400 font-mono text-xs tracking-widest uppercase">
                                    {activeStep.sub}
                                </p>
                            </motion.div>
                        </AnimatePresence>

                        {/* Progress Bar */}
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-6">
                            <motion.div
                                className="h-full bg-indigo-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5, ease: "linear" }}
                            />
                        </div>
                        <div className="flex justify-between text-[10px] font-mono text-muted uppercase">
                            <span>Step {currentStep + 1}/{loadingSteps.length}</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
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
            serverUrl={serverUrl}
            data-lk-theme="default"
            className="h-screen w-full bg-[#030014] overflow-hidden relative font-sans"
            onDisconnected={() => navigate('/')}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                transition={{ duration: 0.8, ease: "circOut" }}
                className="absolute inset-0 z-0"
            />

            {/* Ambient Background & Grid */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <ParticleBackground />
                <div className="perspective-grid opacity-30" />
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px]" />
            </div>

            <RoomContent />
            <RoomAudioRenderer />
            <StartAudio label="Click to allow audio playback" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-indigo-600 text-white px-6 py-3 rounded-full font-bold shadow-2xl hover:bg-indigo-700 transition-colors" />
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
            className={`relative w-full aspect-video rounded-[2rem] overflow-hidden border transition-all duration-300 isolate group ${isSpeaking
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
    const { type } = useParams();
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCamOn, setIsCamOn] = useState(true);
    const [showAssets, setShowAssets] = useState(false);
    const [showIDE, setShowIDE] = useState(false);
    const [codeContent, setCodeContent] = useState(`class Solution {
public:
    int longestValidParentheses(string s) {
        
    }
};`);
    // Detect track from URL params
    const interviewTrack = type || 'frontend'; // frontend, backend, fullstack, devops, ml, mobile

    // Track-based question pools
    const questionPools = {
        frontend: [
            {
                title: "Debounce Function - Medium",
                description: "Implement a debounce function that delays invoking func until after wait milliseconds have elapsed since the last time the debounced function was invoked.",
                examples: [
                    { input: 'debounce(console.log, 100)("hello")', output: 'logs "hello" after 100ms', explanation: 'Function is called after delay' },
                    { input: 'Multiple rapid calls', output: 'Only last call executes', explanation: 'Previous calls are cancelled' }
                ],
                constraints: ['0 ≤ wait ≤ 1000', 'func is a valid function'],
                testCases: [
                    { input: { func: 'console.log', wait: 100, calls: ['"test"'] }, expectedBehavior: 'delayed_execution' },
                    { input: { func: 'console.log', wait: 50, calls: ['"a"', '"b"', '"c"'] }, expectedBehavior: 'only_last_call' }
                ]
            },
            {
                title: "DOM Element Finder - Easy",
                description: "Write a function that finds all elements with a specific class name and returns them as an array.",
                examples: [
                    { input: 'findByClass("active")', output: '[<div class="active">, <span class="active">]', explanation: 'Returns array of matching elements' }
                ],
                constraints: ['className is a valid string', 'Return empty array if no matches'],
                testCases: [
                    { input: { className: 'test-class' }, expected: 'array_of_elements' },
                    { input: { className: 'nonexistent' }, expected: '[]' }
                ]
            }
        ],
        backend: [
            {
                title: "Rate Limiter - Hard",
                description: "Design a rate limiter that allows at most N requests per time window. Implement using sliding window approach.",
                examples: [
                    { input: 'RateLimiter(3, 60) - 3 requests per minute', output: 'true/false for each request', explanation: 'Returns false when limit exceeded' }
                ],
                constraints: ['1 ≤ N ≤ 1000', '1 ≤ window ≤ 3600'],
                testCases: [
                    { input: { limit: 3, window: 60, requests: [0, 10, 20, 30] }, expected: [true, true, true, false] },
                    { input: { limit: 2, window: 30, requests: [0, 35] }, expected: [true, true] }
                ]
            },
            {
                title: "Database Connection Pool - Medium",
                description: "Implement a connection pool that manages database connections efficiently with max pool size.",
                examples: [
                    { input: 'ConnectionPool(5) - max 5 connections', output: 'connection object or null', explanation: 'Returns null when pool exhausted' }
                ],
                constraints: ['1 ≤ maxSize ≤ 100', 'Handle connection lifecycle'],
                testCases: [
                    { input: { maxSize: 2, operations: ['get', 'get', 'get'] }, expected: ['conn1', 'conn2', null] },
                    { input: { maxSize: 1, operations: ['get', 'release', 'get'] }, expected: ['conn1', 'released', 'conn1'] }
                ]
            }
        ],
        fullstack: [
            {
                title: "Real-time Chat Message Queue - Hard",
                description: "Design a message queue system that handles real-time chat messages with guaranteed delivery and ordering.",
                examples: [
                    { input: 'MessageQueue with user1 sending to user2', output: 'Messages delivered in order', explanation: 'FIFO guarantee maintained' }
                ],
                constraints: ['Handle network failures', 'Maintain message ordering', 'Support multiple users'],
                testCases: [
                    { input: { users: ['user1', 'user2'], messages: [{ 'from': 'user1', 'to': 'user2', 'msg': 'hello' }] }, expected: 'delivered_in_order' }
                ]
            }
        ],
        devops: [
            {
                title: "Container Health Check - Medium",
                description: "Write a health check script that monitors container metrics and determines if a restart is needed.",
                examples: [
                    { input: 'CPU: 90%, Memory: 85%, Disk: 95%', output: 'RESTART_NEEDED', explanation: 'Thresholds exceeded' }
                ],
                constraints: ['CPU ≤ 80%', 'Memory ≤ 90%', 'Disk ≤ 90%'],
                testCases: [
                    { input: { cpu: 90, memory: 85, disk: 95 }, expected: 'RESTART_NEEDED' },
                    { input: { cpu: 50, memory: 60, disk: 70 }, expected: 'HEALTHY' }
                ]
            }
        ],
        ml: [
            {
                title: "Feature Scaling Implementation - Medium",
                description: "Implement MinMax scaling and Standard scaling for feature normalization in machine learning.",
                examples: [
                    { input: '[1, 2, 3, 4, 5]', output: '[0, 0.25, 0.5, 0.75, 1]', explanation: 'MinMax scaling to [0,1] range' }
                ],
                constraints: ['Handle empty arrays', 'Avoid division by zero'],
                testCases: [
                    { input: { data: [1, 2, 3, 4, 5], method: 'minmax' }, expected: [0, 0.25, 0.5, 0.75, 1] },
                    { input: { data: [10, 20, 30], method: 'standard' }, expected: 'standardized_values' }
                ]
            }
        ],
        mobile: [
            {
                title: "Infinite Scroll Implementation - Medium",
                description: "Implement an infinite scroll mechanism that loads data as user reaches the bottom of the list.",
                examples: [
                    { input: 'ScrollView with 1000 items', output: 'Load 20 items at a time', explanation: 'Pagination with scroll detection' }
                ],
                constraints: ['Handle rapid scrolling', 'Prevent duplicate requests'],
                testCases: [
                    { input: { totalItems: 100, pageSize: 10, scrollPosition: 90 }, expected: 'load_next_page' },
                    { input: { totalItems: 50, pageSize: 10, scrollPosition: 30 }, expected: 'no_action' }
                ]
            }
        ]
    };

    const getRandomQuestion = (track) => {
        const questions = questionPools[track] || questionPools.frontend;
        return questions[Math.floor(Math.random() * questions.length)];
    };

    const [currentQuestion, setCurrentQuestion] = useState(getRandomQuestion(interviewTrack));
    const [evaluationResult, setEvaluationResult] = useState(null);
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [showAnalysis, setShowAnalysis] = useState(false);

    // ===== INTERVIEW WORKFLOW STATE =====
    const PHASES = ['introduction', 'resume', 'github', 'topic', 'coding', 'report'];
    const PHASE_LABELS = {
        introduction: '👋 Introduction',
        resume: '📄 Resume Round',
        github: '💻 GitHub Round',
        topic: '🎯 Topic Questions',
        coding: '⌨️ Coding Round',
        report: '📊 Final Report'
    };
    const PHASE_WEIGHTS = { resume: 15, github: 15, topic: 25, coding: 45 };
    // Total: 2 + 2 + 1 + 1 = 6 questions max
    const QUESTIONS_PER_PHASE = { resume: 2, github: 2, topic: 1, coding: 1 };

    const [interviewPhase, setInterviewPhase] = useState('introduction');
    const [phaseScores, setPhaseScores] = useState({
        resume: 0,
        github: 0,
        topic: 0,
        coding: 0
    });
    const [skippedSections, setSkippedSections] = useState(false);
    const [questionsAnswered, setQuestionsAnswered] = useState({
        resume: 0,
        github: 0,
        topic: 0,
        coding: 0
    });

    // ===== REAL-TIME METRICS TRACKING =====
    const [metricsData, setMetricsData] = useState({
        cameraOnTime: 0,        // Seconds camera was on
        totalInterviewTime: 0,   // Total interview duration
        micActiveTime: 0,        // Seconds mic was used
        resumeUploaded: false,   // Whether resume was uploaded
        resumeRelevant: false,   // If resume has relevant tech
        githubUploaded: false,   // Whether GitHub was shared
        githubRelevant: false,   // If GitHub has relevant repos
        interactionCount: 0      // Number of spoken interactions
    });
    const metricsRef = React.useRef({
        cameraStartTime: null,
        micStartTime: null,
        interviewStartTime: Date.now()
    });

    // Track camera on/off time
    React.useEffect(() => {
        if (isCamOn) {
            metricsRef.current.cameraStartTime = Date.now();
        } else if (metricsRef.current.cameraStartTime) {
            const elapsed = (Date.now() - metricsRef.current.cameraStartTime) / 1000;
            setMetricsData(prev => ({
                ...prev,
                cameraOnTime: prev.cameraOnTime + elapsed
            }));
            metricsRef.current.cameraStartTime = null;
        }
    }, [isCamOn]);

    // Track mic on/off time
    React.useEffect(() => {
        if (isMicOn) {
            metricsRef.current.micStartTime = Date.now();
        } else if (metricsRef.current.micStartTime) {
            const elapsed = (Date.now() - metricsRef.current.micStartTime) / 1000;
            setMetricsData(prev => ({
                ...prev,
                micActiveTime: prev.micActiveTime + elapsed
            }));
            metricsRef.current.micStartTime = null;
        }
    }, [isMicOn]);

    // Update total interview time periodically
    React.useEffect(() => {
        const interval = setInterval(() => {
            setMetricsData(prev => ({
                ...prev,
                totalInterviewTime: (Date.now() - metricsRef.current.interviewStartTime) / 1000
            }));
        }, 5000); // Update every 5 seconds
        return () => clearInterval(interval);
    }, []);

    // Calculate real eye contact percentage
    const getEyeContactScore = () => {
        if (metricsData.totalInterviewTime === 0) return 0;
        const percentage = (metricsData.cameraOnTime / metricsData.totalInterviewTime) * 100;
        return Math.min(100, Math.round(percentage));
    };

    // Calculate real communication score
    const getCommunicationScore = () => {
        if (metricsData.totalInterviewTime === 0) return 0;
        const percentage = (metricsData.micActiveTime / metricsData.totalInterviewTime) * 100;
        return Math.min(100, Math.round(percentage));
    };

    // Give baseline scores for resume/github uploads
    React.useEffect(() => {
        if (metricsData.resumeUploaded && phaseScores.resume === 0) {
            setPhaseScores(prev => ({
                ...prev,
                resume: metricsData.resumeRelevant ? 50 : 30 // Base score for upload
            }));
        }
        if (metricsData.githubUploaded && phaseScores.github === 0) {
            setPhaseScores(prev => ({
                ...prev,
                github: metricsData.githubRelevant ? 50 : 30 // Base score for share
            }));
        }
    }, [metricsData.resumeUploaded, metricsData.githubUploaded, metricsData.resumeRelevant, metricsData.githubRelevant]);

    // Calculate final weighted score
    const calculateFinalScore = () => {
        if (skippedSections) return { score: 0, reason: 'Skipped Sections' };

        const weightedScore =
            (phaseScores.resume * PHASE_WEIGHTS.resume / 100) +
            (phaseScores.github * PHASE_WEIGHTS.github / 100) +
            (phaseScores.topic * PHASE_WEIGHTS.topic / 100) +
            (phaseScores.coding * PHASE_WEIGHTS.coding / 100);

        return { score: Math.round(weightedScore), reason: null };
    };

    // Handle skip - go directly to report with score 0
    const handleSkipInterview = () => {
        setSkippedSections(true);
        setInterviewPhase('report');
        // Notify agent about skip
        if (room && room.localParticipant) {
            room.localParticipant.publishData(
                new TextEncoder().encode(JSON.stringify({
                    type: 'INTERVIEW_SKIPPED',
                    content: 'Candidate skipped remaining sections'
                })),
                { reliable: true }
            );
        }
    };

    // Advance to next phase
    const advancePhase = () => {
        const currentIndex = PHASES.indexOf(interviewPhase);
        if (currentIndex < PHASES.length - 1) {
            const nextPhase = PHASES[currentIndex + 1];
            setInterviewPhase(nextPhase);
            // Notify agent about phase change
            if (room && room.localParticipant) {
                room.localParticipant.publishData(
                    new TextEncoder().encode(JSON.stringify({
                        type: 'PHASE_CHANGE',
                        phase: nextPhase,
                        questionsRequired: QUESTIONS_PER_PHASE[nextPhase] || 0
                    })),
                    { reliable: true }
                );
            }
        }
    };

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

    // Listen for interviewer questions in real-time
    useEffect(() => {
        if (!room || !room.remoteParticipants) return;

        const handleDataReceived = (payload, participant) => {
            try {
                const data = JSON.parse(new TextDecoder().decode(payload));
                if (data.type === 'coding_question') {
                    // If no specific question provided, get random one for current track
                    if (!data.title && !data.description) {
                        setCurrentQuestion(getRandomQuestion(interviewTrack));
                    } else {
                        setCurrentQuestion({
                            title: data.title || 'Coding Challenge',
                            description: data.description || 'Please solve this problem.',
                            examples: data.examples || [],
                            constraints: data.constraints || [],
                            testCases: data.testCases || []
                        });
                    }
                    // Reset evaluation result when new question arrives
                    setEvaluationResult(null);
                    // Auto-open IDE when a new coding question is received
                    setShowIDE(true);
                    // Set phase to coding when coding question is received
                    setInterviewPhase('coding');
                } else if (data.type === 'next_question') {
                    // Interviewer requests next question for the track
                    setCurrentQuestion(getRandomQuestion(interviewTrack));
                    setEvaluationResult(null);
                    setShowIDE(true);
                } else if (data.type === 'PHASE_UPDATE') {
                    // Sync phase with agent
                    if (data.phase && PHASES.includes(data.phase)) {
                        setInterviewPhase(data.phase);
                    }
                }
            } catch (error) {
                console.error('Error parsing question data:', error);
            }
        };

        room.on('dataReceived', handleDataReceived);
        return () => room.off('dataReceived', handleDataReceived);
    }, [room]);

    // Generate realistic test cases based on the current question
    // AI-style code analysis function with STRICT scoring
    const evaluateCode = async (code) => {
        setIsEvaluating(true);
        setEvaluationResult(null);

        try {
            // Simulate AI analysis time
            await new Promise(resolve => setTimeout(resolve, 2000));

            // ===== STEP 1: DETECT UNCHANGED/EMPTY CODE =====
            const defaultTemplates = [
                `class Solution {\npublic:\n    int longestValidParentheses(string s) {\n        \n    }\n};`,
                `class Solution {`,
                `function solution() {\n    \n}`,
                `def solution():`,
                `// Write your solution here`
            ];

            const trimmedCode = code.trim();
            const isUnchanged = defaultTemplates.some(template =>
                trimmedCode === template.trim() ||
                trimmedCode.replace(/\s+/g, '') === template.replace(/\s+/g, '')
            );
            const isEmpty = trimmedCode.length < 20;
            const hasNoImplementation = !code.includes('return') && !code.includes('console') && !code.includes('print');

            // ===== STEP 2: DETECT RUNTIME ERRORS =====
            let runtimeErrors = [];

            // Check for syntax issues
            const openBraces = (code.match(/{/g) || []).length;
            const closeBraces = (code.match(/}/g) || []).length;
            if (openBraces !== closeBraces) {
                runtimeErrors.push('Mismatched braces: { and } count does not match');
            }

            const openParens = (code.match(/\(/g) || []).length;
            const closeParens = (code.match(/\)/g) || []).length;
            if (openParens !== closeParens) {
                runtimeErrors.push('Mismatched parentheses: ( and ) count does not match');
            }

            const openBrackets = (code.match(/\[/g) || []).length;
            const closeBrackets = (code.match(/\]/g) || []).length;
            if (openBrackets !== closeBrackets) {
                runtimeErrors.push('Mismatched brackets: [ and ] count does not match');
            }

            // Check for common errors
            if (code.includes('undefined') && code.includes('undefined.')) {
                runtimeErrors.push('Potential TypeError: Cannot read property of undefined');
            }
            if (code.match(/for\s*\([^)]*;\s*;\s*[^)]*\)/)) {
                runtimeErrors.push('Warning: Possible infinite loop detected');
            }

            // ===== STEP 3: CHECK RELEVANCE TO QUESTION =====
            const questionTitle = currentQuestion.title.toLowerCase();
            const questionDesc = currentQuestion.description.toLowerCase();
            const codeLower = code.toLowerCase();

            // Extract key concepts from question
            const relevantKeywords = [];
            if (questionTitle.includes('debounce')) relevantKeywords.push('settimeout', 'cleartimeout', 'delay', 'timer');
            if (questionTitle.includes('dom')) relevantKeywords.push('document', 'getelementby', 'queryselector', 'classname');
            if (questionTitle.includes('rate limit')) relevantKeywords.push('time', 'window', 'count', 'request', 'limit');
            if (questionTitle.includes('connection pool')) relevantKeywords.push('pool', 'connection', 'acquire', 'release', 'max');
            if (questionTitle.includes('message queue')) relevantKeywords.push('queue', 'message', 'push', 'pop', 'enqueue');
            if (questionTitle.includes('health check')) relevantKeywords.push('cpu', 'memory', 'disk', 'threshold', 'health');
            if (questionTitle.includes('scaling') || questionTitle.includes('feature')) relevantKeywords.push('min', 'max', 'normalize', 'scale');
            if (questionTitle.includes('scroll')) relevantKeywords.push('scroll', 'position', 'load', 'page', 'offset');

            // Check if code addresses the problem
            const relevanceScore = relevantKeywords.filter(kw => codeLower.includes(kw)).length;
            const isRelevant = relevanceScore >= 1 || relevantKeywords.length === 0;

            // ===== STEP 4: CALCULATE STRICT SCORES =====
            let logicScore = 0;
            let edgeCaseScore = 0;
            let readabilityScore = 0;
            let efficiencyScore = 0;
            let runtimeScore = 100;

            // If runtime errors exist, deduct heavily
            if (runtimeErrors.length > 0) {
                runtimeScore = Math.max(0, 100 - (runtimeErrors.length * 40));
            }

            // HARSH SCORING: Unchanged or empty code = near zero
            if (isUnchanged || isEmpty) {
                logicScore = 0;
                edgeCaseScore = 0;
                readabilityScore = 5;
                efficiencyScore = 0;
            }
            // HARSH SCORING: No implementation (no return/output)
            else if (hasNoImplementation) {
                logicScore = 5;
                edgeCaseScore = 0;
                readabilityScore = 10;
                efficiencyScore = 5;
            }
            // HARSH SCORING: Irrelevant to question
            else if (!isRelevant && relevantKeywords.length > 0) {
                logicScore = 10;
                edgeCaseScore = 5;
                readabilityScore = 20;
                efficiencyScore = 10;
            }
            // NORMAL SCORING: Analyze actual code quality
            else {
                const hasFunction = code.includes('function') || code.includes('=>') || code.includes('def ');
                const hasClass = code.includes('class ');
                const hasLoops = code.includes('for') || code.includes('while');
                const hasConditionals = code.includes('if') || code.includes('switch') || code.includes('?');
                const hasReturn = code.includes('return');
                const hasEdgeCaseHandling = code.includes('null') || code.includes('undefined') ||
                    code.includes('length === 0') || code.includes('!') ||
                    code.includes('throw') || code.includes('try');
                const hasComments = code.includes('//') || code.includes('/*');
                const usesModernSyntax = code.includes('const ') || code.includes('let ');
                const hasOptimization = code.includes('Map') || code.includes('Set') ||
                    code.includes('memo') || code.includes('cache') ||
                    code.includes('O(1)') || code.includes('O(n)');
                const lineCount = code.split('\n').filter(l => l.trim().length > 0).length;

                // Logic Score (0-100) - Based on actual implementation
                logicScore = 10; // Base
                if (hasFunction || hasClass) logicScore += 20;
                if (hasLoops) logicScore += 15;
                if (hasConditionals) logicScore += 20;
                if (hasReturn) logicScore += 25;
                if (lineCount >= 5) logicScore += 5;
                if (lineCount >= 10) logicScore += 5;
                logicScore = Math.min(100, logicScore);

                // Edge Case Score (0-100)
                edgeCaseScore = 10;
                if (hasEdgeCaseHandling) edgeCaseScore += 40;
                if (code.includes('try') && code.includes('catch')) edgeCaseScore += 20;
                if (code.includes('throw')) edgeCaseScore += 15;
                if (code.match(/length\s*(===|!==|>|<|>=|<=)\s*0/)) edgeCaseScore += 15;
                edgeCaseScore = Math.min(100, edgeCaseScore);

                // Readability Score (0-100)
                readabilityScore = 20;
                if (hasComments) readabilityScore += 25;
                if (usesModernSyntax) readabilityScore += 20;
                if (lineCount > 3 && lineCount < 50) readabilityScore += 15;
                if (code.includes('  ') || code.includes('\t')) readabilityScore += 10; // Indentation
                if (!code.match(/[a-z]{20,}/)) readabilityScore += 10; // No crazy long variable names
                readabilityScore = Math.min(100, readabilityScore);

                // Efficiency Score (0-100)
                efficiencyScore = 20;
                if (hasOptimization) efficiencyScore += 35;
                if (!code.match(/for.*for.*for/s)) efficiencyScore += 20; // No triple nested loops
                if (!code.match(/while\s*\(\s*true\s*\)/)) efficiencyScore += 15; // No infinite loops
                if (hasReturn) efficiencyScore += 10;
                efficiencyScore = Math.min(100, efficiencyScore);
            }

            // Apply runtime penalty
            if (runtimeErrors.length > 0) {
                logicScore = Math.floor(logicScore * 0.5);
                edgeCaseScore = Math.floor(edgeCaseScore * 0.7);
            }

            // Calculate weighted overall score
            const overallScore = Math.round(
                (logicScore * 0.35) +
                (edgeCaseScore * 0.20) +
                (readabilityScore * 0.15) +
                (efficiencyScore * 0.20) +
                (runtimeScore * 0.10)
            );

            // Determine verdict
            let verdict;
            if (isUnchanged || isEmpty) verdict = 'No Solution Provided';
            else if (hasNoImplementation) verdict = 'Incomplete Implementation';
            else if (runtimeErrors.length > 0) verdict = 'Runtime Errors Detected';
            else if (!isRelevant && relevantKeywords.length > 0) verdict = 'Solution Not Relevant';
            else if (overallScore >= 75) verdict = 'Good Solution';
            else if (overallScore >= 50) verdict = 'Needs Improvement';
            else if (overallScore >= 25) verdict = 'Partial Solution';
            else verdict = 'Insufficient';

            // Generate analysis result
            const analysis = {
                overallScore,
                verdict,
                runtimeErrors: runtimeErrors.length > 0 ? runtimeErrors : null,
                sections: [
                    {
                        title: '🧠 Logic & Implementation',
                        score: logicScore,
                        feedback: isUnchanged || isEmpty
                            ? 'No code has been written. The solution template is unchanged.'
                            : hasNoImplementation
                                ? 'The code lacks a return statement or output. Without this, we cannot verify the solution works.'
                                : !isRelevant && relevantKeywords.length > 0
                                    ? 'The code does not appear to address the given problem. Make sure you understand what the question is asking.'
                                    : logicScore >= 70
                                        ? 'Your logic is sound and addresses the core problem. The implementation structure is correct.'
                                        : logicScore >= 40
                                            ? 'You have some logic in place, but it may not fully solve the problem. Consider the expected input/output.'
                                            : 'The logic needs significant work. Start by understanding the problem and writing pseudocode.',
                        suggestions: isUnchanged || isEmpty
                            ? ['Write your solution in the editor', 'Start with a basic approach first']
                            : logicScore < 50
                                ? ['Add control flow (if/for/while)', 'Make sure to return a value', 'Trace through with an example']
                                : ['Logic looks reasonable']
                    },
                    {
                        title: '⚠️ Edge Case Handling',
                        score: edgeCaseScore,
                        feedback: edgeCaseScore >= 60
                            ? 'Good job handling edge cases! Your code accounts for boundary conditions.'
                            : edgeCaseScore >= 30
                                ? 'Some edge cases may not be handled. Consider null/empty inputs.'
                                : 'No edge case handling detected. What if input is null, empty, or at boundaries?',
                        suggestions: edgeCaseScore < 50
                            ? ['Check for null/undefined inputs', 'Handle empty arrays or strings', 'Add try-catch for error handling']
                            : ['Edge case coverage is acceptable']
                    },
                    {
                        title: '📖 Code Quality',
                        score: readabilityScore,
                        feedback: readabilityScore >= 60
                            ? 'Code is reasonably readable and well-formatted.'
                            : readabilityScore >= 30
                                ? 'Consider adding comments and using descriptive variable names.'
                                : 'Code quality needs improvement. Add comments and proper formatting.',
                        suggestions: readabilityScore < 50
                            ? ['Add comments explaining your approach', 'Use meaningful variable names', 'Maintain consistent indentation']
                            : ['Readability is acceptable']
                    },
                    {
                        title: '⚡ Efficiency',
                        score: efficiencyScore,
                        feedback: efficiencyScore >= 60
                            ? 'The solution appears efficient with reasonable time/space complexity.'
                            : efficiencyScore >= 30
                                ? 'Consider if there are more efficient approaches or data structures.'
                                : 'Efficiency is a concern. Avoid nested loops where possible.',
                        suggestions: efficiencyScore < 50
                            ? ['Consider using HashMap/Set for O(1) lookups', 'Avoid triple nested loops', 'Think about time complexity']
                            : ['Efficiency is acceptable']
                    }
                ],
                summary: isUnchanged || isEmpty
                    ? '⛔ No solution was provided. Please write your code and run again.'
                    : hasNoImplementation
                        ? '⛔ Your code has no return statement or output. We cannot evaluate a solution without seeing what it produces.'
                        : runtimeErrors.length > 0
                            ? `⚠️ Your code has ${runtimeErrors.length} syntax/runtime error(s) that need to be fixed before proper evaluation.`
                            : !isRelevant && relevantKeywords.length > 0
                                ? '⛔ Your solution does not appear to address the given problem. Please re-read the question.'
                                : overallScore >= 70
                                    ? '✅ Solid solution! Your approach demonstrates good problem-solving skills.'
                                    : overallScore >= 50
                                        ? '⚡ On the right track, but improvements needed. Focus on edge cases and logic completeness.'
                                        : overallScore >= 25
                                            ? '⚠️ Partial solution. The core logic needs more work before this would pass tests.'
                                            : '❌ The solution needs significant improvement. Review the problem requirements.'
            };

            setEvaluationResult(analysis);
            setShowAnalysis(true);

            // Update coding phase score
            setPhaseScores(prev => ({
                ...prev,
                coding: analysis.overallScore
            }));

            // Send feedback to AI agent so it can speak the results
            if (room && room.localParticipant) {
                try {
                    // Collect all suggestions from sections
                    const allSuggestions = analysis.sections
                        .flatMap(s => s.suggestions || [])
                        .filter(s => !s.includes('acceptable') && !s.includes('reasonable'));

                    const feedbackPayload = {
                        type: 'CODE_FEEDBACK',
                        feedback: {
                            score: analysis.overallScore,
                            verdict: analysis.verdict,
                            summary: analysis.summary.replace(/[⛔✅⚡⚠️❌]/g, ''), // Remove emojis for speech
                            suggestions: allSuggestions.slice(0, 4) // Top 4 suggestions
                        }
                    };

                    room.localParticipant.publishData(
                        new TextEncoder().encode(JSON.stringify(feedbackPayload)),
                        { reliable: true }
                    );
                    console.log('[FRONTEND] Sent code feedback to AI agent');

                    // Auto-advance to report after coding evaluation
                    setTimeout(() => {
                        setInterviewPhase('report');
                        room.localParticipant.publishData(
                            new TextEncoder().encode(JSON.stringify({
                                type: 'PHASE_CHANGE',
                                phase: 'report',
                                questionsRequired: 0
                            })),
                            { reliable: true }
                        );
                    }, 3000); // Wait 3 seconds before advancing

                } catch (err) {
                    console.error('[FRONTEND] Failed to send feedback to agent:', err);
                }
            }

        } catch (error) {
            console.error('Code evaluation failed:', error);
            setEvaluationResult({
                overallScore: 0,
                verdict: 'Evaluation Error',
                runtimeErrors: ['Internal error during code analysis'],
                summary: '❌ Unable to analyze code. Please try again.'
            });
            setShowAnalysis(true);
        } finally {
            setIsEvaluating(false);
        }
    };

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

                <div className="flex items-center gap-3">
                    {/* IDE Toggle Button */}
                    <button
                        onClick={() => setShowIDE(!showIDE)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 border relative ${showIDE
                            ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'
                            }`}
                    >
                        <Code className="w-4 h-4" />
                        IDE
                        {/* Show notification dot when there's a new question */}
                        {evaluationResult === null && !showIDE && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        )}
                    </button>

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

            {/* Phase Progress Indicator */}
            <div className="mb-4 px-2">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{PHASE_LABELS[interviewPhase]}</span>
                    <span className="text-xs text-gray-400">
                        Phase {PHASES.indexOf(interviewPhase) + 1} of {PHASES.length}
                    </span>
                </div>
                <div className="flex gap-1">
                    {PHASES.map((phase, index) => (
                        <div
                            key={phase}
                            className={`h-2 flex-1 rounded-full transition-all duration-300 ${index < PHASES.indexOf(interviewPhase)
                                ? 'bg-green-500'
                                : index === PHASES.indexOf(interviewPhase)
                                    ? 'bg-blue-500 animate-pulse'
                                    : 'bg-gray-700'
                                }`}
                            title={PHASE_LABELS[phase]}
                        />
                    ))}
                </div>
                <div className="flex justify-between mt-1 text-[10px] text-gray-500">
                    <span>Intro</span>
                    <span>Resume</span>
                    <span>GitHub</span>
                    <span>Topic</span>
                    <span>Coding</span>
                    <span>Report</span>
                </div>
            </div>

            {/* Main Stage - Discord Grid Layout */}
            <div className="flex-1 flex flex-col justify-center min-h-0 relative z-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full max-h-[80vh]">

                    {/* Agent View (Left/Top) */}
                    <div className="relative w-full h-full min-h-[300px] flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            {agentParticipant ? (
                                <ParticipantTile key="agent" track={agentTrack} participant={agentParticipant} isLocal={false} />
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="w-full max-w-4xl aspect-video rounded-[1.5rem] border border-white/5 bg-[#0a0a0f] flex flex-col items-center justify-center gap-6 relative overflow-hidden group shadow-inner"
                                >
                                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay" />
                                    <div className="relative z-10 flex flex-col items-center gap-4">
                                        <div className="w-24 h-24 rounded-full border border-white/10 bg-black/50 backdrop-blur-md flex items-center justify-center">
                                            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                                        </div>
                                        <div className="text-center">
                                            <h3 className="text-lg font-medium text-white">Connecting to Agent...</h3>
                                            <p className="text-indigo-400/60 text-xs font-mono tracking-widest">ESTABLISHING UPLINK</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* User View (Right/Bottom) */}
                    <div className="relative w-full h-full min-h-[300px] flex items-center justify-center">
                        {room.localParticipant ? (
                            <ParticipantTile track={localTrack} participant={room.localParticipant} isLocal={true} />
                        ) : (
                            <div className="w-full max-w-4xl aspect-video rounded-[1.5rem] bg-[#0a0a0f] border border-white/5 flex items-center justify-center text-gray-500">
                                <Loader2 className="w-8 h-8 animate-spin" />
                            </div>
                        )}
                    </div>
                </div>


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

            {/* Navigation Buttons - Circular with arrows */}
            <div className="fixed bottom-6 right-6 flex items-center gap-3 z-50">
                {/* Next Phase Button (single arrow) - Only show if not in report or coding */}
                {interviewPhase !== 'report' && interviewPhase !== 'coding' && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={advancePhase}
                        className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/40 border border-blue-500/50 flex items-center justify-center text-lg font-bold"
                        title="Next Phase"
                    >
                        →
                    </motion.button>
                )}

                {/* Skip to Report Button (double arrow) - Show if not in report */}
                {interviewPhase !== 'report' && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSkipInterview}
                        className="w-12 h-12 rounded-full bg-yellow-600 hover:bg-yellow-500 text-white shadow-lg shadow-yellow-900/40 border border-yellow-500/50 flex items-center justify-center text-lg font-bold"
                        title="Skip to Report"
                    >
                        ⏭
                    </motion.button>
                )}
            </div>

            {/* Final Report Panel - Shows when interview is complete */}
            <AnimatePresence>
                {interviewPhase === 'report' && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        transition={{ type: "spring", damping: 25 }}
                        className="fixed inset-x-0 bottom-0 z-50 p-6"
                    >
                        <div className="max-w-4xl mx-auto bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-gray-700 rounded-2xl p-6 shadow-2xl">
                            {/* Report Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                        📊 Interview Report
                                    </h2>
                                    <p className="text-sm text-gray-400">Performance Summary</p>
                                </div>
                                <div className="text-right">
                                    <div className={`text-4xl font-bold ${skippedSections ? 'text-red-400' :
                                        calculateFinalScore().score >= 70 ? 'text-green-400' :
                                            calculateFinalScore().score >= 50 ? 'text-yellow-400' : 'text-red-400'
                                        }`}>
                                        {skippedSections ? '0' : calculateFinalScore().score}/100
                                    </div>
                                    {skippedSections && (
                                        <span className="text-xs text-red-400">Skipped Sections</span>
                                    )}
                                </div>
                            </div>

                            {/* Score Breakdown */}
                            <div className="grid grid-cols-4 gap-3 mb-6">
                                {[
                                    { label: 'Resume', score: phaseScores.resume, weight: '15%', icon: '📄' },
                                    { label: 'GitHub', score: phaseScores.github, weight: '15%', icon: '💻' },
                                    { label: 'Topic', score: phaseScores.topic, weight: '25%', icon: '🎯' },
                                    { label: 'Coding', score: phaseScores.coding, weight: '45%', icon: '⌨️' }
                                ].map((phase, i) => (
                                    <div key={i} className="bg-black/30 rounded-lg p-3 text-center">
                                        <div className="text-xl mb-1">{phase.icon}</div>
                                        <div className="text-xs text-gray-400">{phase.label}</div>
                                        <div className={`text-lg font-bold ${phase.score >= 70 ? 'text-green-400' :
                                            phase.score >= 50 ? 'text-yellow-400' : 'text-red-400'
                                            }`}>
                                            {skippedSections ? '-' : phase.score}
                                        </div>
                                        <div className="text-[10px] text-gray-500">({phase.weight})</div>
                                    </div>
                                ))}
                            </div>

                            {/* Strengths, Weaknesses, Improvements */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                {/* Strengths */}
                                <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4">
                                    <h4 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-1">
                                        ✅ Strengths
                                    </h4>
                                    <ul className="text-xs text-gray-300 space-y-1">
                                        {phaseScores.coding >= 60 && <li>• Good problem-solving skills</li>}
                                        {phaseScores.resume >= 50 && <li>• Strong experience background</li>}
                                        {phaseScores.github >= 50 && <li>• Active coding contributions</li>}
                                        {phaseScores.topic >= 60 && <li>• Solid technical knowledge</li>}
                                        {!skippedSections && <li>• Completed full interview</li>}
                                    </ul>
                                </div>

                                {/* Weaknesses */}
                                <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4">
                                    <h4 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-1">
                                        ⚠️ Areas to Work On
                                    </h4>
                                    <ul className="text-xs text-gray-300 space-y-1">
                                        {phaseScores.coding < 50 && <li>• Coding solution quality</li>}
                                        {phaseScores.coding < 70 && <li>• Edge case handling</li>}
                                        {phaseScores.topic < 50 && <li>• Technical depth</li>}
                                        {skippedSections && <li>• Interview completion</li>}
                                    </ul>
                                </div>

                                {/* Improvements */}
                                <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
                                    <h4 className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-1">
                                        💡 Suggestions
                                    </h4>
                                    <ul className="text-xs text-gray-300 space-y-1">
                                        <li>• Practice more algorithms</li>
                                        <li>• Review system design</li>
                                        <li>• Improve code comments</li>
                                        <li>• Work on time management</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Soft Skills */}
                            <div className="bg-black/20 rounded-lg p-4">
                                <h4 className="text-sm font-semibold text-purple-400 mb-3">🎭 Soft Skills Assessment</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Eye Contact - Based on actual camera on time */}
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">👁️</span>
                                        <div className="flex-1">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-gray-400">Eye Contact</span>
                                                <span className="text-gray-300">
                                                    {skippedSections ? 'N/A' :
                                                        getEyeContactScore() >= 80 ? 'Excellent' :
                                                            getEyeContactScore() >= 60 ? 'Good' :
                                                                getEyeContactScore() >= 40 ? 'Fair' :
                                                                    getEyeContactScore() > 0 ? 'Poor' : 'None'}
                                                </span>
                                            </div>
                                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500" style={{ width: `${getEyeContactScore()}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Confidence - Based on mic + camera combined usage */}
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">💪</span>
                                        <div className="flex-1">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-gray-400">Confidence</span>
                                                <span className="text-gray-300">
                                                    {skippedSections ? 'N/A' :
                                                        (getEyeContactScore() + getCommunicationScore()) / 2 >= 70 ? 'High' :
                                                            (getEyeContactScore() + getCommunicationScore()) / 2 >= 40 ? 'Moderate' :
                                                                (getEyeContactScore() + getCommunicationScore()) / 2 > 0 ? 'Low' : 'None'}
                                                </span>
                                            </div>
                                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500" style={{ width: `${Math.round((getEyeContactScore() + getCommunicationScore()) / 2)}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Communication - Based on actual mic on time */}
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">🗣️</span>
                                        <div className="flex-1">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-gray-400">Communication</span>
                                                <span className="text-gray-300">
                                                    {skippedSections ? 'N/A' :
                                                        getCommunicationScore() >= 70 ? 'Active' :
                                                            getCommunicationScore() >= 40 ? 'Moderate' :
                                                                getCommunicationScore() > 0 ? 'Minimal' : 'None'}
                                                </span>
                                            </div>
                                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-green-500 to-teal-500" style={{ width: `${getCommunicationScore()}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Problem Solving - Based on coding score */}
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">🧠</span>
                                        <div className="flex-1">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-gray-400">Problem Solving</span>
                                                <span className="text-gray-300">
                                                    {skippedSections ? 'N/A' :
                                                        phaseScores.coding >= 70 ? 'Strong' :
                                                            phaseScores.coding >= 50 ? 'Good' :
                                                                phaseScores.coding >= 30 ? 'Developing' : 'Needs Work'}
                                                </span>
                                            </div>
                                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-pink-500 to-rose-500" style={{ width: `${phaseScores.coding}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="mt-4 text-center">
                                <button
                                    onClick={() => window.location.href = '/'}
                                    className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-medium transition-all"
                                >
                                    Return to Dashboard
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Assets Panel Overlay */}
            <AnimatePresence>
                {showAssets && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAssets(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-md z-40"
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ x: "100%", opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: "100%", opacity: 0 }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#0a0a0f] border-l border-white/10 p-8 flex flex-col gap-6 z-50 shadow-2xl"
                        >
                            <div className="flex items-center justify-between pb-6 border-b border-white/5">
                                <h3 className="font-display font-bold text-xl flex items-center gap-3 text-white">
                                    <div className="p-2 rounded-lg bg-indigo-500/20">
                                        <FileText className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    Context Assets
                                </h3>
                                <button
                                    onClick={() => setShowAssets(false)}
                                    className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-10 pr-2 custom-scrollbar">
                                <section>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-1.5 h-6 bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
                                        <div>
                                            <h4 className="text-sm font-bold text-white tracking-wide uppercase">Resume Data</h4>
                                            <p className="text-xs text-gray-500 mt-0.5">Upload PDF for AI analysis</p>
                                        </div>
                                    </div>
                                    <ResumeUploader />
                                </section>

                                <section>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-1.5 h-6 bg-purple-600 rounded-full shadow-[0_0_10px_rgba(147,51,234,0.5)]" />
                                        <div>
                                            <h4 className="text-sm font-bold text-white tracking-wide uppercase">GitHub Profile</h4>
                                            <p className="text-xs text-gray-500 mt-0.5">Link repositories for technical context</p>
                                        </div>
                                    </div>
                                    <GithubInput />
                                </section>
                            </div>

                            <div className="pt-6 border-t border-white/5">
                                <p className="text-xs text-center text-gray-600">
                                    Uploaded assets are processed securely in real-time.
                                </p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* IDE Panel */}
            <AnimatePresence>
                {showIDE && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="w-[95%] h-[90%] bg-[#0d1117] border border-gray-700 rounded-lg flex"
                        >
                            {/* Question Panel */}
                            <div className="w-1/3 bg-gray-100 p-6 border-r border-gray-300 rounded-l-lg overflow-y-auto">
                                <h2 className="text-lg font-bold text-gray-800 mb-4">Question</h2>

                                {interviewPhase === 'coding' ? (
                                    // Show actual question only in coding phase
                                    <div className="mb-6">
                                        <h3 className="font-semibold text-gray-800 mb-2">{currentQuestion.title}</h3>
                                        <p className="text-sm text-gray-600 mb-4">
                                            {currentQuestion.description}
                                        </p>

                                        {currentQuestion.examples.length > 0 && (
                                            <div className="space-y-3 text-sm text-gray-600">
                                                {currentQuestion.examples.map((example, index) => (
                                                    <div key={index}>
                                                        <strong>Example {index + 1}:</strong><br />
                                                        <span className="font-mono bg-gray-200 px-1 rounded">Input: {example.input}</span><br />
                                                        <span className="font-mono bg-gray-200 px-1 rounded">Output: {example.output}</span><br />
                                                        {example.explanation && (
                                                            <span className="text-xs">Explanation: {example.explanation}</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {currentQuestion.constraints.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-gray-300">
                                                <h4 className="font-semibold text-gray-800 mb-2">Constraints:</h4>
                                                <ul className="text-xs text-gray-600 space-y-1">
                                                    {currentQuestion.constraints.map((constraint, index) => (
                                                        <li key={index}>• {constraint}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    // Show placeholder for non-coding phases
                                    <div className="flex flex-col items-center justify-center h-64 text-center">
                                        <div className="text-6xl mb-4">🔒</div>
                                        <h3 className="text-lg font-semibold text-gray-500 mb-2">
                                            Available Only in Coding Round
                                        </h3>
                                        <p className="text-sm text-gray-400 max-w-xs">
                                            Complete the {PHASE_LABELS[interviewPhase]} phase first.
                                            The coding question will appear when you reach the Coding Round.
                                        </p>
                                        <div className="mt-4 px-4 py-2 bg-gray-200 rounded-full text-xs text-gray-500">
                                            Current Phase: {PHASE_LABELS[interviewPhase]}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Code Editor */}
                            <div className="flex-1 bg-[#0d1117] text-white p-4 flex flex-col">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-sm font-semibold text-gray-300">Solution</h3>
                                    <button
                                        onClick={() => setShowIDE(false)}
                                        className="text-gray-400 hover:text-white transition-colors text-xl"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {interviewPhase === 'coding' ? (
                                    <textarea
                                        value={codeContent}
                                        onChange={(e) => setCodeContent(e.target.value)}
                                        className="flex-1 bg-[#161b22] border border-gray-700 rounded p-4 font-mono text-sm text-white resize-none focus:outline-none focus:border-blue-500 overflow-auto"
                                        spellCheck={false}
                                        placeholder="Write your solution here..."
                                    />
                                ) : (
                                    <div className="flex-1 bg-[#161b22] border border-gray-700 rounded p-4 flex flex-col items-center justify-center text-center">
                                        <div className="text-4xl mb-3">⏳</div>
                                        <p className="text-gray-400 text-sm">Code editor will be available</p>
                                        <p className="text-gray-400 text-sm">during the Coding Round</p>
                                    </div>
                                )}

                                {/* Run Code Button Only */}
                                <div className="mt-4">
                                    <button
                                        onClick={() => interviewPhase === 'coding' && evaluateCode(codeContent)}
                                        disabled={isEvaluating || interviewPhase !== 'coding'}
                                        className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${interviewPhase === 'coding'
                                            ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white'
                                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                            }`}
                                    >
                                        {isEvaluating ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Analyzing Code...
                                            </>
                                        ) : interviewPhase !== 'coding' ? (
                                            '🔒 Run Code'
                                        ) : (
                                            '▶ Run Code'
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Scoring Info Panel */}
                            <div className="w-56 bg-gray-900 p-4 border-l border-gray-700 rounded-r-lg flex flex-col gap-3 overflow-y-auto">
                                {/* Header */}
                                <div className="text-center pb-3 border-b border-gray-700">
                                    <span className="text-lg">📊</span>
                                    <h3 className="text-sm font-bold text-white mt-1">Scoring System</h3>
                                </div>

                                {/* Weighted Scores */}
                                <div className="bg-gray-800 rounded-lg p-3">
                                    <h4 className="text-xs font-semibold text-blue-400 mb-2">Score Weights</h4>
                                    <div className="space-y-1.5 text-xs">
                                        <div className="flex justify-between text-gray-300">
                                            <span>Logic</span>
                                            <span className="text-blue-400 font-mono">35%</span>
                                        </div>
                                        <div className="flex justify-between text-gray-300">
                                            <span>Edge Cases</span>
                                            <span className="text-blue-400 font-mono">20%</span>
                                        </div>
                                        <div className="flex justify-between text-gray-300">
                                            <span>Efficiency</span>
                                            <span className="text-blue-400 font-mono">20%</span>
                                        </div>
                                        <div className="flex justify-between text-gray-300">
                                            <span>Readability</span>
                                            <span className="text-blue-400 font-mono">15%</span>
                                        </div>
                                        <div className="flex justify-between text-gray-300">
                                            <span>No Errors</span>
                                            <span className="text-blue-400 font-mono">10%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Strict Rules */}
                                <div className="bg-gray-800 rounded-lg p-3">
                                    <h4 className="text-xs font-semibold text-red-400 mb-2">Strict Rules</h4>
                                    <ul className="space-y-1 text-xs text-gray-400">
                                        <li className="flex items-start gap-1">
                                            <span className="text-red-500">•</span>
                                            <span>Empty code = 0 pts</span>
                                        </li>
                                        <li className="flex items-start gap-1">
                                            <span className="text-red-500">•</span>
                                            <span>No return = 5 pts</span>
                                        </li>
                                        <li className="flex items-start gap-1">
                                            <span className="text-red-500">•</span>
                                            <span>Errors = -50% penalty</span>
                                        </li>
                                        <li className="flex items-start gap-1">
                                            <span className="text-red-500">•</span>
                                            <span>Irrelevant = 10 pts</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* Tips */}
                                <div className="bg-gray-800 rounded-lg p-3">
                                    <h4 className="text-xs font-semibold text-green-400 mb-2">Pro Tips</h4>
                                    <ul className="space-y-1 text-xs text-gray-400">
                                        <li>✓ Add return statement</li>
                                        <li>✓ Handle edge cases</li>
                                        <li>✓ Add comments</li>
                                        <li>✓ Check brackets</li>
                                    </ul>
                                </div>

                                {/* Close Button */}
                                <button
                                    onClick={() => setShowIDE(false)}
                                    className="mt-auto px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-medium transition-colors"
                                >
                                    Close IDE
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* AI Analysis Popup */}
            <AnimatePresence>
                {showAnalysis && evaluationResult && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
                        onClick={() => setShowAnalysis(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0, y: 50 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="w-full max-w-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-1">Code Analysis</h2>
                                    <p className="text-sm text-gray-400">AI-powered feedback on your solution</p>
                                </div>
                                <button
                                    onClick={() => setShowAnalysis(false)}
                                    className="text-gray-400 hover:text-white transition-colors text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            {/* Overall Score */}
                            <div className="flex items-center gap-6 mb-6 p-4 bg-black/30 rounded-xl">
                                <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold border-4 ${evaluationResult.overallScore >= 70 ? 'border-green-500 text-green-400' :
                                    evaluationResult.overallScore >= 50 ? 'border-yellow-500 text-yellow-400' :
                                        'border-red-500 text-red-400'
                                    }`}>
                                    {evaluationResult.overallScore}
                                </div>
                                <div>
                                    <div className={`text-xl font-semibold ${evaluationResult.overallScore >= 70 ? 'text-green-400' :
                                        evaluationResult.overallScore >= 50 ? 'text-yellow-400' :
                                            'text-red-400'
                                        }`}>
                                        {evaluationResult.verdict}
                                    </div>
                                    <p className="text-gray-300 text-sm mt-1">{evaluationResult.summary}</p>
                                </div>
                            </div>

                            {/* Runtime Errors Alert */}
                            {evaluationResult.runtimeErrors && evaluationResult.runtimeErrors.length > 0 && (
                                <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-red-400 text-lg">⚠️</span>
                                        <h3 className="text-red-400 font-semibold">Runtime Errors Detected</h3>
                                    </div>
                                    <ul className="space-y-2">
                                        {evaluationResult.runtimeErrors.map((error, index) => (
                                            <li key={index} className="flex items-start gap-2 text-sm text-red-300">
                                                <span className="text-red-500 mt-0.5">•</span>
                                                <span>{error}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <p className="text-xs text-red-400/70 mt-3">Fix these errors before your solution can be properly evaluated.</p>
                                </div>
                            )}

                            {/* Detailed Sections */}
                            {evaluationResult.sections && (
                                <div className="space-y-4">
                                    {evaluationResult.sections.map((section, index) => (
                                        <div key={index} className="bg-black/20 rounded-xl p-4 border border-gray-700/50">
                                            <div className="flex justify-between items-center mb-3">
                                                <h3 className="text-white font-semibold">{section.title}</h3>
                                                <div className={`px-3 py-1 rounded-full text-xs font-medium ${section.score >= 70 ? 'bg-green-500/20 text-green-400' :
                                                    section.score >= 50 ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-red-500/20 text-red-400'
                                                    }`}>
                                                    {section.score}/100
                                                </div>
                                            </div>
                                            <p className="text-gray-300 text-sm mb-3">{section.feedback}</p>
                                            {section.suggestions && section.suggestions.length > 0 && (
                                                <div className="space-y-1">
                                                    {section.suggestions.map((suggestion, sIdx) => (
                                                        <div key={sIdx} className="flex items-start gap-2 text-xs text-gray-400">
                                                            <span className="text-blue-400">→</span>
                                                            <span>{suggestion}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Close Button */}
                            <button
                                onClick={() => setShowAnalysis(false)}
                                className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium transition-all"
                            >
                                Continue Coding
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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