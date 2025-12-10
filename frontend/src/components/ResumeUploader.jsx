import React, { useState } from 'react';
import { useRoomContext } from '@livekit/components-react';
import { FileText, Upload, CheckCircle, Loader2, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import pdfjs-dist
import * as pdfjsLib from 'pdfjs-dist';

// Use matches worker version from unpkg (v5.4.449)
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.4.449/build/pdf.worker.min.mjs';

const ResumeUploader = () => {
    const room = useRoomContext();
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [fileName, setFileName] = useState('');
    const [error, setError] = useState('');

    const extractTextFromPDF = async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let fullText = '';
        const maxPages = Math.min(pdf.numPages, 5); // Limit to first 5 pages for performance

        for (let i = 1; i <= maxPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
        }

        return fullText.trim();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.includes('pdf')) {
            setError('Please upload a PDF file');
            setStatus('error');
            return;
        }

        setFileName(file.name);
        setStatus('loading');
        setError('');

        try {
            const text = await extractTextFromPDF(file);

            if (!text || text.length < 50) {
                throw new Error('Could not extract meaningful text from PDF');
            }

            // Send to backend agent via LiveKit data channel
            const payload = JSON.stringify({
                type: 'RESUME_DATA',
                content: text.substring(0, 15000) // Limit size
            });

            await room.localParticipant.publishData(
                new TextEncoder().encode(payload),
                { reliable: true }
            );

            console.log('[ResumeUploader] Sent resume data to agent');
            setStatus('success');

        } catch (err) {
            console.error('[ResumeUploader] Error:', err);
            setError(err.message || 'Failed to process PDF');
            setStatus('error');
        }
    };

    const resetUpload = (e) => {
        e.preventDefault();
        setStatus('idle');
        setFileName('');
        setError('');
    };

    return (
        <div className="space-y-4">
            <label
                className={`
                    relative group flex flex-col items-center justify-center p-8 
                    border-2 border-dashed rounded-2xl cursor-pointer
                    transition-all duration-300 ease-out overflow-hidden
                    ${status === 'success'
                        ? 'border-green-500/50 bg-green-500/10'
                        : status === 'error'
                            ? 'border-red-500/50 bg-red-500/10'
                            : 'border-white/10 bg-white/5 hover:border-primary/50 hover:bg-primary/5'}
                `}
            >
                <div className={`absolute inset-0 bg-gradient-to-br from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

                <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={status === 'loading' || status === 'success'}
                />

                <AnimatePresence mode="wait">
                    {status === 'idle' && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex flex-col items-center gap-3"
                        >
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                                <Upload className="w-5 h-5 text-muted group-hover:text-primary transition-colors" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">Click to upload PDF</p>
                                <p className="text-xs text-muted mt-1">Max 5MB</p>
                            </div>
                        </motion.div>
                    )}

                    {status === 'loading' && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-3"
                        >
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            <p className="text-sm text-muted animate-pulse">Processing {fileName}...</p>
                        </motion.div>
                    )}

                    {status === 'success' && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center gap-2 relative z-20"
                        >
                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mb-1">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                            </div>
                            <p className="text-sm font-medium text-green-400 text-center max-w-[200px] truncate">{fileName}</p>
                            <p className="text-xs text-green-500/70">Analyzed & Injected</p>

                            <button
                                onClick={resetUpload}
                                className="mt-2 text-xs text-muted hover:text-white underline underline-offset-2 z-30 relative"
                            >
                                Upload different file
                            </button>
                        </motion.div>
                    )}

                    {status === 'error' && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center gap-2 text-center"
                        >
                            <AlertCircle className="w-8 h-8 text-red-500" />
                            <p className="text-sm text-red-400 max-w-[200px]">{error}</p>
                            <button onClick={resetUpload} className="text-xs text-white/50 hover:text-white mt-1 z-20 relative">Try Again</button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </label>
        </div>
    );
};

export default ResumeUploader;
