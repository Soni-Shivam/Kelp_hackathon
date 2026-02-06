import { Presentation } from '@/types/presentation';
import { COMPLEX_PRESENTATION } from './data/complex-presentation';

// Mock AI Research Simulation (delays)
export const simulateResearch = async (companyName: string, onProgress: (step: string) => void) => {
    const steps = [
        `Analyzing ${companyName} business model...`,
        "Scraping financial reports (FY23-FY25)...",
        "Benchmarking against competitors...",
        "Structuring narrative flow...",
        "Generating slide layouts...",
    ];

    for (const step of steps) {
        onProgress(step);
        await new Promise(resolve => setTimeout(resolve, 800));
    }
};

// Mock Presentation Generation
export const generateMockPresentation = async (companyName: string): Promise<Presentation> => {
    // In a real app, this would interpret the company name and generate specific content.
    // For this test, we return the high-fidelity complex presentation (Project Silver Screen).

    // We can lightly customize it to feel dynamic
    // spread operator shallow copy is not enough for nested objects if we mutated them, 
    // but here we just read mostly or replace top level strings.
    // Ideally we'd use structuredClone but let's keep it simple.

    const customized = { ...COMPLEX_PRESENTATION };
    if (companyName) {
        customized.project_code_name = `${companyName} - Stress Test`;
    }

    return customized;
};
