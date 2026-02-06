import React, { useState } from 'react';
import { PlateEditor } from '@/components/plate-editor';
import { deserializeBulletsToPlate } from '@/lib/plate-utils';
import { cn } from '@/lib/utils';
import { usePresentationStore } from '@/lib/store/presentation-store';
import { useToast } from '@/components/ui/toast';
import { RichText } from '@/components/ui/rich-text';

interface TextBlockProps {
    blockId: number;
    slideNumber: number;
    heading: string;
    verbose_bullets: string[];
    style_variant?: number;
    initialSlateContent?: any[];
    isEditMode?: boolean;
}

export const TextBlock: React.FC<TextBlockProps> = ({
    blockId,
    slideNumber,
    heading,
    verbose_bullets,
    style_variant = 1,
    initialSlateContent,
    isEditMode = false
}) => {
    const updateBlock = usePresentationStore(state => state.updateBlock);
    const [isEditingHeading, setIsEditingHeading] = useState(false);
    const [editedHeading, setEditedHeading] = useState(heading);
    const { showToast } = useToast();

    const initialValue = React.useMemo(() => {
        if (initialSlateContent) return initialSlateContent;
        if (verbose_bullets && verbose_bullets.length > 0) {
            return [{
                type: 'ul',
                children: deserializeBulletsToPlate(verbose_bullets)
            }];
        }
        return undefined;
    }, [verbose_bullets, initialSlateContent]);

    const handleTextChange = (value: any[]) => {
        updateBlock(slideNumber, blockId, { slate_content: value });
        // Instant autosave - no toast for text changes to avoid spam
    };

    const handleHeadingClick = () => {
        if (isEditMode) {
            setIsEditingHeading(true);
        }
    };

    const handleHeadingSave = () => {
        if (editedHeading !== heading) {
            updateBlock(slideNumber, blockId, { heading: editedHeading });
            showToast('Changes saved', 'success');
        }
        setIsEditingHeading(false);
    };

    const handleHeadingKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleHeadingSave();
        } else if (e.key === 'Escape') {
            setEditedHeading(heading);
            setIsEditingHeading(false);
        }
    };

    // Style Variants
    const bgClass = style_variant === 2 ? 'bg-orange-50' : 'bg-slate-50';

    return (
        <div className={cn("h-full w-full flex flex-col pt-2 relative border border-slate-200 shadow-sm rounded-md", bgClass)}>
            {/* Heading - CONSISTENT with other blocks: w-full, text-lg, rounded corners */}
            <div
                className={cn(
                    "bg-kelp-primary text-white px-3 py-2 mb-2 w-full rounded-t-sm",
                    isEditMode && "cursor-text hover:bg-kelp-primary/90"
                )}
                onClick={handleHeadingClick}
            >
                {isEditingHeading ? (
                    <input
                        type="text"
                        value={editedHeading}
                        onChange={(e) => setEditedHeading(e.target.value)}
                        onBlur={handleHeadingSave}
                        onKeyDown={handleHeadingKeyDown}
                        className="w-full bg-transparent font-bold text-lg leading-tight text-white outline-none border-b border-white/50"
                        autoFocus
                    />
                ) : (
                    <h3 className="font-bold text-lg leading-tight truncate">
                        <RichText text={heading} />
                    </h3>
                )}
            </div>

            <div className="flex-1 px-4 py-2 overflow-y-auto">
                <PlateEditor initialValue={initialValue} onChange={handleTextChange} />
            </div>
        </div>
    );
};
