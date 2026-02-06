import React from 'react';
import { cn } from '@/lib/utils';

interface VisualMapBlockProps {
    heading: string;
    detailed_image_prompt: string;
}

export const VisualMapBlock: React.FC<VisualMapBlockProps> = ({ heading, detailed_image_prompt }) => {
    return (
        <div className="h-full w-full flex flex-col pt-2 bg-white">
            {/* Heading */}
            <div className="bg-kelp-primary text-white px-3 py-2 mb-2 w-full">
                <h3 className="font-bold text-lg leading-tight">{heading}</h3>
            </div>

            <div className="flex-1 bg-slate-50 border-2 border-kelp-action flex items-center justify-center p-4 m-2 text-center rounded">
                <p className="text-sm italic text-slate-600">
                    [Visual: {detailed_image_prompt}]
                </p>
            </div>
        </div>
    );
};
