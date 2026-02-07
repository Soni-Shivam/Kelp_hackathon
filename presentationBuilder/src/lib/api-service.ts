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

export async function exportCitations(presentation: Presentation): Promise<void> {
    try {
        console.log('Requesting citations export...');

        // Call the Python backend API
        const response = await fetch('http://localhost:8001/generate-citations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(presentation),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }

        const blob = await response.blob();

        // Create a link element and trigger download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${presentation.project_code_name.replace(/\s+/g, '_')}_citations.txt`;
        document.body.appendChild(a);
        a.click();

        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Citation export failed:', error);
        alert(`Citation export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
