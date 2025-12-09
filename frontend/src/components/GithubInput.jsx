import React, { useState } from 'react';
import { useRoomContext } from '@livekit/components-react';
import { Github, Send, CheckCircle, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const GithubInput = () => {
    const room = useRoomContext();
    const [username, setUsername] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [error, setError] = useState('');

    const extractUsername = (input) => {
        // Handle full URLs like https://github.com/username or just username
        const trimmed = input.trim().replace(/\/$/, '');
        const match = trimmed.match(/github\.com\/([^\/]+)/);
        return match ? match[1] : trimmed;
    };

    const fetchGitHubData = async () => {
        if (!username.trim()) {
            setError('Please enter a username');
            setStatus('error');
            return;
        }

        const cleanUsername = extractUsername(username);
        setStatus('loading');
        setError('');

        try {
            // Fetch public repos
            const response = await fetch(`https://api.github.com/users/${cleanUsername}/repos?per_page=10&sort=updated`);

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('User not found');
                }
                throw new Error('Failed to fetch data');
            }

            const repos = await response.json();

            // Create a summary
            const summary = repos.map(repo => ({
                name: repo.name,
                description: repo.description || 'No description',
                language: repo.language || 'Not specified',
                stars: repo.stargazers_count,
                url: repo.html_url
            }));

            const summaryText = `GitHub Username: ${cleanUsername}
Top Repositories:
${summary.map((r, i) => `${i + 1}. ${r.name} (${r.language}) - ${r.description} [${r.stars} stars]`).join('\n')}`;

            // Send to backend agent via LiveKit data channel
            const payload = JSON.stringify({
                type: 'GITHUB_DATA',
                content: summaryText
            });

            await room.localParticipant.publishData(
                new TextEncoder().encode(payload),
                { reliable: true }
            );

            console.log('[GithubInput] Sent GitHub data to agent');
            setStatus('success');

        } catch (err) {
            console.error('[GithubInput] Error:', err);
            setError(err.message || 'Fetch failed');
            setStatus('error');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            fetchGitHubData();
        }
    };

    return (
        <div className="space-y-4">
            <div className="relative group">
                <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                        setUsername(e.target.value);
                        if (status === 'error') setStatus('idle');
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="github.com/username"
                    disabled={status === 'loading' || status === 'success'}
                    className={`
                        w-full pl-11 pr-12 py-3.5 rounded-xl text-sm font-medium
                        bg-white/5 border transition-all duration-300
                        placeholder:text-muted focus:outline-none
                        ${status === 'success'
                            ? 'border-green-500/50 text-green-400 bg-green-500/10'
                            : status === 'error'
                                ? 'border-red-500/50 text-red-400 bg-red-500/10'
                                : 'border-white/10 focus:border-primary/50 focus:bg-white/10'}
                    `}
                />

                <Github className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${status === 'error' ? 'text-red-400' : 'text-muted group-focus-within:text-foreground'}`} />

                <button
                    onClick={fetchGitHubData}
                    disabled={status === 'loading' || status === 'success' || !username}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors hover:bg-white/10 disabled:opacity-50 disabled:hover:bg-transparent"
                >
                    {status === 'loading' ? (
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    ) : status === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                        <div className={`p-1.5 rounded-md ${username ? 'bg-primary text-white' : 'text-muted'}`}>
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    )}
                </button>
            </div>

            {status === 'error' && (
                <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-xs text-red-400 px-1"
                >
                    <AlertCircle className="w-3 h-3" />
                    {error}
                </motion.div>
            )}

            {status === 'success' && (
                <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-xs text-green-400 px-1"
                >
                    <CheckCircle className="w-3 h-3" />
                    <span>Profile successfully linked to context.</span>
                </motion.div>
            )}
        </div>
    );
};

export default GithubInput;
