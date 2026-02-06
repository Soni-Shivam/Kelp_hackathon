import { Value } from "@udecode/plate-common";

/**
 * Parses a raw string (e.g., "Revenue **grew 20%** YoY") into Plate formatted text nodes.
 * Returns: [ { text: "Revenue " }, { text: "grew 20%", bold: true }, { text: " YoY" } ]
 */
const parseMarkdownToSlate = (text: string) => {
    // Split by the bold delimiter (**...**)
    // The regex captures the delimiter inclusion to help processing
    const parts = text.split(/(\*\*.*?\*\*)/g);

    return parts
        .map((part) => {
            // Check if this part is a bold section
            if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
                return {
                    text: part.slice(2, -2), // Remove the ** asterisks
                    bold: true,
                };
            }
            // Return regular text
            return { text: part };
        })
        .filter((node) => node.text !== ""); // Filter out empty strings from splitting
};

export const deserializeBulletsToPlate = (bullets: string[]): Value => {
    if (!bullets || !Array.isArray(bullets)) return [];

    return bullets.map((bullet, index) => ({
        id: index.toString(),
        type: 'li', // Using 'li' to fit into the 'ul' wrapper in text-block.tsx
        children: parseMarkdownToSlate(bullet),
    }));
};

export const serializePlateToBullets = (nodes: any[]): string[] => {
    if (!nodes || !Array.isArray(nodes)) return [];

    return nodes.map(node => {
        // Handle nested 'lic' or direct children
        const children = node.children || [];
        return children
            .map((child: any) => {
                // If child has children (like lic), map them too
                if (child.children) {
                    return child.children.map((c: any) => c.text || '').join('');
                }
                return child.text || '';
            })
            .join('');
    });
};
