'use client';

import React, { useMemo } from 'react';
import { Slide, SlideBlock } from '@/types/presentation';
import { SlideHeader } from '@/components/presentation/slide-header';
import { TextBlock } from '@/components/presentation/blocks/text-block';
import { DashboardGridBlock } from '@/components/presentation/blocks/dashboard-grid-block';
import { ChartBlock } from '@/components/presentation/blocks/chart-block';
import { VisualMapBlock } from '@/components/presentation/blocks/visual-map-block';
import { LogoGridBlock } from '@/components/presentation/blocks/logo-grid-block';
import { CompositeBlock } from '@/components/presentation/blocks/composite-block';
import { LayoutAllocator } from '@/lib/layout-engine';
import { cn } from '@/lib/utils';

interface SlideCanvasProps {
    slide: Slide;
    scale?: number;
    isEditMode?: boolean;
}

export const SlideCanvas: React.FC<SlideCanvasProps> = ({ slide, scale = 1, isEditMode = false }) => {
    // Standard PPTX Dimensions in Pixels (96 DPI)
    const BASE_WIDTH = 1280;
    const BASE_HEIGHT = 720;

    // Allocate layout positions
    const layoutAllocator = useMemo(() => new LayoutAllocator(), []);
    const positions = useMemo(() => layoutAllocator.calculatePositions(slide.blocks), [slide.blocks, layoutAllocator]);

    return (
        <div
            className="bg-white shadow-2xl relative overflow-hidden origin-top-left"
            style={{
                width: BASE_WIDTH,
                height: BASE_HEIGHT,
                transform: `scale(${scale})`,
            }}
        >
            {/* 1. Background Fill */}
            <div className="absolute inset-0 bg-white" />

            {/* 2. Header */}
            <SlideHeader kicker={slide.kicker} title={slide.title} />

            {/* 3. Render Blocks Absolute */}
            {positions.map((pos) => (
                <div
                    key={pos.block.block_id}
                    className={cn(
                        "absolute transition-all",
                        isEditMode && "hover:ring-2 hover:ring-kelp-accent-start hover:ring-offset-2 hover:z-10 cursor-pointer"
                    )}
                    style={{
                        left: pos.left,
                        top: pos.top,
                        width: pos.width,
                        height: pos.height,
                    }}
                >
                    {renderBlock(pos.block, slide.slide_number, isEditMode)}
                </div>
            ))}

            {/* 4. Footer Placeholder */}
            <div className="absolute bottom-2 right-4 text-xs text-slate-400 font-sans">
                {slide.slide_number}
            </div>
        </div>
    );
};

// Block Renderer Factory
const renderBlock = (block: SlideBlock, slideNumber: number, isEditMode: boolean) => {
    switch (block.block_type) {
        case 'text_deep_dive':
            return <TextBlock
                blockId={block.block_id}
                slideNumber={slideNumber}
                heading={block.heading}
                verbose_bullets={block.verbose_bullets}
                style_variant={block.style_variant}
                initialSlateContent={block.slate_content}
                isEditMode={isEditMode}
            />;
        case 'dashboard_grid':
            return <DashboardGridBlock
                blockId={block.block_id}
                slideNumber={slideNumber}
                heading={block.heading}
                metrics={block.contextual_metrics}
                isEditMode={isEditMode}
            />;
        case 'chart_complex':
            return <ChartBlock heading={block.heading} chartData={block.chart_data} />;
        case 'visual_map':
            return <VisualMapBlock heading={block.heading} detailed_image_prompt={block.detailed_image_prompt} />;
        case 'logo_grid':
            return <LogoGridBlock heading={block.heading} logos={block.logos} />;
        case 'composite_block':
            return <CompositeBlock heading={block.heading} subBlocks={block.sub_blocks} subBlockHeadings={block.sub_block_headings} slideNumber={slideNumber} />;
        default:
            return <div className="p-4 border border-red-200 bg-red-50 text-red-500">Unknown Block Type: {(block as any).block_type}</div>;
    }
};
