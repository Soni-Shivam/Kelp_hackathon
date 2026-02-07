'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePresentationStore } from '@/lib/store/presentation-store';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, LayoutTemplate } from 'lucide-react';

export default function OutlinePage() {
    const router = useRouter();
    const { presentation } = usePresentationStore();

    useEffect(() => {
        if (!presentation) {
            router.push('/');
        }
    }, [presentation, router]);

    if (!presentation) return null;

    return (
        <div className="min-h-screen bg-kelp-bg-app flex flex-col">
            {/* Header */}
            <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Project Outline</span>
                        <span className="text-sm font-bold text-slate-800">{presentation.project_code_name}</span>
                    </div>
                </div>
                <div>
                    <Button onClick={() => router.push('/editor')} variant="gradient">
                        Continue to Editor <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-kelp-primary/10 rounded-lg">
                            <LayoutTemplate className="h-6 w-6 text-kelp-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Presentation Structure</h1>
                            <p className="text-slate-500">Review the generated slides before editing details.</p>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {presentation.slides.map((slide, idx) => (
                            <div key={slide.slide_number} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-start gap-4 hover:border-kelp-accent-start/50 transition-colors">
                                <div className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500 text-sm">
                                    {slide.slide_number}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-kelp-primary uppercase px-2 py-0.5 bg-kelp-primary/10 rounded-full">
                                            {slide.layout}
                                        </span>
                                        <span className="text-xs text-slate-400 font-medium">
                                            {slide.blocks.length} Blocks
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1">{slide.title}</h3>
                                    <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">{slide.kicker}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end pt-8 pb-16">
                        <Button onClick={() => router.push('/editor')} size="lg" variant="gradient">
                            Continue to Editor <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
