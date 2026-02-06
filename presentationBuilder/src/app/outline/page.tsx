'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { usePresentationStore } from '@/lib/store/presentation-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronRight, FileText, CheckCircle2, LayoutTemplate } from 'lucide-react';

export default function OutlinePage() {
    const router = useRouter();
    const { presentation } = usePresentationStore();

    if (!presentation) {
        router.push('/');
        return null;
    }

    return (
        <div className="min-h-screen bg-kelp-bg-app flex flex-col">
            {/* Header */}
            <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <div className="font-bold text-kelp-primary text-xl">KELP</div>
                    <div className="h-4 w-px bg-slate-300 mx-2" />
                    <div className="text-slate-500 font-medium">Outline Review</div>
                </div>
                <Button variant="default" onClick={() => router.push('/editor')}>
                    Confirm & Render Slides
                    <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-4xl w-full mx-auto p-8 space-y-6">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-kelp-primary">Proposed Structure</h1>
                    <p className="text-slate-500 mt-2">We found 3 high-impact areas for {presentation.project_code_name}. Review the outline below.</p>
                </div>

                <div className="space-y-4">
                    {presentation.slides.map((slide, index) => (
                        <Card key={slide.slide_number} className="p-6 border-l-4 border-l-kelp-accent-start hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="h-8 w-8 rounded-full bg-kelp-primary/10 text-kelp-primary flex items-center justify-center font-bold text-sm shrink-0">
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs font-bold text-kelp-accent-start uppercase tracking-wider mb-1">
                                        {slide.kicker}
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-2">
                                        {slide.title}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {slide.blocks.map(block => (
                                            <span key={block.block_id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                                {block.block_type === 'text_deep_dive' && <FileText className="w-3 h-3 mr-1" />}
                                                {block.block_type === 'dashboard_grid' && <LayoutTemplate className="w-3 h-3 mr-1" />}
                                                {block.block_type.replace('_', ' ')}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <CheckCircle2 className="h-6 w-6 text-green-500/20" />
                            </div>
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    );
}
