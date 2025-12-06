import React, { useState } from 'react';
import { useRoomContext } from '@livekit/components-react';
import { Github, Send, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

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
            setError('Please enter a GitHub username or URL');
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
                    throw new Error('GitHub user not found');
                }
                throw new Error('Failed to fetch GitHub data');
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
            setError(err.message || 'Failed to fetch GitHub data');
            setStatus('error');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            fetchGitHubData();
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <Github className="w-4 h-4 text-indigo-400" />
                GitHub Profile
            </div>

            <div className="flex gap-2">
                <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                        setUsername(e.target.value);
                        if (status === 'error') setStatus('idle');
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="username or github.com/username"
                    disabled={status === 'loading' || status === 'success'}
                    className={`
                        flex-1 px-4 py-3 rounded-xl text-sm
                        bg-white/5 border transition-all
                        placeholder:text-gray-500 focus:outline-none
                        ${status === 'success'
                            ? 'border-green-500/50 text-green-400'
                            : status === 'error'
                                ? 'border-red-500/50 text-red-400'
                                : 'border-white/10 focus:border-indigo-500/50'}
                    `}
                />

                <button
                    onClick={fetchGitHubData}
                    disabled={status === 'loading' || status === 'success'}
                    className={`
                        p-3 rounded-xl transition-all
                        ${status === 'success'
                            ? 'bg-green-500/20 text-green-400'
                            : status === 'loading'
                                ? 'bg-white/5 text-gray-500'
                                : 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30'}
                    `}
                >
                    {status === 'loading' ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : status === 'success' ? (
                        <CheckCircle className="w-5 h-5" />
                    ) : (
                        <Send className="w-5 h-5" />
                    )}
                </button>
            </div>

            {status === 'error' && (
                <div className="flex items-center gap-2 text-xs text-red-400">
                    <AlertCircle className="w-3 h-3" />
                    {error}
                </div>
            )}

            {status === 'success' && (
                <div className="flex items-center gap-2 text-xs text-green-400">
                    <CheckCircle className="w-3 h-3" />
                    GitHub profile sent to interviewer
                </div>
            )}
        </div>
    );
};

export default GithubInput;
