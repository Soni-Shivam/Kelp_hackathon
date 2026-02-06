export type BlockType = 'text' | 'metric' | 'chart' | 'image' | 'table';

export interface ContentBlock {
    id: string;
    type: BlockType;
    title?: string;
    data: any;
    source?: string;
}

export interface LayoutZone {
    id: string;
    type: 'zone';
    direction: 'row' | 'column';
    weight: number;
    children: (LayoutZone | ContentBlock)[];
    style?: 'plain' | 'card' | 'highlight';
}

export interface SlideData {
    title: string;
    kicker: string;
    footer: string;
    root_layout: LayoutZone;
}
