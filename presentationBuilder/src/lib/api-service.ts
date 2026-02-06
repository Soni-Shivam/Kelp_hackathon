import { Presentation } from '@/types/presentation';
import { generatePPTX } from './pptx-utils';

export async function exportToPPTX(presentation: Presentation): Promise<void> {
    try {
        console.log('Generating PPTX locally...');
        const blob = await generatePPTX(presentation);

        // Create a link element and trigger download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${presentation.project_code_name.replace(/\s+/g, '_')}_presentation.pptx`;
        document.body.appendChild(a);
        a.click();

        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Export failed:', error);
        alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
