import React from 'react';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface SlideHeaderProps {
    kicker?: string;
    title: string;
}

export const SlideHeader: React.FC<SlideHeaderProps> = ({ kicker, title }) => {
    return (
        <div className="relative h-16 w-full bg-kelp-primary flex items-center justify-between px-8 border-b-2 border-transparent kelp-gradient-border">
            {/* Kicker & Title Container */}
            <div className="flex flex-col justify-center h-full">
                {/* Kicker - Gradient Text */}
                <span className="text-[10px] uppercase tracking-wider font-bold bg-clip-text text-transparent bg-gradient-to-r from-kelp-accent-start to-kelp-accent-end mb-0.5">
                    {kicker}
                </span>

                {/* Main Title - White, Bold */}
                <h1 className="text-xl font-bold text-white leading-tight">
                    {title}
                </h1>
            </div>

            {/* Right Side: Logo */}
            <div className="flex items-center">
                <img
                    src="/kelp_logo.png"
                    alt="Kelp"
                    className="h-10 w-auto object-contain"
                />
            </div>

            {/* Gradient Bottom Border is handled by kelp-gradient-border utility */}
        </div>
    );
};
