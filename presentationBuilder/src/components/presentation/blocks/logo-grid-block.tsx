import React from 'react';

interface LogoGridBlockProps {
    heading: string;
    logos: string[];
}

export const LogoGridBlock: React.FC<LogoGridBlockProps> = ({ heading, logos }) => {
    return (
        <div className="h-full w-full flex flex-col pt-2 bg-white">
            {/* Heading */}
            <div className="bg-kelp-primary text-white px-3 py-2 mb-4 w-full">
                <h3 className="font-bold text-lg leading-tight">{heading}</h3>
            </div>

            {/* Grid of Logos (Placeholders) */}
            <div className="grid grid-cols-4 gap-4 p-2">
                {logos.map((logo, i) => (
                    <div key={i} className="aspect-square rounded-full border-2 border-kelp-accent-start/50 flex items-center justify-center bg-slate-50 p-2 text-center shadow-sm">
                        <span className="text-[10px] font-bold text-kelp-primary leading-tight break-words">{logo}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
