import React from 'react';

interface LogoGridBlockProps {
    heading: string;
    logos: string[];
    logo_urls?: string[];
}

export const LogoGridBlock: React.FC<LogoGridBlockProps> = ({ heading, logos, logo_urls }) => {
    return (
        <div className="h-full w-full flex flex-col pt-2 bg-white overflow-hidden">
            {/* Heading */}
            <div className="bg-kelp-primary text-white px-3 py-2 mb-2 w-full shrink-0">
                <h3 className="font-bold text-lg leading-tight">{heading}</h3>
            </div>

            {/* Grid of Logos — flex-1 + overflow-hidden keeps it inside the block */}
            <div className="flex-1 min-h-0 overflow-hidden p-2">
                <div className="grid grid-cols-4 gap-2 h-full" style={{ gridAutoRows: '1fr' }}>
                    {logos.map((logo, i) => {
                        const url = logo_urls?.[i];
                        return (
                            <div
                                key={i}
                                className="relative w-full overflow-hidden"
                            >
                                {/* Padding-bottom trick: inner div fills a square inscribed in the cell */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div
                                        className="rounded-full border-2 border-kelp-accent-start/50 bg-white shadow-sm overflow-hidden flex items-center justify-center"
                                        style={{ width: '90%', height: '90%' }}
                                        title={logo}
                                    >
                                        {url ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={url}
                                                alt={logo}
                                                className="w-full h-full object-contain p-1"
                                                onError={(e) => {
                                                    const target = e.currentTarget;
                                                    target.style.display = 'none';
                                                    const parent = target.parentElement;
                                                    if (parent) {
                                                        parent.innerHTML = `<span class="text-[9px] font-bold text-kelp-primary leading-tight break-words text-center p-1">${logo}</span>`;
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <span className="text-[9px] font-bold text-kelp-primary leading-tight break-words text-center p-1">
                                                {logo}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
