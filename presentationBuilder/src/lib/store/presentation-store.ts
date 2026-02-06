import { create } from 'zustand';
import { Presentation, SlideBlock } from '@/types/presentation';

interface PresentationState {
    presentation: Presentation | null;
    currentSlideNumber: number;
    isLoading: boolean;
    loadingStep: string;
    isEditMode: boolean;

    // Actions
    setPresentation: (data: Presentation) => void;
    setCurrentSlideNumber: (num: number) => void;
    startLoading: () => void;
    setLoadingStep: (step: string) => void;
    finishLoading: () => void;
    updateCompany: (name: string) => void;
    updateBlock: (slideNumber: number, blockId: number, updates: Partial<SlideBlock>) => void;
    setEditMode: (enabled: boolean) => void;
}

export const usePresentationStore = create<PresentationState>((set) => ({
    presentation: null,
    currentSlideNumber: 1,
    isLoading: false,
    loadingStep: '',
    isEditMode: false,

    setPresentation: (data) => set({
        presentation: data,
        currentSlideNumber: data.slides[0]?.slide_number || 1
    }),
    setCurrentSlideNumber: (num) => set({ currentSlideNumber: num }),
    startLoading: () => set({ isLoading: true }),
    setLoadingStep: (step) => set({ loadingStep: step }),
    finishLoading: () => set({ isLoading: false, loadingStep: '' }),
    updateCompany: (name) => set((state) => ({
        presentation: state.presentation
            ? { ...state.presentation, project_code_name: name }
            : null
    })),
    updateBlock: (slideNumber, blockId, updates) => set((state) => {
        if (!state.presentation) return state;

        const newSlides = state.presentation.slides.map(slide => {
            if (slide.slide_number !== slideNumber) return slide;

            const newBlocks = slide.blocks.map(block => {
                if (block.block_id !== blockId) return block;
                // We use type assertion here to avoid complex union type issues with Partial
                return { ...block, ...updates } as SlideBlock;
            });

            return { ...slide, blocks: newBlocks };
        });

        return {
            presentation: { ...state.presentation, slides: newSlides }
        };
    }),
    setEditMode: (enabled) => set({ isEditMode: enabled }),
}));
