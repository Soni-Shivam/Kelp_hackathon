'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePresentationStore } from '@/lib/store/presentation-store';
import { Sparkles, ArrowRight, Loader2, Code2, X, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

export default function DashboardPage() {
    const router = useRouter();
    const [companyInput, setCompanyInput] = useState('');
    const [mdContent, setMdContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationStatus, setGenerationStatus] = useState('');
    const [showDevMode, setShowDevMode] = useState(false);
    const [jsonInput, setJsonInput] = useState('');
    const { showToast } = useToast();

    const {
        setPresentation,
        startLoading,
        finishLoading
    } = usePresentationStore();

    const handleGenerate = async () => {
        if (!companyInput.trim() || !mdContent.trim()) {
            showToast('Please provide both Company Name and OnePager Content', 'error');
            return;
        }

        setIsGenerating(true);
        startLoading();
        setGenerationStatus('Initializing Agents...');

        try {
            // Step 1: Data Agent
            setGenerationStatus('Ingesting & Analyzing Data (Data Agent)...');
            const dataResponse = await fetch('http://localhost:8000/trigger-agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    company_name: companyInput,
                    md_content: mdContent
                })
            });

            if (!dataResponse.ok) throw new Error('Data Agent Failed');
            const apiData = await dataResponse.json();

            // Step 2: Transcriber Agent
            setGenerationStatus('Synthesizing Slides (Transcriber Agent)...');
            const transcriberResponse = await fetch('http://localhost:8001/generate_from_data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiData)
            });

            if (!transcriberResponse.ok) throw new Error('Transcriber Agent Failed');
            const presentationJson = await transcriberResponse.json();

            if (!presentationJson.slides) {
                throw new Error("Invalid format received from agent");
            }

            setPresentation(presentationJson);
            showToast('Presentation Generated Successfully!', 'success');
            finishLoading();
            router.push('/editor');

        } catch (error) {
            console.error(error);
            showToast(`Generation Failed: ${error}`, 'error');
            setIsGenerating(false);
            finishLoading();
        }
    };

    const handleDevModeSubmit = () => {
        try {
            const parsed = JSON.parse(jsonInput);
            if (!parsed.project_code_name || !parsed.slides || !Array.isArray(parsed.slides)) {
                throw new Error('Invalid presentation format.');
            }
            setPresentation(parsed);
            showToast('Presentation loaded successfully!', 'success');
            router.push('/editor');
        } catch (error) {
            showToast(`Invalid JSON: ${error instanceof Error ? error.message : 'Parse error'}`, 'error');
        }
    };

    return (
        <div className="min-h-screen bg-kelp-bg-app flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl text-center space-y-8">

                {/* Hero Header */}
                <div className="space-y-4">
                    <div className="inline-flex items-center justify-center p-3 bg-white rounded-full shadow-sm mb-4">
                        <Sparkles className="h-6 w-6 text-kelp-accent-start mr-2" />
                        <span className="font-bold text-kelp-primary tracking-widest">KELP INTELLIGENCE</span>
                    </div>
                    <h1 className="text-5xl font-bold text-kelp-primary tracking-tight">
                        Automated Deal Flow
                    </h1>
                    <p className="text-xl text-slate-500 max-w-lg mx-auto">
                        Generate consulting-grade pitch decks from a single company name in seconds.
                    </p>
                </div>

                {/* Dev Mode Modal */}
                {showDevMode && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                            <div className="flex items-center justify-between p-4 border-b border-slate-200">
                                <div className="flex items-center gap-2">
                                    <Code2 className="h-5 w-5 text-kelp-accent-start" />
                                    <h2 className="font-bold text-lg text-slate-800">Dev Mode: JSON Input</h2>
                                </div>
                                <button onClick={() => setShowDevMode(false)} className="p-1 hover:bg-slate-100 rounded-md">
                                    <X className="h-5 w-5 text-slate-500" />
                                </button>
                            </div>
                            <div className="p-4 flex-1 overflow-hidden">
                                <textarea
                                    className="w-full h-64 p-3 border border-slate-200 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-kelp-accent-start/50"
                                    placeholder='{"project_code_name": "My Project", ...}'
                                    value={jsonInput}
                                    onChange={(e) => setJsonInput(e.target.value)}
                                />
                            </div>
                            <div className="p-4 border-t border-slate-200 flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setShowDevMode(false)}>Cancel</Button>
                                <Button variant="gradient" onClick={handleDevModeSubmit} disabled={!jsonInput.trim()}>
                                    Load Presentation <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Input & Action */}
                {!isGenerating ? (
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 max-w-xl mx-auto space-y-4 text-left">

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Company Name</label>
                            <Input
                                placeholder="e.g. Kalyani Forge Ltd"
                                className="h-12 text-lg"
                                value={companyInput}
                                onChange={(e) => setCompanyInput(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-2">
                                <FileText className="h-4 w-4" /> Company OnePager (Markdown)
                            </label>
                            <textarea
                                className="w-full min-h-[150px] p-3 border border-slate-200 rounded-md text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kelp-accent-start/50 resize-y"
                                placeholder="# Company Overview..."
                                value={mdContent}
                                onChange={(e) => setMdContent(e.target.value)}
                            />
                        </div>

                        <Button
                            size="lg"
                            variant="gradient"
                            className="w-full h-12 font-bold text-md mt-2"
                            onClick={handleGenerate}
                            disabled={!companyInput.trim() || !mdContent.trim()}
                        >
                            <Sparkles className="mr-2 h-5 w-5" />
                            Generate Presentation
                        </Button>
                    </div>
                ) : (
                    <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 max-w-lg mx-auto w-full">
                        <div className="flex flex-col items-center space-y-4">
                            <Loader2 className="h-10 w-10 text-kelp-accent-start animate-spin" />
                            <h3 className="text-xl font-bold text-kelp-primary animate-pulse text-center">{generationStatus}</h3>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-kelp-accent-start to-kelp-accent-end animate-progress origin-left w-full transition-all duration-1000" />
                            </div>
                            <p className="text-sm text-slate-500">This may take up to 2 minutes</p>
                        </div>
                    </div>
                )}

                {/* Dev Mode Toggle */}
                <button
                    onClick={() => setShowDevMode(true)}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-kelp-accent-start transition-colors mt-4"
                >
                    <Code2 className="h-3.5 w-3.5" />
                    Dev Mode: Load JSON
                </button>

            </div>
            <div className="fixed bottom-4 text-xs text-slate-400">
                Strictly Private & Confidential | © 2026 Kelp
            </div>
        </div>
    );
}
