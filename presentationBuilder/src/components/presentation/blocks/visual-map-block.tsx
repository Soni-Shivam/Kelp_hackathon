import React from 'react';
import { cn } from '@/lib/utils';

interface VisualMapBlockProps {
    heading: string;
    detailed_image_prompt: string;
    image_url?: string;
}

export const VisualMapBlock: React.FC<VisualMapBlockProps> = ({ heading, detailed_image_prompt, image_url }) => {
    return (
        <div className="h-full w-full flex flex-col pt-2 bg-white overflow-hidden relative border border-slate-200 shadow-sm rounded-md">
            {/* Heading */}
            <div className="bg-kelp-primary text-white px-3 py-2 mb-2 w-full z-10 relative">
                <h3 className="font-bold text-lg leading-tight">{heading}</h3>
            </div>

            <div className="flex-1 bg-slate-50 relative flex items-center justify-center m-2 rounded overflow-hidden">
                {image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <div className="relative w-full h-full">
                        <img
                            src={image_url}
                            alt={detailed_image_prompt}
                            className="absolute inset-0 w-full h-full object-cover transition-transform hover:scale-105 duration-700"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 text-white text-xs truncate">
                            {detailed_image_prompt}
                        </div>
                    </div>
                ) : (
                    <div className="border-2 border-kelp-action border-dashed p-4 text-center w-full h-full flex items-center justify-center">
                        <p className="text-sm italic text-slate-600">
                            [Visual Placeholder: {detailed_image_prompt}]
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
