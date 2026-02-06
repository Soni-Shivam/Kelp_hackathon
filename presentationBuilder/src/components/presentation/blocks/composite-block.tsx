import React from 'react';
import { SlideBlock } from '@/types/presentation';
import { DashboardGridBlock } from './dashboard-grid-block';
import { ChartBlock } from './chart-block';
import { TextBlock } from './text-block';
import { VisualMapBlock } from './visual-map-block';
import { LogoGridBlock } from './logo-grid-block';

interface CompositeBlockProps {
    heading: string;
    subBlocks: SlideBlock[];
    subBlockHeadings: string[];
    slideNumber: number;
}

// Simple internal renderer to avoid circular dependency loop if possible, 
// or just import the components directly.
const renderSubBlock = (block: SlideBlock, slideNumber: number) => {
    switch (block.block_type) {
        case 'dashboard_grid':
            return <DashboardGridBlock
                blockId={block.block_id}
                slideNumber={slideNumber}
                heading={block.heading}
                metrics={block.contextual_metrics}
            />;
        case 'chart_complex':
            return <ChartBlock heading={block.heading} chartData={block.chart_data} />;
        case 'text_deep_dive':
            return <TextBlock
                blockId={block.block_id}
                slideNumber={slideNumber}
                heading={block.heading}
                verbose_bullets={block.verbose_bullets}
                style_variant={block.style_variant}
                initialSlateContent={block.slate_content}
            />;
        case 'visual_map':
            return <VisualMapBlock heading={block.heading} detailed_image_prompt={block.detailed_image_prompt} />;
        case 'logo_grid':
            return <LogoGridBlock heading={block.heading} logos={block.logos} />;
        default:
            return null;
    }
}

export const CompositeBlock: React.FC<CompositeBlockProps> = ({ heading, subBlocks, subBlockHeadings, slideNumber }) => {
    return (
        <div className="h-full w-full flex flex-col pt-2">
            {/* Main Heading */}
            <div className="bg-kelp-primary text-white px-3 py-2 mb-2 w-full">
                <h3 className="font-bold text-lg leading-tight">{heading}</h3>
            </div>

            <div className="flex-1 flex gap-4 p-2">
                {subBlocks.map((block, i) => (
                    <div key={block.block_id} className="flex-1 min-w-0 border-l border-slate-200 pl-2">
                        {/* Mini Sub-heading strip */}
                        <div className="mb-2">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                                {subBlockHeadings[i] || block.heading}
                            </span>
                        </div>
                        <div className="h-[250px] relative">
                            {renderSubBlock(block, slideNumber)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
