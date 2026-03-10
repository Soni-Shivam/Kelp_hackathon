export type BlockType =
    'text_deep_dive' |
    'dashboard_grid' |
    'chart_complex' |
    'visual_map' |
    'logo_grid' |
    'composite_block';

export type ChartType =
    'combo_bar_line' |
    'stacked_bar' |
    'doughnut' |
    'bar' |
    'line';

export interface ChartDataset {
    label: string;
    data: number[];
    type?: 'bar' | 'line'; // For combo charts
}

export interface ChartData {
    title: string;
    chart_type: ChartType;
    labels: string[];
    datasets: ChartDataset[];
    strategic_analysis?: string;
}

export interface TextDeepDiveBlock {
    block_id: number;
    block_type: 'text_deep_dive';
    heading: string;
    verbose_bullets: string[];
    style_variant?: number; // 1=light grey, 2=light orange, 3=dashboard grid
    citation?: string;
    slate_content?: any[];
}

export interface DashboardGridBlock {
    block_id: number;
    block_type: 'dashboard_grid';
    heading: string;
    contextual_metrics: Record<string, string> | string[];
    citation?: string;
}

export interface ChartComplexBlock {
    block_id: number;
    block_type: 'chart_complex';
    heading: string;
    chart_data: ChartData;
    citation?: string;
}

export interface VisualMapBlock {
    block_id: number;
    block_type: 'visual_map';
    heading: string;
    detailed_image_prompt: string;
    image_url?: string;
    citation?: string;
}

export interface LogoGridBlock {
    block_id: number;
    block_type: 'logo_grid';
    heading: string;
    logos: string[];
    logo_urls?: string[]; // Resolved image URLs, parallel to logos[]
    citation?: string;
}

export interface CompositeBlock {
    block_id: number;
    block_type: 'composite_block';
    heading: string;
    sub_blocks: Exclude<SlideBlock, CompositeBlock>[];
    sub_block_headings: string[];
    citation?: string;
}

export type SlideBlock =
    | TextDeepDiveBlock
    | DashboardGridBlock
    | ChartComplexBlock
    | VisualMapBlock
    | LogoGridBlock
    | CompositeBlock;

export interface Slide {
    slide_number: number;
    kicker?: string;
    title: string;
    blocks: SlideBlock[];
}

export interface Presentation {
    project_code_name: string;
    sector: string;
    slides: Slide[];
}
