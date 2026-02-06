'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateMockPresentation, simulateResearch } from '@/lib/mock-service';
import { usePresentationStore } from '@/lib/store/presentation-store';
import { Sparkles, ArrowRight, Loader2, Code2, X } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

export default function DashboardPage() {
    const router = useRouter();
    const [companyInput, setCompanyInput] = useState('');
    const [isSimulating, setIsSimulating] = useState(false);
    const [showDevMode, setShowDevMode] = useState(false);
    const [jsonInput, setJsonInput] = useState('');
    const { showToast } = useToast();

    const {
        setPresentation,
        startLoading,
        setLoadingStep,
        loadingStep,
        finishLoading
    } = usePresentationStore();

    const handleGenerate = async () => {
        if (!companyInput.trim()) return;

        setIsSimulating(true);
        startLoading();

        // 1. Simulate Research Steps
        await simulateResearch(companyInput, (step) => setLoadingStep(step));

        // 2. Generate Data
        const mockData = await generateMockPresentation(companyInput);
        setPresentation(mockData);

        // 3. Finish and Navigate
        finishLoading();
        setIsSimulating(false);
        router.push('/outline');
    };

    const handleDevModeSubmit = () => {
        try {
            const parsed = JSON.parse(jsonInput);

            // Basic validation
            if (!parsed.project_code_name || !parsed.slides || !Array.isArray(parsed.slides)) {
                throw new Error('Invalid presentation format. Must have project_code_name and slides array.');
            }

            setPresentation(parsed);
            showToast('Presentation loaded successfully!', 'success');
            router.push('/outline');
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
                                <button
                                    onClick={() => setShowDevMode(false)}
                                    className="p-1 hover:bg-slate-100 rounded-md transition-colors"
                                >
                                    <X className="h-5 w-5 text-slate-500" />
                                </button>
                            </div>

                            <div className="p-4 flex-1 overflow-hidden">
                                <p className="text-sm text-slate-500 mb-3">
                                    Paste your presentation JSON below. Must have <code className="bg-slate-100 px-1 rounded">project_code_name</code> and <code className="bg-slate-100 px-1 rounded">slides</code> array.
                                </p>
                                <textarea
                                    className="w-full h-64 p-3 border border-slate-200 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-kelp-accent-start/50"
                                    placeholder='{"project_code_name": "My Project", "sector": "Tech", "slides": [...]}'
                                    value={jsonInput}
                                    onChange={(e) => setJsonInput(e.target.value)}
                                />
                            </div>

                            <div className="p-4 border-t border-slate-200 flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setShowDevMode(false)}>
                                    Cancel
                                </Button>
                                <Button variant="gradient" onClick={handleDevModeSubmit} disabled={!jsonInput.trim()}>
                                    Load Presentation
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Input & Action */}
                {!isSimulating ? (
                    <div className="bg-white p-2 rounded-xl shadow-lg border border-slate-200 flex items-center gap-2 max-w-lg mx-auto transition-all focus-within:ring-2 focus-within:ring-kelp-accent-start/50">
                        <Input
                            placeholder="Enter Target Company Name (e.g. Acme Corp)..."
                            className="border-0 shadow-none text-lg h-14 bg-transparent focus-visible:ring-0"
                            value={companyInput}
                            onChange={(e) => setCompanyInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        />
                        <Button
                            size="lg"
                            variant="gradient"
                            className="h-12 px-6 rounded-lg font-bold text-md"
                            onClick={handleGenerate}
                            disabled={!companyInput.trim()}
                        >
                            Generate
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 max-w-lg mx-auto w-full">
                        <div className="flex flex-col items-center space-y-4">
                            <Loader2 className="h-10 w-10 text-kelp-accent-start animate-spin" />
                            <h3 className="text-xl font-bold text-kelp-primary animate-pulse">{loadingStep}</h3>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-kelp-accent-start to-kelp-accent-end animate-progress origin-left w-full transition-all duration-1000" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Dev Mode Toggle */}
                <button
                    onClick={() => setShowDevMode(true)}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-kelp-accent-start transition-colors"
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
