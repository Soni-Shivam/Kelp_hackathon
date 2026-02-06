// ============================================================================
// DESIGN SYSTEM - Single Source of Truth for Frontend & PPTX Export
// ============================================================================
// This file ensures pixel-perfect consistency between React components and
// exported PowerPoint slides by using unified design tokens.

// ----------------------------------------------------------------------------
// SLIDE DIMENSIONS (16:9 Aspect Ratio)
// ----------------------------------------------------------------------------
export const SLIDE_WIDTH_IN = 13.333;  // inches
export const SLIDE_HEIGHT_IN = 7.5;    // inches
export const DPI = 96;                  // Standard screen DPI

// ----------------------------------------------------------------------------
// UNIT CONVERSION UTILITIES
// ----------------------------------------------------------------------------
/** Convert inches to CSS pixels (for frontend) */
export const inToPx = (inches: number): number => Math.round(inches * DPI);

/** Convert CSS pixels to inches (for PPTX) */
export const pxToIn = (px: number): number => px / DPI;

/** Convert Tailwind rem to pixels (1rem = 16px base) */
export const remToPx = (rem: number): number => rem * 16;

/** Convert pixels to PowerPoint points (1pt = 1/72 inch) */
export const pxToPt = (px: number): number => Math.round((px / DPI) * 72);

// ----------------------------------------------------------------------------
// SPACING TOKENS (Matching Tailwind spacing scale)
// ----------------------------------------------------------------------------
export const SPACING = {
    // Margins
    marginX: 0.5,           // 48px - matches p-12 / mx-12
    marginY: 0.667,         // 64px - header height (h-16)
    marginBottom: 0.4,      // 38px - footer area

    // Gaps between elements
    gap: {
        xs: 0.083,          // 8px - gap-2
        sm: 0.125,          // 12px - gap-3
        md: 0.167,          // 16px - gap-4
        lg: 0.25,           // 24px - gap-6
        xl: 0.333,          // 32px - gap-8
    },

    // Padding
    padding: {
        xs: 0.042,          // 4px - p-1
        sm: 0.083,          // 8px - p-2
        md: 0.125,          // 12px - p-3
        lg: 0.167,          // 16px - p-4
        xl: 0.25,           // 24px - p-6
    },

    // Border radius (in inches)
    radius: {
        sm: 0.02,           // rounded-sm
        md: 0.04,           // rounded
        lg: 0.08,           // rounded-lg
        xl: 0.12,           // rounded-xl
    }
};

// ----------------------------------------------------------------------------
// TYPOGRAPHY TOKENS (Matching Tailwind text scale)
// Font: Arial (matches font-sans: ["Arial", "Inter", ...])
// ----------------------------------------------------------------------------
export const TYPOGRAPHY = {
    fontFamily: 'Arial',

    // Size scale: { pt: PowerPoint points, px: CSS pixels }
    sizes: {
        xs: { pt: 9, px: 12 },      // text-xs
        sm: { pt: 10.5, px: 14 },   // text-sm
        base: { pt: 12, px: 16 },   // text-base
        lg: { pt: 13.5, px: 18 },   // text-lg
        xl: { pt: 15, px: 20 },     // text-xl
        '2xl': { pt: 18, px: 24 },  // text-2xl
        '3xl': { pt: 22.5, px: 30 }, // text-3xl
        '4xl': { pt: 27, px: 36 },  // text-4xl
    },

    // Line heights
    lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
    },

    // Letter spacing (Tailwind tracking)
    letterSpacing: {
        tight: -0.5,
        normal: 0,
        wide: 0.5,
        wider: 1,
        widest: 2,
    }
};

// ----------------------------------------------------------------------------
// COLOR PALETTE (Matching tailwind.config.js exactly)
// All colors WITHOUT # prefix for PPTX compatibility
// ----------------------------------------------------------------------------
export const COLORS = {
    // Kelp Brand
    kelpPrimary: '4B0082',      // Dark Indigo - PRIMARY brand color
    kelpAccentStart: 'FF69B4',  // Hot Pink - gradient start
    kelpAccentEnd: 'FF8C00',    // Dark Orange - gradient end
    kelpAction: '00FFFF',       // Cyan - action/CTA elements

    // Backgrounds
    bgApp: 'F8FAFC',            // kelp-bg-app (slate-50)
    bgSlide: 'FFFFFF',          // kelp-bg-slide (white)
    bgCard: 'FFFFFF',           // Card backgrounds

    // Slate scale (Tailwind)
    slate50: 'F8FAFC',
    slate100: 'F1F5F9',
    slate200: 'E2E8F0',
    slate300: 'CBD5E1',
    slate400: '94A3B8',
    slate500: '64748B',
    slate600: '475569',
    slate700: '334155',
    slate800: '1E293B',
    slate900: '0F172A',

    // Semantic
    white: 'FFFFFF',
    black: '000000',
    orange50: 'FFF7ED',         // Style variant 2

    // Status colors
    success: '22C55E',
    danger: 'EF4444',
};

// Chart colors (matching chart-block.tsx)
export const CHART_COLORS = [
    COLORS.kelpPrimary,     // 4B0082 - Indigo
    COLORS.kelpAccentStart, // FF69B4 - Pink
    COLORS.kelpAccentEnd,   // FF8C00 - Orange
    COLORS.kelpAction,      // 00FFFF - Cyan
    '82ca9d',               // Green
    '8884d8',               // Purple
];

// ----------------------------------------------------------------------------
// SHADOW DEFINITIONS (For simulating CSS box-shadow in PPTX)
// ----------------------------------------------------------------------------
export const SHADOWS = {
    sm: {
        offsetX: 0.02,      // 2px right
        offsetY: 0.02,      // 2px down
        blur: 0.04,         // 4px blur (approximated)
        color: COLORS.slate300,
        transparency: 60,   // 40% opacity
    },
    md: {
        offsetX: 0.03,
        offsetY: 0.03,
        blur: 0.06,
        color: COLORS.slate400,
        transparency: 50,
    },
    lg: {
        offsetX: 0.04,
        offsetY: 0.04,
        blur: 0.1,
        color: COLORS.slate500,
        transparency: 40,
    }
};

// ----------------------------------------------------------------------------
// COMPONENT-SPECIFIC TOKENS
// ----------------------------------------------------------------------------
export const COMPONENTS = {
    // Slide Header (matches slide-header.tsx)
    header: {
        height: 0.667,          // 64px (h-16)
        paddingX: 0.333,        // 32px (px-8)
        kickerSize: TYPOGRAPHY.sizes.xs,
        titleSize: TYPOGRAPHY.sizes.xl,
        brandingSize: TYPOGRAPHY.sizes.sm,
        gradientBorderHeight: 0.021, // 2px
    },

    // Block Heading Strip (matches text-block.tsx, etc.)
    blockHeading: {
        height: 0.35,           // ~33px
        paddingX: 0.125,        // 12px (px-3)
        paddingY: 0.042,        // 4px (py-1)
        fontSize: TYPOGRAPHY.sizes.sm,
    },

    // Card Container
    card: {
        borderWidth: 1,         // 1px border
        borderColor: COLORS.slate200,
        borderRadius: SPACING.radius.sm,
        shadow: SHADOWS.sm,
    },

    // Footer
    footer: {
        height: 0.3,
        fontSize: TYPOGRAPHY.sizes.xs,
        color: COLORS.slate400,
    }
};

// ----------------------------------------------------------------------------
// LAYOUT CALCULATION HELPERS
// ----------------------------------------------------------------------------
/** Calculate content area dimensions (excluding header and footer) */
export function getContentArea() {
    return {
        x: SPACING.marginX,
        y: COMPONENTS.header.height + SPACING.gap.md,
        w: SLIDE_WIDTH_IN - (SPACING.marginX * 2),
        h: SLIDE_HEIGHT_IN - COMPONENTS.header.height - SPACING.marginBottom - SPACING.gap.md,
    };
}

/** Calculate canvas dimensions in pixels (for frontend) */
export function getCanvasPx() {
    return {
        width: inToPx(SLIDE_WIDTH_IN),   // 1280px
        height: inToPx(SLIDE_HEIGHT_IN), // 720px
    };
}
