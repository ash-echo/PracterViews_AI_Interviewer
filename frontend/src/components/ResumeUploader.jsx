import React, { useState } from 'react';
import { useRoomContext } from '@livekit/components-react';
import { FileText, Upload, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

// Import pdfjs-dist
import * as pdfjsLib from 'pdfjs-dist';

// Use matching worker version from unpkg (v5.4.449)
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
        for (let i = 1; i <= pdf.numPages; i++) {
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
                content: text.substring(0, 8000) // Limit size
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

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <FileText className="w-4 h-4 text-indigo-400" />
                Resume
            </div>

            <label className={`
                relative flex flex-col items-center justify-center p-6 
                border-2 border-dashed rounded-xl cursor-pointer
                transition-all duration-200
                ${status === 'success'
                    ? 'border-green-500/50 bg-green-500/5'
                    : status === 'error'
                        ? 'border-red-500/50 bg-red-500/5'
                        : 'border-white/10 bg-white/5 hover:border-indigo-500/50 hover:bg-indigo-500/5'}
            `}>
                <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={status === 'loading'}
                />

                {status === 'idle' && (
                    <>
                        <Upload className="w-8 h-8 text-gray-500 mb-2" />
                        <span className="text-sm text-gray-400">Upload PDF Resume</span>
                        <span className="text-xs text-gray-500 mt-1">Click or drag file</span>
                    </>
                )}

                {status === 'loading' && (
                    <>
                        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-2" />
                        <span className="text-sm text-gray-400">Processing {fileName}...</span>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                        <span className="text-sm text-green-400">{fileName}</span>
                        <span className="text-xs text-gray-500 mt-1">Resume sent to interviewer</span>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                        <span className="text-sm text-red-400">{error}</span>
                        <span className="text-xs text-gray-500 mt-1">Click to try again</span>
                    </>
                )}
            </label>
        </div>
    );
};

export default ResumeUploader;
