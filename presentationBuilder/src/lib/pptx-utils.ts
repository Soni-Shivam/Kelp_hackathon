
import pptxgen from 'pptxgenjs';
import { Presentation, SlideBlock, ChartData } from '@/types/presentation';
import { LayoutAllocator } from './layout-engine';
import {
    SLIDE_WIDTH_IN,
    SLIDE_HEIGHT_IN,
    pxToIn,
    COLORS,
    CHART_COLORS,
    TYPOGRAPHY,
    SPACING,
    COMPONENTS,
    SHADOWS,
} from './design-system';

// ============================================================================
// SLATE NODE INTERFACE (for rich text parsing)
// ============================================================================
interface SlateNode {
    type?: string;
    text?: string;
    children?: SlateNode[];
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
}

// Logo as base64 for reliable embedding in PPTX
const KELP_LOGO_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA/oAAAGCCAYAAABQCLgkAACpVElEQVR4nO39fZxlV3nfif6eVSXItQmqFvYIv0hd3Y2AuTcYYcdxHAxdDQxgMzOW8DjjxGB1A2755garheNkfGOpqhvZ146N1LI9vJhAlyC5uTNjImFfxy8EuoVf8rGvQY3J3FjqbnWB4+uxhLpLGBPbqPZz/1hr7b3W2mu/nFOnap9z6vfls+iqffZe6zn7HJ06v/W8CUbg6ve9YRnAcnhMTOF+sv+KSPlYIQVqiEbniGjjehpcLyZ/njZen1kb2Fz64MPn4wkalyeEEEIIIYQQMvOYrhOuft8bVgDcAWAFwFJtAhMK6ljsF1IdqyzUFFL2SxH7IkBm42BEoQ8Am0BxDsBHlz74O+sU+oQQQgghhBBC5om2RL4T+CuwAr95AhMK6lTsNwv98Ly8MC+gEpyXixAwbdY1zVuyAZhjSx/4u54uhBBCCCGEEEJmgey+uaof96alAHa6kLvPxdRFSC+hVCr5pVL/3n1CCCGEEEIIIWQGWcxW7ICXB13CGJ59Cvxg3a9xRCShyL8HwHET/L8JYNMAhwDsBfB0AF/uLr4F4IsA8BoANwDYV54vmXUAIYQQQgghhBC+i7j3fCBYC+BlAJ4P4GkDigcn8TuA9QCs1t+H4FkB8FoA/4qAnxBCCCGEEELITNLo0Y/F5w7Kfe+d959U27/e7+BnBb9/TNXE7c+E8xJCCCGEEEIImS3ylbvr3vTy4K/b7+H3xL3nA++8b8M3kVefEEIIIYQQQsgsslj+lzjPfRz3u7dBKOhtwT6/IVBN2dZ+z1bs09yQru/C7kT+xY/e/t9bbCKEEEIIIYQQQmeL/B79QqIOd/WQ/FDw0hLVy1X+t4I/m9LfIPjTsH4R5C17+wkhBCCEEEIIIYSQWaIT+bUI+EG8+LQX+f5RCXZ8bbl/o3i1V/n7VfLFfi/3HxbzGnWkgX8/PsV/qWB9QgghhBBCCCF7idWBDdgs/v5qyN+Pw+7PeyzfV04R0+bZDkqPf9gTf/X/S4V9QgghhBBCCCHTiyBtSCcjU3rmy/z32qN+jiL4f4oUu57z7ptirv7adrFBb1/37ufi+yH0tuvxT4U/IYQQQgghhJB5pCzY58Pu0/z37kNpC7xIEHc9GC0RXgsAoGO3wgshhBBCCCGEkPnDlP+G3viEoGd+0RTPjsV/V9E+BL33pdDPXPqfCQjtgkJq3nxaLYB79wkhhBBCCCGEkNmhEPphDnxuG7xQ9DeG6AdlEH07/93bvfuAE/qA8+RL8P8W/EWN1+cEv3XsE0IIIYQQQgjZE6RCv10EV0X4cq3t2gR/BNX99jF/be9cfUpBFEqfzwHBE8c/QCEQ9fUBAXr3CSGEEEIIIYTMAgKXox9W3+8+0FPUT/PZR9GEu3lZb3Efu2v5eJPAdyL/ygd/b/MCCn1CCCGEEEIIIbOHcaI/EN9SL8inNd9+76FL2fkKVHn7Bb35VeE+O/94nv1m+zqWQC33nxBCCCGEEELIXmIxFvlJD3urqI+8+Sq59nhVFX8K/VCci7+fFu83wHX3haPtc+j/pwbYNIB0/r7CMSGE/B/+/wEAAH//AwC/5QvU';

// ============================================================================
// HELPER: Parse **bold** markdown markers
// ============================================================================
function parseMarkdownToPptx(text: string): any[] {
    const result: any[] = [];
    const parts = text.split(/(\*\*[^*]+\*\*)/g);

    parts.forEach(part => {
        if (part.startsWith('**') && part.endsWith('**')) {
            result.push({
                text: part.slice(2, -2),
                options: { bold: true }
            });
        } else if (part) {
            result.push({ text: part });
        }
    });

    return result;
}

// ============================================================================
// MAIN EXPORT FUNCTION
// ============================================================================
export async function generatePPTX(presentation: Presentation): Promise<Blob> {
    const pptx = new pptxgen();

    // Define custom layout matching frontend canvas exactly
    pptx.defineLayout({ name: 'KELP_16x9', width: SLIDE_WIDTH_IN, height: SLIDE_HEIGHT_IN });
    pptx.layout = 'KELP_16x9';
    pptx.title = presentation.project_code_name;
    pptx.author = 'Kelp M&A Team';

    const layoutAllocator = new LayoutAllocator();

    for (const slideData of presentation.slides) {
        const slide = pptx.addSlide();

        // 1. Slide Background (bg-white)
        slide.background = { color: COLORS.bgSlide };

        // 2. Slide Header (pixel-perfect match to slide-header.tsx)
        renderSlideHeader(slide, slideData.kicker, slideData.title);

        // 3. Content Blocks - await async rendering
        const positions = layoutAllocator.calculatePositions(slideData.blocks);
        for (const pos of positions) {
            await renderBlock(slide, pos);
        }

        // 4. Footer
        renderFooter(slide, slideData.slide_number);
    }

    const buffer = await pptx.write({ outputType: 'blob' }) as Blob;
    return buffer;
}

// ============================================================================
// SLIDE HEADER (pixel-perfect match to slide-header.tsx)
// ============================================================================
function renderSlideHeader(slide: pptxgen.Slide, kicker?: string, title?: string) {
    const { header } = COMPONENTS;
    const headerHeight = header.height;

    // 1. Purple background bar (bg-kelp-primary)
    slide.addShape('rect', {
        x: 0,
        y: 0,
        w: SLIDE_WIDTH_IN,
        h: headerHeight,
        fill: { color: COLORS.kelpPrimary }
    });

    // 2. Gradient bottom border (2px pink→orange, approximated with pink)
    slide.addShape('rect', {
        x: 0,
        y: headerHeight - header.gradientBorderHeight,
        w: SLIDE_WIDTH_IN,
        h: header.gradientBorderHeight,
        fill: { color: COLORS.kelpAccentStart }
    });

    // 3. Kicker text (gradient text approximated with pink, uppercase, tracking-wider)
    if (kicker) {
        slide.addText(kicker.toUpperCase(), {
            x: header.paddingX,
            y: 0.12,
            w: SLIDE_WIDTH_IN * 0.7,
            h: 0.18,
            fontFace: TYPOGRAPHY.fontFamily,
            fontSize: header.kickerSize.pt,
            bold: true,
            color: COLORS.kelpAccentStart,
            charSpacing: TYPOGRAPHY.letterSpacing.wider
        });
    }

    // 4. Main title (text-xl, font-bold, text-white) - parse **bold**
    if (title) {
        const titleParts = parseMarkdownToPptx(title);
        slide.addText(titleParts.length > 0 ? titleParts : title, {
            x: header.paddingX,
            y: 0.28,
            w: SLIDE_WIDTH_IN * 0.65,
            h: 0.35,
            fontFace: TYPOGRAPHY.fontFamily,
            fontSize: header.titleSize.pt,
            bold: true,
            color: COLORS.white,
            shrinkText: true // Prevent overflow
        });
    }

    // 5. Kelp Logo (top right) - matching frontend position exactly
    // Logo dimensions: ~1.2" wide to match frontend header logo
    const logoWidth = 1.2;
    const logoHeight = 0.45;
    const logoX = SLIDE_WIDTH_IN - header.paddingX - logoWidth; // Right align with padding
    const logoY = (header.height - logoHeight) / 2; // Vertically center in header

    slide.addImage({
        path: '/kelp_logo.png', // Served from public folder
        x: logoX,
        y: logoY,
        w: logoWidth,
        h: logoHeight,
        sizing: { type: 'contain', w: logoWidth, h: logoHeight }
    });
}

// ============================================================================
// FOOTER
// ============================================================================
function renderFooter(slide: pptxgen.Slide, slideNumber: number) {
    const { footer } = COMPONENTS;

    slide.addText(slideNumber.toString(), {
        x: SLIDE_WIDTH_IN - 0.6,
        y: SLIDE_HEIGHT_IN - footer.height,
        w: 0.4,
        h: footer.height,
        fontFace: TYPOGRAPHY.fontFamily,
        fontSize: footer.fontSize.pt,
        color: footer.color,
        align: 'right',
        valign: 'middle'
    });
}

// ============================================================================
// BLOCK ROUTER
// ============================================================================
async function renderBlock(slide: pptxgen.Slide, pos: any) {
    const { block, left, top, width, height } = pos;
    const x = pxToIn(left);
    const y = pxToIn(top);
    const w = pxToIn(width);
    const h = pxToIn(height);

    switch (block.block_type) {
        case 'text_deep_dive':
            renderTextBlock(slide, block, x, y, w, h);
            break;
        case 'dashboard_grid':
            renderDashboardBlock(slide, block, x, y, w, h);
            break;
        case 'chart_complex':
            renderChartBlock(slide, block, x, y, w, h);
            break;
        case 'visual_map':
            await renderVisualMapBlock(slide, block, x, y, w, h);
            break;
        case 'logo_grid':
            renderLogoGridBlock(slide, block, x, y, w, h);
            break;
        case 'composite_block':
            renderCompositeBlock(slide, block, x, y, w, h);
            break;
        default:
            renderUnknownBlock(slide, block, x, y, w, h);
    }
}

// ============================================================================
// CONSISTENT BLOCK HEADER (w-full, text-lg, NOT uppercase)
// Used by ALL block types for consistency
// ============================================================================
function renderBlockHeader(slide: pptxgen.Slide, heading: string, x: number, y: number, w: number): number {
    const headingHeight = 0.35; // py-2 equivalent

    // Header background (w-full) with subtle rounded corners
    slide.addShape('rect', {
        x: x,
        y: y,
        w: w,
        h: headingHeight,
        fill: { color: COLORS.kelpPrimary },
        rectRadius: 0.02
    });

    // Header text (text-lg, NOT uppercase, with **bold** parsing)
    const headingParts = parseMarkdownToPptx(heading);
    slide.addText(headingParts.length > 0 ? headingParts : heading, {
        x: x + 0.12,
        y: y,
        w: w - 0.24,
        h: headingHeight,
        fontFace: TYPOGRAPHY.fontFamily,
        fontSize: TYPOGRAPHY.sizes.lg.pt,
        bold: true,
        color: COLORS.white,
        valign: 'middle',
        shrinkText: true // Prevent text overflow
    });

    return headingHeight;
}

// ============================================================================
// HELPER: Dynamic Font Sizing
// Calculates optimal font size to fit text within a box
// ============================================================================
function calculateDynamicFontSize(textLength: number, boxWidth: number, boxHeight: number): number {
    const minSize = 8;
    const maxSize = 14;
    const baseSize = 11;
    const avgCharArea = 0.015; // Rough estimate in sq inches for ~11pt font

    const availableArea = boxWidth * boxHeight;
    const estimatedTextArea = textLength * avgCharArea;

    if (estimatedTextArea > availableArea) {
        return minSize;
    } else if (estimatedTextArea < availableArea * 0.5) {
        return maxSize;
    }
    return baseSize;
}

// ============================================================================
// HELPER: Parse markdown-style bullets into PPTX Text Objects
// Handles "**Bold**" syntax and ensures bullets appear correctly
// ============================================================================
function parseRichText(bullets: string[]) {
    const textObjects: any[] = [];

    bullets.forEach((bulletText) => {
        // 1. Clean up (skip empty lines)
        if (!bulletText.trim()) return;

        // 2. Split by ** to find bold parts
        const parts = bulletText.split(/(\*\*.*?\*\*)/g);
        // Track valid parts for this bullet line
        const validParts = parts.filter(p => p !== "");

        validParts.forEach((part, index) => {
            const isBold = part.startsWith("**") && part.endsWith("**");
            const cleanText = isBold ? part.slice(2, -2) : part;

            const textObj: any = {
                text: cleanText,
                options: {
                    fontSize: TYPOGRAPHY.sizes.sm.pt,
                    color: COLORS.slate700,
                    bold: isBold,
                    fontFace: TYPOGRAPHY.fontFamily,
                    breakLine: false // Default false
                }
            };

            // 3. BULLET LOGIC: Only the FIRST text node of the line gets the bullet
            if (index === 0) {
                // FIXED: Removed invalid 'marginPt' from bullet object
                textObj.options.bullet = {
                    color: COLORS.kelpAccentStart
                };
                textObj.options.indentLevel = 0;
            }

            // 4. NEW LINE LOGIC: The LAST text node of the line triggers the break
            if (index === validParts.length - 1) {
                textObj.options.breakLine = true;
                textObj.options.softBreak = false; // Hard break
            }

            textObjects.push(textObj);
        });
    });

    return textObjects;
}

// ============================================================================
// TEXT BLOCK
// Soft UI: Rounded corners (0.5), Dynamic Font Sizing
// ============================================================================
function renderTextBlock(slide: pptxgen.Slide, block: any, x: number, y: number, w: number, h: number) {
    const bgColor = block.style_variant === 2 ? COLORS.orange50 : COLORS.slate50;
    const padding = SPACING.padding.sm;
    const contentH = h - padding * 2 - 0.35 - 0.2; // roughly h - vertical padding - blockHeader height

    // 1. Shadow layer (High Rounding)
    slide.addShape('rect', {
        x: x + SHADOWS.sm.offsetX,
        y: y + SHADOWS.sm.offsetY,
        w: w,
        h: h,
        fill: { color: SHADOWS.sm.color, transparency: SHADOWS.sm.transparency },
        rectRadius: 0.5 // Soft UI
    });

    // 2. Main container (High Rounding)
    slide.addShape('rect', {
        x: x,
        y: y,
        w: w,
        h: h,
        fill: { color: bgColor },
        line: { color: COLORS.slate200, width: 1 },
        rectRadius: 0.5 // Soft UI
    });

    // 3. Consistent header
    const headingHeight = renderBlockHeader(slide, block.heading, x, y + padding, w);

    // 4. Bullet content with Dynamic Layout
    let textObjects: any[] = [];
    const slateContent = block.slate_content;

    // Content Parsing
    if (slateContent && Array.isArray(slateContent)) {
        textObjects = parseSlateToPptx(slateContent);
    } else if (block.verbose_bullets && block.verbose_bullets.length > 0) {
        textObjects = parseRichText(block.verbose_bullets);
    } else if (block.bullets && block.bullets.length > 0) { // Fallback for 'bullets' key
        textObjects = parseRichText(block.bullets);
    }

    if (textObjects.length > 0) {
        // Calculate total text length for sizing
        const totalTextLength = textObjects.reduce((acc, obj) => acc + (obj.text?.length || 0), 0);
        const dynamicFontSize = calculateDynamicFontSize(totalTextLength, w, contentH);

        // Apply dynamic font size to all objects
        textObjects.forEach(obj => {
            if (obj.options) obj.options.fontSize = dynamicFontSize;
        });

        slide.addText(textObjects, {
            x: x + 0.15,
            y: y + padding + headingHeight + 0.1,
            w: w - 0.3,
            h: contentH, // Exact height constraint
            fontFace: TYPOGRAPHY.fontFamily,
            fontSize: dynamicFontSize,
            color: COLORS.slate700,
            valign: 'top',
            align: 'left',
            lineSpacing: 18, // Frontend matching density
            margin: 5, // Internal margin
            shrinkText: true // Failsafe
        });
    }
}

// ============================================================================
// DASHBOARD BLOCK (matching dashboard-grid-block.tsx)
// Soft UI: Rounded corners (0.5)
// ============================================================================
function renderDashboardBlock(slide: pptxgen.Slide, block: any, x: number, y: number, w: number, h: number) {
    const padding = SPACING.padding.sm;
    const gap = SPACING.gap.sm;

    // Consistent header
    const headingHeight = renderBlockHeader(slide, block.heading, x, y + padding, w);

    const metrics = block.contextual_metrics || [];
    const isList = Array.isArray(metrics) && typeof metrics[0] === 'string';
    const contentY = y + padding + headingHeight + gap;
    const contentH = h - padding * 2 - headingHeight - gap; // FULL remaining height
    const contentW = w - 0.16; // Full width with small margin

    if (isList) {
        // Badge mode - cells fill entire space
        const items = metrics as string[];
        const cols = items.length <= 2 ? items.length : items.length <= 4 ? 2 : 3;
        const rows = Math.ceil(items.length / cols);
        const cellW = (contentW - gap * (cols - 1)) / cols;
        const cellH = (contentH - gap * (rows - 1)) / rows; // FILL space

        items.forEach((badge: string, idx: number) => {
            const row = Math.floor(idx / cols);
            const col = idx % cols;
            const cellX = x + 0.08 + col * (cellW + gap);
            const cellY = contentY + row * (cellH + gap);

            // Shadow - very light (Soft Rounding)
            slide.addShape('rect', {
                x: cellX + 0.02,
                y: cellY + 0.02,
                w: cellW,
                h: cellH,
                fill: { color: COLORS.slate200, transparency: 85 },
                rectRadius: 0.5
            });

            // Card (Soft Rounding)
            slide.addShape('rect', {
                x: cellX,
                y: cellY,
                w: cellW,
                h: cellH,
                fill: { color: COLORS.white },
                line: { color: COLORS.kelpPrimary, width: 1 },
                rectRadius: 0.5
            });

            // Text with **bold** parsing
            const badgeParts = parseMarkdownToPptx(badge);
            slide.addText(badgeParts.length > 0 ? badgeParts : badge, {
                x: cellX,
                y: cellY,
                w: cellW,
                h: cellH,
                fontFace: TYPOGRAPHY.fontFamily,
                fontSize: TYPOGRAPHY.sizes.sm.pt,
                bold: true,
                color: COLORS.kelpPrimary,
                align: 'center',
                valign: 'middle'
            });
        });
    } else {
        // Key-value mode - cells fill entire space
        const entries = Object.entries(metrics as Record<string, string>);
        const cols = entries.length <= 2 ? entries.length : entries.length <= 4 ? 2 : 3;
        const rows = Math.ceil(entries.length / cols);
        const cellW = (contentW - gap * (cols - 1)) / cols;
        const cellH = (contentH - gap * (rows - 1)) / rows; // FILL space

        entries.forEach(([key, value], idx) => {
            const row = Math.floor(idx / cols);
            const col = idx % cols;
            const cellX = x + 0.08 + col * (cellW + gap);
            const cellY = contentY + row * (cellH + gap);

            // Shadow (Soft Rounding)
            slide.addShape('rect', {
                x: cellX + 0.01,
                y: cellY + 0.01,
                w: cellW,
                h: cellH,
                fill: { color: COLORS.slate300, transparency: 70 },
                rectRadius: 0.5
            });

            // Card (Soft Rounding)
            slide.addShape('rect', {
                x: cellX,
                y: cellY,
                w: cellW,
                h: cellH,
                fill: { color: COLORS.white },
                line: { color: COLORS.kelpAccentStart, width: 1, transparency: 70 },
                rectRadius: 0.5
            });

            // Value (text-2xl, font-bold) with **bold** parsing
            const valueParts = parseMarkdownToPptx(value);
            slide.addText(valueParts.length > 0 ? valueParts : value, {
                x: cellX,
                y: cellY + cellH * 0.1,
                w: cellW,
                h: cellH * 0.5,
                fontFace: TYPOGRAPHY.fontFamily,
                fontSize: TYPOGRAPHY.sizes['2xl'].pt,
                bold: true,
                color: COLORS.kelpPrimary,
                align: 'center',
                valign: 'middle',
                shrinkText: true
            });

            // Label (text-xs, uppercase)
            slide.addText(key.toUpperCase(), {
                x: cellX,
                y: cellY + cellH * 0.55,
                w: cellW,
                h: cellH * 0.35,
                fontFace: TYPOGRAPHY.fontFamily,
                fontSize: TYPOGRAPHY.sizes.xs.pt,
                color: COLORS.slate500,
                align: 'center',
                valign: 'top',
                charSpacing: TYPOGRAPHY.letterSpacing.wider
            });
        });
    }
}

// ============================================================================
// CHART BLOCK (matching chart-block.tsx)
// NO border, bg-white
// Header: CONSISTENT
// ============================================================================
function renderChartBlock(slide: pptxgen.Slide, block: any, x: number, y: number, w: number, h: number) {
    const padding = SPACING.padding.sm;
    const gap = SPACING.gap.sm;
    const chartData: ChartData = block.chart_data;

    // Background (Soft UI)
    slide.addShape('rect', {
        x: x,
        y: y,
        w: w,
        h: h,
        fill: { color: COLORS.white },
        rectRadius: 0.5
    });

    // Consistent header
    const headingHeight = renderBlockHeader(slide, block.heading, x, y + padding, w);

    const chartY = y + padding + headingHeight + gap;
    const chartH = h - padding * 2 - headingHeight - gap - (chartData.strategic_analysis ? 0.3 : 0);

    // Prepare chart data
    const chartDataForPptx = chartData.datasets.map((ds) => ({
        name: ds.label,
        labels: chartData.labels,
        values: ds.data
    }));

    try {
        switch (chartData.chart_type) {
            case 'bar':
                slide.addChart('bar', chartDataForPptx as any, {
                    x: x + 0.1,
                    y: chartY,
                    w: w - 0.2,
                    h: chartH,
                    showLegend: chartData.datasets.length > 1,
                    legendPos: 'b',
                    barDir: 'col',
                    barGrouping: 'clustered',
                    chartColors: CHART_COLORS,
                    showValue: false,
                    catGridLine: { style: 'none' },
                    valGridLine: { color: COLORS.slate200, style: 'dash' }
                });
                break;

            case 'line':
                slide.addChart('line', chartDataForPptx as any, {
                    x: x + 0.1,
                    y: chartY,
                    w: w - 0.2,
                    h: chartH,
                    showLegend: chartData.datasets.length > 1,
                    legendPos: 'b',
                    chartColors: CHART_COLORS,
                    lineDataSymbol: 'circle',
                    lineDataSymbolSize: 8,
                    lineSize: 2.5,
                    catGridLine: { style: 'none' },
                    valGridLine: { color: COLORS.slate200, style: 'dash' }
                });
                break;

            case 'doughnut':
                slide.addChart('doughnut', chartDataForPptx as any, {
                    x: x + 0.1,
                    y: chartY,
                    w: w - 0.2,
                    h: chartH,
                    showLegend: true,
                    legendPos: 'r',
                    chartColors: CHART_COLORS,
                    holeSize: 50
                });
                break;

            case 'stacked_bar':
                slide.addChart('bar', chartDataForPptx as any, {
                    x: x + 0.1,
                    y: chartY,
                    w: w - 0.2,
                    h: chartH,
                    showLegend: true,
                    legendPos: 'b',
                    barDir: 'col',
                    barGrouping: 'stacked',
                    chartColors: CHART_COLORS
                });
                break;

            case 'combo_bar_line':
                slide.addChart('bar', chartDataForPptx as any, {
                    x: x + 0.1,
                    y: chartY,
                    w: w - 0.2,
                    h: chartH,
                    showLegend: true,
                    legendPos: 'b',
                    barDir: 'col',
                    chartColors: CHART_COLORS
                });
                break;

            default:
                slide.addChart('bar', chartDataForPptx as any, {
                    x: x + 0.1,
                    y: chartY,
                    w: w - 0.2,
                    h: chartH,
                    barDir: 'col',
                    chartColors: CHART_COLORS
                });
        }
    } catch (e) {
        slide.addText('[Chart: ' + chartData.chart_type + ']', {
            x: x,
            y: chartY,
            w: w,
            h: chartH,
            align: 'center',
            valign: 'middle',
            color: COLORS.slate500
        });
    }

    // Strategic analysis
    if (chartData.strategic_analysis) {
        slide.addText(chartData.strategic_analysis, {
            x: x + 0.1,
            y: y + h - 0.25,
            w: w - 0.2,
            h: 0.2,
            fontFace: TYPOGRAPHY.fontFamily,
            fontSize: 8,
            italic: true,
            color: COLORS.slate500,
            align: 'center',
            valign: 'middle'
        });
    }
}

// ============================================================================
// HELPER: Convert image URL to base64 data URL
// ============================================================================
async function imageUrlToBase64(url: string): Promise<string> {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Failed to convert image to base64:', error);
        throw error;
    }
}

// ============================================================================
// VISUAL MAP BLOCK
// ============================================================================
async function renderVisualMapBlock(slide: pptxgen.Slide, block: any, x: number, y: number, w: number, h: number) {
    const padding = SPACING.padding.sm;
    const gap = SPACING.gap.sm;

    // Background
    slide.addShape('rect', {
        x: x,
        y: y,
        w: w,
        h: h,
        fill: { color: COLORS.white }
    });

    // Consistent header
    const headingHeight = renderBlockHeader(slide, block.heading, x, y + padding, w);

    // Content area
    const contentY = y + padding + headingHeight + gap;
    const contentH = h - padding * 2 - headingHeight - gap;

    // Image Container Background (fallback)
    slide.addShape('rect', {
        x: x + 0.08,
        y: contentY,
        w: w - 0.16,
        h: contentH,
        fill: { color: COLORS.slate50 },
        line: { color: COLORS.kelpAction, width: 2 },
        rectRadius: 0.5 // Soft UI
    });

    if (block.image_url) {
        try {
            // Convert image URL to base64
            const base64Image = await imageUrlToBase64(block.image_url);

            // Embed Image using base64
            slide.addImage({
                data: base64Image,
                x: x + 0.08,
                y: contentY,
                w: w - 0.16,
                h: contentH,
                sizing: { type: 'cover', w: w - 0.16, h: contentH } // Crop to fill
            });

            // Add prompt overlay text (small, bottom)
            slide.addText(block.detailed_image_prompt || '', {
                x: x + 0.08,
                y: contentY + contentH - 0.3,
                w: w - 0.16,
                h: 0.3,
                fontSize: 8,
                color: COLORS.white,
                fill: { color: '000000', transparency: 50 },
                align: 'center',
                valign: 'middle'
            });
        } catch (error) {
            console.error('Failed to load image:', error);
            // Fallback Text
            slide.addText('[Visual: Image Load Failed]', {
                x: x + 0.08,
                y: contentY,
                w: w - 0.16,
                h: contentH,
                fontFace: TYPOGRAPHY.fontFamily,
                fontSize: TYPOGRAPHY.sizes.sm.pt,
                italic: true,
                color: COLORS.danger,
                align: 'center',
                valign: 'middle'
            });
        }
    } else {
        // Fallback Text
        slide.addText('[Visual: ' + (block.detailed_image_prompt || 'Image') + ']', {
            x: x + 0.08,
            y: contentY,
            w: w - 0.16,
            h: contentH,
            fontFace: TYPOGRAPHY.fontFamily,
            fontSize: TYPOGRAPHY.sizes.sm.pt,
            italic: true,
            color: COLORS.slate600,
            align: 'center',
            valign: 'middle'
        });
    }
}

// ============================================================================
// LOGO GRID BLOCK
// ============================================================================
function renderLogoGridBlock(slide: pptxgen.Slide, block: any, x: number, y: number, w: number, h: number) {
    const padding = SPACING.padding.sm;
    const gap = SPACING.gap.md;

    // Background
    slide.addShape('rect', {
        x: x,
        y: y,
        w: w,
        h: h,
        fill: { color: COLORS.white }
    });

    // Consistent header
    const headingHeight = renderBlockHeader(slide, block.heading, x, y + padding, w);

    // Logo grid
    const logos = block.logos || [];
    const cols = 4;
    const contentY = y + padding + headingHeight + gap;
    const contentH = h - padding * 2 - headingHeight - gap;
    const contentW = w - 0.16;
    const rows = Math.ceil(logos.length / cols);
    const cellSize = Math.min((contentW - gap * (cols - 1)) / cols, (contentH - gap * (rows - 1)) / rows);

    logos.forEach((logo: string, idx: number) => {
        const row = Math.floor(idx / cols);
        const col = idx % cols;
        const cellX = x + 0.08 + col * (cellSize + gap);
        const cellY = contentY + row * (cellSize + gap);

        slide.addShape('ellipse', {
            x: cellX,
            y: cellY,
            w: cellSize,
            h: cellSize,
            fill: { color: COLORS.slate50 },
            line: { color: COLORS.kelpAccentStart, width: 2, transparency: 50 }
        });

        slide.addText(logo, {
            x: cellX,
            y: cellY,
            w: cellSize,
            h: cellSize,
            fontFace: TYPOGRAPHY.fontFamily,
            fontSize: 7,
            bold: true,
            color: COLORS.kelpPrimary,
            align: 'center',
            valign: 'middle',
            shrinkText: true
        });
    });
}

// ============================================================================
// COMPOSITE BLOCK
// ============================================================================
function renderCompositeBlock(slide: pptxgen.Slide, block: any, x: number, y: number, w: number, h: number) {
    const padding = SPACING.padding.sm;
    const gap = SPACING.gap.md;

    // Consistent header
    const headingHeight = renderBlockHeader(slide, block.heading, x, y + padding, w);

    // Sub-blocks
    const subBlocks = block.sub_blocks || [];
    const subHeadings = block.sub_block_headings || [];
    const numSubs = subBlocks.length || 2;
    const contentY = y + padding + headingHeight + gap;
    const contentH = h - padding * 2 - headingHeight - gap;
    const subW = (w - 0.08 - gap * (numSubs - 1)) / numSubs;

    for (let i = 0; i < numSubs; i++) {
        const subX = x + 0.04 + i * (subW + gap);

        if (i > 0) {
            slide.addShape('rect', {
                x: subX - gap / 2,
                y: contentY,
                w: 0.01,
                h: contentH,
                fill: { color: COLORS.slate200 }
            });
        }

        // Sub-heading
        const subHeading = subHeadings[i] || subBlocks[i]?.heading || `Section ${i + 1}`;
        slide.addText(subHeading.toUpperCase(), {
            x: subX + 0.04,
            y: contentY,
            w: subW - 0.08,
            h: 0.2,
            fontFace: TYPOGRAPHY.fontFamily,
            fontSize: TYPOGRAPHY.sizes.xs.pt,
            bold: true,
            color: COLORS.slate500,
            charSpacing: TYPOGRAPHY.letterSpacing.wider
        });

        // Content area fills remaining space
        slide.addShape('rect', {
            x: subX,
            y: contentY + 0.25,
            w: subW,
            h: contentH - 0.3,
            fill: { color: COLORS.slate50 },
            rectRadius: 0.5 // Soft UI
        });

        slide.addText('[Content]', {
            x: subX,
            y: contentY + 0.25,
            w: subW,
            h: contentH - 0.3,
            fontFace: TYPOGRAPHY.fontFamily,
            fontSize: TYPOGRAPHY.sizes.xs.pt,
            color: COLORS.slate400,
            align: 'center',
            valign: 'middle'
        });
    }
}

// ============================================================================
// UNKNOWN BLOCK FALLBACK
// ============================================================================
function renderUnknownBlock(slide: pptxgen.Slide, block: any, x: number, y: number, w: number, h: number) {
    slide.addShape('rect', {
        x: x,
        y: y,
        w: w,
        h: h,
        fill: { color: 'FEE2E2' },
        line: { color: 'EF4444', width: 1 },
        rectRadius: 0.5 // Soft UI
    });

    slide.addText('Unknown Block: ' + block.block_type, {
        x: x,
        y: y,
        w: w,
        h: h,
        fontFace: TYPOGRAPHY.fontFamily,
        fontSize: TYPOGRAPHY.sizes.base.pt,
        color: 'EF4444',
        align: 'center',
        valign: 'middle'
    });
}

// ============================================================================
// SLATE TO PPTX PARSER (with ** bold support)
// ============================================================================
function parseSlateToPptx(nodes: SlateNode[], level: number = 0, listType: 'ul' | 'ol' = 'ul'): any[] {
    let result: any[] = [];

    nodes.forEach(node => {
        if (node.text !== undefined) {
            // Parse **bold** within slate text
            const parts = parseMarkdownToPptx(node.text);
            parts.forEach(part => {
                result.push({
                    text: typeof part === 'string' ? part : part.text,
                    options: {
                        bold: node.bold || (part.options?.bold),
                        italic: node.italic,
                        underline: node.underline,
                        fontSize: TYPOGRAPHY.sizes.sm.pt,
                        color: COLORS.slate700
                    }
                });
            });
        } else if (node.type === 'ul') {
            if (node.children) {
                // Pass level + 1? No, level should match recursion depth of LI
                // But generally, UL inside UL implies nesting.
                // We keep level same for root, but increment when recursing.
                // However, li recurses for its children.
                // So here we pass level as is, and LI handles increment?
                // Actually, if we are inside an LI, level is already correct?
                // Let's rely on LI to increment level for its children.
                result = [...result, ...parseSlateToPptx(node.children, level, 'ul')];
            }
        } else if (node.type === 'ol') {
            if (node.children) {
                result = [...result, ...parseSlateToPptx(node.children, level, 'ol')];
            }
        } else if (node.type === 'li') {
            // Recurse with level + 1 so nested lists get indented
            if (node.children) {
                const itemParts = parseSlateToPptx(node.children, level + 1, listType);
                if (itemParts.length > 0) {
                    const bulletConfig = listType === 'ol'
                        ? { type: 'number', color: COLORS.kelpAccentStart }
                        : { color: COLORS.kelpAccentStart };

                    // Apply bullet and indent to the FIRST text node of the item
                    itemParts[0].options = {
                        ...itemParts[0].options,
                        bullet: bulletConfig,
                        indentLevel: level
                    };

                    // Force breakLine on the last text part of the list item
                    const lastPart = itemParts[itemParts.length - 1];
                    if (!lastPart.options.breakLine) {
                        lastPart.options.breakLine = true;
                    }

                    result = [...result, ...itemParts];
                }
            }
        } else if (node.type === 'paragraph') {
            if (node.children) {
                const pParts = parseSlateToPptx(node.children, level, listType);
                if (pParts.length > 0) {
                    // Use breakLine:true instead of appending newline char
                    pParts[pParts.length - 1].options.breakLine = true;
                    result = [...result, ...pParts];
                }
            }
        } else if (node.children) {
            result = [...result, ...parseSlateToPptx(node.children, level, listType)];
        }
    });

    return result;
}
