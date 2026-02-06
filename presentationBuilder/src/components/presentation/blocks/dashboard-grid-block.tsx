import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import { usePresentationStore } from '@/lib/store/presentation-store';
import { RichText } from '@/components/ui/rich-text';

interface DashboardGridBlockProps {
    blockId: number;
    slideNumber: number;
    heading: string;
    metrics: Record<string, string> | string[];
    isEditMode?: boolean;
}

export const DashboardGridBlock: React.FC<DashboardGridBlockProps> = ({
    blockId,
    slideNumber,
    heading,
    metrics,
    isEditMode = false
}) => {
    const isList = Array.isArray(metrics);
    const entries = isList ? (metrics as string[]) : Object.entries(metrics as Record<string, string>);
    const itemCount = entries.length;
    const { showToast } = useToast();
    const updateBlock = usePresentationStore(state => state.updateBlock);

    // State for editing
    const [isEditingHeading, setIsEditingHeading] = useState(false);
    const [editedHeading, setEditedHeading] = useState(heading);
    const [editingMetricKey, setEditingMetricKey] = useState<string | null>(null);
    const [editedMetrics, setEditedMetrics] = useState<Record<string, string> | string[]>(metrics);

    // Calculate grid layout to fill space
    const cols = itemCount <= 2 ? itemCount : itemCount <= 4 ? 2 : 3;

    const handleHeadingClick = () => {
        if (isEditMode) {
            setIsEditingHeading(true);
        }
    };

    const handleHeadingSave = useCallback(() => {
        if (editedHeading !== heading) {
            updateBlock(slideNumber, blockId, { heading: editedHeading });
            showToast('Changes saved', 'success');
        }
        setIsEditingHeading(false);
    }, [editedHeading, heading, updateBlock, slideNumber, blockId, showToast]);

    const handleHeadingKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleHeadingSave();
        } else if (e.key === 'Escape') {
            setEditedHeading(heading);
            setIsEditingHeading(false);
        }
    };

    const handleMetricClick = (key: string) => {
        if (isEditMode) {
            setEditingMetricKey(key);
        }
    };

    const handleMetricSave = useCallback((key: string, newValue: string) => {
        if (isList) {
            const idx = parseInt(key);
            const newMetrics = [...(metrics as string[])];
            if (newMetrics[idx] !== newValue) {
                newMetrics[idx] = newValue;
                updateBlock(slideNumber, blockId, { contextual_metrics: newMetrics });
                setEditedMetrics(newMetrics);
                showToast('Changes saved', 'success');
            }
        } else {
            const currentMetrics = metrics as Record<string, string>;
            if (currentMetrics[key] !== newValue) {
                const newMetrics = { ...currentMetrics, [key]: newValue };
                updateBlock(slideNumber, blockId, { contextual_metrics: newMetrics });
                setEditedMetrics(newMetrics);
                showToast('Changes saved', 'success');
            }
        }
        setEditingMetricKey(null);
    }, [isList, metrics, updateBlock, slideNumber, blockId, showToast]);

    const handleMetricKeyDown = (e: React.KeyboardEvent, key: string, value: string) => {
        if (e.key === 'Enter') {
            handleMetricSave(key, value);
        } else if (e.key === 'Escape') {
            setEditingMetricKey(null);
        }
    };

    return (
        <div className="h-full w-full flex flex-col pt-2 relative">
            {/* Heading - w-full, text-lg, rounded corners */}
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

            {/* Grid fills remaining space */}
            <div className="flex-1 w-full overflow-hidden p-2">
                {isList ? (
                    // List Mode (Badges) - fill available space with very light shadows
                    <div
                        className="grid gap-3 h-full"
                        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
                    >
                        {(editedMetrics as string[]).map((badge, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "flex items-center justify-center p-3 border border-kelp-primary rounded-md bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]",
                                    isEditMode && "hover:border-kelp-accent-start hover:border-dashed cursor-text"
                                )}
                                onClick={() => handleMetricClick(i.toString())}
                            >
                                {editingMetricKey === i.toString() ? (
                                    <input
                                        type="text"
                                        defaultValue={badge}
                                        onBlur={(e) => handleMetricSave(i.toString(), e.target.value)}
                                        onKeyDown={(e) => handleMetricKeyDown(e, i.toString(), (e.target as HTMLInputElement).value)}
                                        className="w-full text-center text-kelp-primary font-bold text-sm bg-transparent outline-none border-b border-kelp-primary/50"
                                        autoFocus
                                    />
                                ) : (
                                    <span className="text-kelp-primary font-bold text-center text-sm">
                                        <RichText text={badge} />
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    // Dict Mode (Key-Value Metrics) - fill available space with very light shadows
                    <div
                        className="grid gap-3 h-full"
                        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
                    >
                        {Object.entries(editedMetrics as Record<string, string>).map(([key, value]) => (
                            <div
                                key={key}
                                className={cn(
                                    "flex flex-col items-center justify-center p-2 border border-kelp-accent-start/30 bg-white rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.05)]",
                                    isEditMode && "hover:border-kelp-accent-start hover:border-dashed cursor-text"
                                )}
                                onClick={() => handleMetricClick(key)}
                            >
                                {editingMetricKey === key ? (
                                    <input
                                        type="text"
                                        defaultValue={value}
                                        onBlur={(e) => handleMetricSave(key, e.target.value)}
                                        onKeyDown={(e) => handleMetricKeyDown(e, key, (e.target as HTMLInputElement).value)}
                                        className="w-full text-center text-2xl font-bold text-kelp-primary bg-transparent outline-none border-b border-kelp-primary/50"
                                        autoFocus
                                    />
                                ) : (
                                    <>
                                        <span className="text-2xl font-bold text-kelp-primary">
                                            <RichText text={value} />
                                        </span>
                                        <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                                            {key}
                                        </span>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
