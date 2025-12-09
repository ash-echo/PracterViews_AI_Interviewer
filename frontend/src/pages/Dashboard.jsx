import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Code, Layers, Smartphone, Layout, User, Sparkles, ArrowRight, Trophy,
    Zap, Terminal, Cpu, GitBranch, Command, Activity, Radio
} from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const TiltCard = ({ children, className, onClick, delay = 0 }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseXFromCenter = e.clientX - rect.left - width / 2;
        const mouseYFromCenter = e.clientY - rect.top - height / 2;
        x.set(mouseXFromCenter / width);
        y.set(mouseYFromCenter / height);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay, type: "spring" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            className={`relative group ${className}`}
        >
            <div
                style={{ transform: "translateZ(50px)", transformStyle: "preserve-3d" }}
                className="relative h-full bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden"
            >
                {/* Border Beam Effect */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute inset-[-100%] animate-[spin_4s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[conic-gradient(from_90deg_at_50%_50%,#00000000_50%,#6366f1_50%,#00000000)]" />
                </div>

                {/* Content Mask to hide spinning border center */}
                <div className="absolute inset-[1px] bg-[#0a0a0a]/90 rounded-[23px] z-0" />

                <div className="relative z-10 h-full p-6 flex flex-col justify-between transform transition-transform group-hover:translate-z-10">
                    {children}
                </div>
            </div>
        </motion.div>
    );
};

const Dashboard = () => {
    const navigate = useNavigate();

    const interviews = [
        {
            id: 'frontend',
            title: 'Frontend Architect',
            icon: <Layout className="w-6 h-6" />,
            description: "React, CSS, Accessibility, & Performance.",
            tech: ['React', 'CSS', 'a11y'],
            color: "text-cyan-400",
            delay: 0.1,
            colSpan: "md:col-span-2 lg:col-span-1"
        },
        {
            id: 'backend',
            title: 'Backend Systems',
            icon: <Terminal className="w-6 h-6" />,
            description: "Distributed systems, DBs, & API design.",
            tech: ['Node', 'SQL'],
            color: "text-emerald-400",
            delay: 0.2,
            colSpan: "md:col-span-1"
        },
        {
            id: 'fullstack',
            title: 'Full Stack',
            icon: <Layers className="w-6 h-6" />,
            description: "End-to-end architecture & integration.",
            tech: ['MERN', 'Next.js'],
            color: "text-violet-400",
            delay: 0.3,
            colSpan: "md:col-span-1"
        },
        {
            id: 'devops',
            title: 'DevOps & Cloud',
            icon: <Cpu className="w-6 h-6" />,
            description: "CI/CD, Kubernetes, AWS infrastructure.",
            tech: ['Docker', 'AWS'],
            color: "text-amber-400",
            delay: 0.4,
            colSpan: "md:col-span-1"
        },
        {
            id: 'aiml',
            title: 'AI Engineering',
            icon: <Sparkles className="w-6 h-6" />,
            description: "LLMs, RAG pipelines, & Model tuning.",
            tech: ['Python', 'PyTorch'],
            color: "text-pink-400",
            delay: 0.5,
            colSpan: "md:col-span-2 lg:col-span-1"
        },
        {
            id: 'hr',
            title: 'Behavioral',
            icon: <User className="w-6 h-6" />,
            description: "Leadership, conflict resolution & culture.",
            tech: ['Soft Skills'],
            color: "text-yellow-400",
            delay: 0.6,
            colSpan: "md:col-span-1"
        },
        {
            id: 'hackathon',
            title: 'Hackathon Mode',
            icon: <Trophy className="w-6 h-6" />,
            description: "Rapid prototyping pitch & demo validation.",
            tech: ['Pitch', 'MVP'],
            color: "text-indigo-400",
            delay: 0.7,
            colSpan: "md:col-span-3 lg:col-span-1"
        }
    ];

    return (
        <div className="min-h-screen bg-[#030014] text-foreground p-6 md:p-12 font-sans selection:bg-purple-500/50 relative overflow-hidden perspective-container">

            {/* 3D Grid & Ambient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="perspective-grid" />
                <div className="absolute top-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[150px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[150px] animate-pulse-slow delay-1000" />
            </div>

            <main className="max-w-7xl mx-auto relative z-10">
                {/* HUD Header */}
                <header className="flex justify-between items-center mb-16 md:mb-24 animate-enter border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center relative group overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 opacity-20 group-hover:opacity-40 transition-opacity" />
                            <Zap className="w-5 h-5 text-indigo-400 fill-current" />
                        </div>
                        <h1 className="text-2xl font-display font-bold tracking-tight text-white">
                            Practer<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Views</span>
                        </h1>
                    </div>

                    <div className="hidden md:flex items-center gap-6 text-xs font-mono text-muted uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                            <Activity className="w-3 h-3 text-green-500" />
                            <span>System Core: Online</span>
                        </div>
                        <div className="w-px h-4 bg-white/10" />
                        <div className="flex items-center gap-2">
                            <Radio className="w-3 h-3 text-indigo-500 animate-pulse" />
                            <span>Latency: 12ms</span>
                        </div>
                    </div>
                </header>

                {/* Cyberpunk Hero Section */}
                <section className="mb-24 relative">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-mono text-indigo-300 mb-8"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                        V2.0 SYSTEM ONLINE
                    </motion.div>

                    <h2 className="text-6xl md:text-8xl font-display font-bold mb-8 tracking-tighter leading-[0.9]">
                        CRACK THE <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-white/50 animate-text-shimmer bg-[length:200%_auto]">
                            INTERVIEW CODE.
                        </span>
                    </h2>

                    <p className="text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed mb-10 border-l-2 border-indigo-500/50 pl-6">
                        Advanced simulation environment for technical excellence.
                        Engage with AI avatars trained on top-tier engineering data.
                    </p>

                    <motion.button
                        onClick={() => navigate('/interview/general')}
                        whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(99, 102, 241, 0.4)" }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative px-8 py-4 bg-white text-black rounded-lg font-bold text-lg overflow-hidden tracking-wide"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            INITIALIZE SEQUENCE
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.button>
                </section>

                {/* 3D Bento Grid */}
                <section>
                    <div className="flex items-end justify-between mb-8">
                        <h3 className="text-xl font-mono text-indigo-400/80 uppercase tracking-widest">Select Protocol</h3>
                        <div className="hidden md:block h-px w-64 bg-gradient-to-l from-transparent to-indigo-500/30" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 perspective-container">
                        {interviews.map((item, idx) => (
                            <TiltCard
                                key={item.id}
                                className={`cursor-pointer ${item.colSpan}`}
                                delay={0.2 + (idx * 0.1)}
                                onClick={() => navigate(`/interview/${item.id}`)}
                            >
                                <div className="mb-6 relative z-10">
                                    <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform duration-500">
                                        {React.cloneElement(item.icon, { className: `w-6 h-6 ${item.color}` })}
                                    </div>
                                    <h4 className="text-2xl font-bold mb-2 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-indigo-300 transition-all font-display">
                                        {item.title}
                                    </h4>
                                    <p className="text-sm text-gray-400 leading-relaxed font-light">
                                        {item.description}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between border-t border-white/5 pt-4 z-10 relative">
                                    <div className="flex -space-x-2">
                                        {item.tech.map((t, i) => (
                                            <div key={i} className="w-7 h-7 rounded-full bg-[#15151a] border border-white/10 flex items-center justify-center text-[10px] text-gray-400 font-mono" title={t}>
                                                {t[0]}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-2 rounded-full bg-white/5 group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </TiltCard>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Dashboard;
