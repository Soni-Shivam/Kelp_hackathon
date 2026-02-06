import { SlideBlock, BlockType } from '@/types/presentation';

export interface BlockPosition {
    left: number; // Pixels
    top: number;  // Pixels
    width: number; // Pixels
    height: number; // Pixels
    block: SlideBlock;
}

// Content Measurer Logic (Simplified for Frontend)
class ContentMeasurer {
    static calculateIdealWidth(block: SlideBlock, contentWidth: number): number {
        // Basic heuristics based on block type
        switch (block.block_type) {
            case 'text_deep_dive':
                // Text feels better with more width, but can compress
                return contentWidth;
            case 'chart_complex':
            case 'visual_map':
                return contentWidth; // Charts like space
            case 'dashboard_grid':
                return contentWidth;
            case 'logo_grid':
                return contentWidth;
            case 'composite_block':
                return contentWidth;
            default:
                return contentWidth;
        }
    }

    static calculateBlockHeight(block: SlideBlock, width: number): number {
        // Estimations based on content density
        const BASE_LINE_HEIGHT = 24;
        const HEADING_HEIGHT = 50;
        const PADDING = 20;

        switch (block.block_type) {
            case 'text_deep_dive':
                const bulletCount = block.verbose_bullets.length;
                // Estimate text wrap based on width. Narrower = more height.
                const avgCharsPerLine = width / 8; // approx 8px per char
                let totalLines = 0;
                block.verbose_bullets.forEach(b => {
                    totalLines += Math.ceil(b.length / avgCharsPerLine);
                });
                return HEADING_HEIGHT + (totalLines * BASE_LINE_HEIGHT) + PADDING;

            case 'dashboard_grid':
                const metricCount = Array.isArray(block.contextual_metrics)
                    ? block.contextual_metrics.length
                    : Object.keys(block.contextual_metrics).length;
                // Rows depend on width logic, but roughly:
                const rows = Math.ceil(metricCount / 3);
                return HEADING_HEIGHT + (rows * 80) + PADDING;

            case 'chart_complex':
                return 400; // Fixed reasonable height for charts

            case 'visual_map':
                return 350;

            case 'logo_grid':
                const logoCount = block.logos.length;
                const logoRows = Math.ceil(logoCount / 4);
                return HEADING_HEIGHT + (logoRows * 80) + PADDING;

            case 'composite_block':
                // Sum of sub-blocks? Or max? Usually side-by-side, so max height.
                return 400;

            default:
                return 200;
        }
    }
}

export class LayoutAllocator {
    // Slide dimensions (16:9 aspect ratio at 96 DPI)
    // Python: 13.333 inches * 96 = 1280px
    // Python: 7.5 inches * 96 = 720px
    static readonly SLIDE_WIDTH = 1280;
    static readonly SLIDE_HEIGHT = 720;

    static readonly MARGIN_TOP = 96;     // 1.0 inch
    static readonly MARGIN_SIDE = 48;    // 0.5 inch
    static readonly MARGIN_BOTTOM = 48;  // 0.5 inch
    static readonly MARGIN_BETWEEN = 28; // 0.3 inch approx

    private contentWidth: number;
    private contentHeight: number;

    constructor() {
        this.contentWidth = LayoutAllocator.SLIDE_WIDTH - (2 * LayoutAllocator.MARGIN_SIDE);
        this.contentHeight = LayoutAllocator.SLIDE_HEIGHT - LayoutAllocator.MARGIN_TOP - LayoutAllocator.MARGIN_BOTTOM;
    }

    calculatePositions(blocks: SlideBlock[]): BlockPosition[] {
        const numBlocks = blocks.length;

        if (numBlocks === 0) return [];
        if (numBlocks === 1) return this.singleBlockLayout(blocks);
        if (numBlocks === 2) return this.twoBlockLayout(blocks);
        if (numBlocks === 3) return this.threeBlockLayoutSmart(blocks);
        if (numBlocks === 4) return this.fourBlockGridLayout(blocks);

        return this.denseGridLayout(blocks);
    }

    private singleBlockLayout(blocks: SlideBlock[]): BlockPosition[] {
        const block = blocks[0];
        const idealWidth = ContentMeasurer.calculateIdealWidth(block, this.contentWidth);
        const idealHeight = ContentMeasurer.calculateBlockHeight(block, idealWidth);

        const finalHeight = Math.min(idealHeight, this.contentHeight);

        // Center logic
        let leftOffset = LayoutAllocator.MARGIN_SIDE;
        if (idealWidth < this.contentWidth && block.block_type !== 'text_deep_dive') {
            leftOffset = LayoutAllocator.MARGIN_SIDE + (this.contentWidth - idealWidth) / 2;
        }

        return [{
            left: leftOffset,
            top: LayoutAllocator.MARGIN_TOP,
            width: idealWidth,
            height: finalHeight,
            block
        }];
    }

    private twoBlockLayout(blocks: SlideBlock[]): BlockPosition[] {
        const blockTypes = blocks.map(b => b.block_type);

        // Sidebar Pattern: Text + Chart/Visual
        if (blockTypes.includes('text_deep_dive') &&
            (blockTypes.includes('chart_complex') || blockTypes.includes('visual_map'))) {
            return this.sidebarLayout(blocks);
        }

        // Default Vertical Stack
        return this.verticalStackLayout(blocks);
    }

    private sidebarLayout(blocks: SlideBlock[]): BlockPosition[] {
        const positions: BlockPosition[] = [];
        const textBlock = blocks.find(b => b.block_type === 'text_deep_dive');
        const visualBlock = blocks.find(b => b.block_type !== 'text_deep_dive');

        if (!textBlock || !visualBlock) return this.verticalStackLayout(blocks);

        // Split 40/60
        const splitRatio = 0.40;
        const leftWidth = this.contentWidth * splitRatio;
        const rightWidth = this.contentWidth * (1 - splitRatio) - LayoutAllocator.MARGIN_BETWEEN;

        // Left (Text) - Vertically Centered
        const idealH = ContentMeasurer.calculateBlockHeight(textBlock, leftWidth);
        let topPos = LayoutAllocator.MARGIN_TOP + (this.contentHeight - idealH) / 2;
        topPos = Math.max(LayoutAllocator.MARGIN_TOP, topPos);
        const actualH = Math.min(idealH, this.contentHeight);

        positions.push({
            left: LayoutAllocator.MARGIN_SIDE,
            top: topPos,
            width: leftWidth,
            height: actualH,
            block: textBlock
        });

        // Right (Visual) - Full Height
        positions.push({
            left: LayoutAllocator.MARGIN_SIDE + leftWidth + LayoutAllocator.MARGIN_BETWEEN,
            top: LayoutAllocator.MARGIN_TOP,
            width: rightWidth,
            height: this.contentHeight,
            block: visualBlock
        });

        return positions;
    }

    private threeBlockLayoutSmart(blocks: SlideBlock[]): BlockPosition[] {
        const blockTypes = blocks.map(b => b.block_type);

        // Header + Split Pattern
        if (blockTypes.includes('dashboard_grid') && blockTypes.includes('chart_complex')) {
            return this.headerSplitLayout(blocks);
        }

        if (blockTypes.every(t => t === 'text_deep_dive')) {
            return this.threeColumnLayout(blocks);
        }

        return this.verticalStackLayout(blocks);
    }

    private headerSplitLayout(blocks: SlideBlock[]): BlockPosition[] {
        const dashboardBlock = blocks.find(b => b.block_type === 'dashboard_grid');
        const otherBlocks = blocks.filter(b => b !== dashboardBlock);

        if (!dashboardBlock) return this.verticalStackLayout(blocks);

        // Header Height
        let headerHeight = ContentMeasurer.calculateBlockHeight(dashboardBlock, this.contentWidth);
        headerHeight = Math.min(headerHeight, this.contentHeight * 0.4);

        const contentTop = LayoutAllocator.MARGIN_TOP + headerHeight + LayoutAllocator.MARGIN_BETWEEN;
        const contentHeight = this.contentHeight - headerHeight - LayoutAllocator.MARGIN_BETWEEN;

        const positions: BlockPosition[] = [];

        // Header
        positions.push({
            left: LayoutAllocator.MARGIN_SIDE,
            top: LayoutAllocator.MARGIN_TOP,
            width: this.contentWidth,
            height: headerHeight,
            block: dashboardBlock
        });

        // Split Content (Assuming 2 others)
        if (otherBlocks.length === 2) {
            const b1 = otherBlocks[0];
            const b2 = otherBlocks[1];

            let ratio = 0.5;
            if (['chart_complex', 'visual_map'].includes(b1.block_type) && b2.block_type === 'text_deep_dive') {
                ratio = 0.6;
            }

            const w1 = this.contentWidth * ratio;
            const w2 = this.contentWidth * (1 - ratio) - LayoutAllocator.MARGIN_BETWEEN;

            positions.push({ left: LayoutAllocator.MARGIN_SIDE, top: contentTop, width: w1, height: contentHeight, block: b1 });
            positions.push({ left: LayoutAllocator.MARGIN_SIDE + w1 + LayoutAllocator.MARGIN_BETWEEN, top: contentTop, width: w2, height: contentHeight, block: b2 });
        }

        return positions;
    }

    private threeColumnLayout(blocks: SlideBlock[]): BlockPosition[] {
        const colWidth = (this.contentWidth - 2 * LayoutAllocator.MARGIN_BETWEEN) / 3;
        const positions: BlockPosition[] = [];

        blocks.forEach((block, i) => {
            const left = LayoutAllocator.MARGIN_SIDE + i * (colWidth + LayoutAllocator.MARGIN_BETWEEN);
            let top = LayoutAllocator.MARGIN_TOP;
            let h = this.contentHeight;

            if (block.block_type === 'text_deep_dive') {
                const idealH = ContentMeasurer.calculateBlockHeight(block, colWidth);
                if (idealH < h) {
                    top = LayoutAllocator.MARGIN_TOP + (h - idealH) / 2;
                    h = idealH;
                }
            }

            positions.push({ left, top, width: colWidth, height: h, block });
        });

        return positions;
    }

    private fourBlockGridLayout(blocks: SlideBlock[]): BlockPosition[] {
        const positions: BlockPosition[] = [];
        const colWidth = (this.contentWidth - LayoutAllocator.MARGIN_BETWEEN) / 2;
        const rowHeight = (this.contentHeight - LayoutAllocator.MARGIN_BETWEEN) / 2;

        const gridCoords = [
            { col: 0, row: 0 }, { col: 1, row: 0 },
            { col: 0, row: 1 }, { col: 1, row: 1 }
        ];

        blocks.forEach((block, i) => {
            const { col, row } = gridCoords[i];
            const left = LayoutAllocator.MARGIN_SIDE + col * (colWidth + LayoutAllocator.MARGIN_BETWEEN);
            const top = LayoutAllocator.MARGIN_TOP + row * (rowHeight + LayoutAllocator.MARGIN_BETWEEN);

            positions.push({ left, top, width: colWidth, height: rowHeight, block });
        });

        return positions;
    }

    private denseGridLayout(blocks: SlideBlock[]): BlockPosition[] {
        const positions: BlockPosition[] = [];
        const numBlocks = blocks.length;

        let rowCounts: number[] = [];
        if (numBlocks === 5) rowCounts = [3, 2];
        else if (numBlocks === 6) rowCounts = [3, 3];
        else if (numBlocks === 7) rowCounts = [4, 3];
        else if (numBlocks === 8) rowCounts = [4, 4];
        else rowCounts = [3, 3, 3]; // Fallback

        let startIdx = 0;
        let currentTop = LayoutAllocator.MARGIN_TOP;

        // Simple even split for row heights
        const rowHeight = (this.contentHeight - (LayoutAllocator.MARGIN_BETWEEN * (rowCounts.length - 1))) / rowCounts.length;

        rowCounts.forEach(count => {
            const rowBlocks = blocks.slice(startIdx, startIdx + count);
            startIdx += count;

            const colWidth = (this.contentWidth - (LayoutAllocator.MARGIN_BETWEEN * (count - 1))) / count;
            const usedWidth = (count * colWidth) + ((count - 1) * LayoutAllocator.MARGIN_BETWEEN);
            const leftOffset = LayoutAllocator.MARGIN_SIDE + (this.contentWidth - usedWidth) / 2;

            rowBlocks.forEach((block, i) => {
                const left = leftOffset + i * (colWidth + LayoutAllocator.MARGIN_BETWEEN);
                positions.push({
                    left,
                    top: currentTop,
                    width: colWidth,
                    height: rowHeight,
                    block
                });
            });

            currentTop += rowHeight + LayoutAllocator.MARGIN_BETWEEN;
        });

        return positions;
    }

    private verticalStackLayout(blocks: SlideBlock[]): BlockPosition[] {
        const positions: BlockPosition[] = [];
        const availableHeight = this.contentHeight - (LayoutAllocator.MARGIN_BETWEEN * (blocks.length - 1));
        const itemHeight = availableHeight / blocks.length;

        let currentTop = LayoutAllocator.MARGIN_TOP;

        blocks.forEach(block => {
            // Simple even distribution for now, Python has elastic logic but equal is safer for web
            positions.push({
                left: LayoutAllocator.MARGIN_SIDE,
                top: currentTop,
                width: this.contentWidth,
                height: itemHeight,
                block
            });
            currentTop += itemHeight + LayoutAllocator.MARGIN_BETWEEN;
        });

        return positions;
    }
}
