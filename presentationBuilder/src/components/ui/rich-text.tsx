import React from 'react';
import { cn } from '@/lib/utils';

interface RichTextProps {
    text: string;
    className?: string;
}

export const RichText: React.FC<RichTextProps> = ({ text, className }) => {
    // Split by the bold delimiter (**...**)
    const parts = text.split(/(\*\*.*?\*\*)/g);

    return (
        <span className={className}>
            {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
                    return (
                        <strong key={i} className="font-bold text-inherit">
                            {part.slice(2, -2)}
                        </strong>
                    );
                }
                return <span key={i}>{part}</span>;
            })}
        </span>
    );
};
