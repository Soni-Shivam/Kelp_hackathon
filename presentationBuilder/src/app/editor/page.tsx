'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { usePresentationStore } from '@/lib/store/presentation-store';
import { SlideCanvas } from '@/components/presentation/slide-canvas';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Download, ChevronLeft, MousePointer2 } from 'lucide-react';
import { exportToPPTX } from '@/lib/api-service';
import { useToast } from '@/components/ui/toast';

export default function EditorPage() {
    const router = useRouter();
    const { presentation, currentSlideNumber, setCurrentSlideNumber, setEditMode } = usePresentationStore();
    const [scale, setScale] = useState(0.8);
    const [isExporting, setIsExporting] = useState(false);
    const { showToast } = useToast();

    // Always enable edit mode
    useEffect(() => {
        setEditMode(true);
    }, [setEditMode]);

    // Arrow key navigation
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!presentation) return;

        // Don't navigate if user is editing an input
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

        const totalSlides = presentation.slides.length;
        const currentIdx = presentation.slides.findIndex(s => s.slide_number === currentSlideNumber);

        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIdx = Math.min(currentIdx + 1, totalSlides - 1);
            setCurrentSlideNumber(presentation.slides[nextIdx].slide_number);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            const prevIdx = Math.max(currentIdx - 1, 0);
            setCurrentSlideNumber(presentation.slides[prevIdx].slide_number);
        }
    }, [presentation, currentSlideNumber, setCurrentSlideNumber]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    useEffect(() => {
        if (!presentation) {
            router.push('/');
        }
    }, [presentation, router]);

    if (!presentation) return null;

    const currentSlide = presentation.slides.find(s => s.slide_number === currentSlideNumber) || presentation.slides[0];

    const handleExport = async () => {
        if (!presentation || isExporting) return;
        setIsExporting(true);
        try {
            await exportToPPTX(presentation);
            showToast('PPTX exported successfully!', 'success');
        } catch (error) {
            showToast('Failed to export PPTX. Please try again.', 'error');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="h-screen w-screen flex flex-col bg-kelp-bg-app overflow-hidden">
            {/* 1. App Header */}
            <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Project</span>
                        <span className="text-sm font-bold text-slate-800">{presentation.project_code_name}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Edit Mode Indicator */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-kelp-accent-start/10 rounded-full">
                        <MousePointer2 className="h-3 w-3 text-kelp-accent-start" />
                        <span className="text-xs font-medium text-kelp-accent-start">Edit Mode</span>
                    </div>

                    <span className="text-xs text-slate-400">Autosaved</span>
                    <Button
                        variant="gradient"
                        size="sm"
                        onClick={handleExport}
                        disabled={isExporting}
                    >
                        <Download className={cn("mr-2 h-3 w-3", isExporting && "animate-bounce")} />
                        {isExporting ? 'Generating...' : 'Export PPTX'}
                    </Button>
                </div>
            </header>

            {/* 2. Main Workspace */}
            <div className="flex-1 flex overflow-hidden">

                {/* Left Sidebar: Thumbnails with Mini Previews */}
                <div className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
                    <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Slides ({presentation.slides.length})</span>
                        <span className="text-[10px] normal-case font-normal">Use ← → to navigate</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {presentation.slides.map((slide, idx) => (
                            <div
                                key={slide.slide_number}
                                onClick={() => setCurrentSlideNumber(slide.slide_number)}
                                className={cn(
                                    "group relative aspect-video bg-kelp-bg-app border-2 rounded-lg cursor-pointer transition-all hover:border-kelp-accent-start/50 overflow-hidden p-2",
                                    currentSlideNumber === slide.slide_number ? "border-kelp-primary ring-2 ring-kelp-primary/20" : "border-slate-200"
                                )}
                            >
                                {/* Mini Preview - Actual slide content representation */}
                                <div className="w-full h-full flex flex-col">
                                    {/* Mini Header */}
                                    <div className="h-3 bg-kelp-primary rounded-t-sm mb-1 flex items-center px-1">
                                        <span className="text-[5px] text-white font-bold truncate">{slide.kicker}</span>
                                    </div>
                                    {/* Mini Title */}
                                    <div className="text-[6px] font-bold text-slate-700 truncate leading-tight mb-1 px-0.5">{slide.title}</div>
                                    {/* Mini Blocks Grid */}
                                    <div className="flex-1 grid grid-cols-2 gap-0.5">
                                        {slide.blocks.slice(0, 4).map((block, i) => (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "rounded-sm flex flex-col p-0.5 overflow-hidden",
                                                    block.block_type === 'text_deep_dive' ? 'bg-slate-100' :
                                                        block.block_type === 'dashboard_grid' ? 'bg-kelp-accent-start/10' :
                                                            block.block_type === 'chart_complex' ? 'bg-blue-50' :
                                                                'bg-slate-50'
                                                )}
                                            >
                                                <div className="text-[4px] font-semibold text-slate-600 truncate">{block.heading}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Slide Number Badge */}
                                <div className="absolute bottom-1 right-1 h-4 w-4 bg-white rounded-full text-[8px] font-bold flex items-center justify-center shadow-sm text-slate-500 border border-slate-200">
                                    {idx + 1}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Center Stage: Canvas (Full Width - No Right Sidebar) */}
                <div className="flex-1 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center justify-center p-8">
                        <div className="relative shadow-2xl ring-1 ring-black/5" style={{ width: 1280 * scale, height: 720 * scale }}>
                            <div className="absolute inset-0 origin-top-left" style={{ transform: `scale(${scale})` }}>
                                <SlideCanvas slide={currentSlide} isEditMode={true} />
                            </div>
                        </div>
                    </div>

                    {/* Zoom Controls */}
                    <div className="absolute bottom-6 right-6 bg-white rounded-full shadow-lg border border-slate-200 p-1 flex items-center gap-2 px-3">
                        <button onClick={() => setScale(s => Math.max(0.2, s - 0.1))} className="text-slate-500 hover:text-kelp-primary text-lg">-</button>
                        <span className="text-xs font-mono text-slate-600 w-12 text-center">{Math.round(scale * 100)}%</span>
                        <button onClick={() => setScale(s => Math.min(1.5, s + 0.1))} className="text-slate-500 hover:text-kelp-primary text-lg">+</button>
                    </div>

                    {/* Navigation Hint */}
                    <div className="absolute bottom-6 left-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200 px-3 py-2 flex items-center gap-2">
                        <span className="text-xs text-slate-500">Slide {presentation.slides.findIndex(s => s.slide_number === currentSlideNumber) + 1} of {presentation.slides.length}</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
