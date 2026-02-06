import { z } from 'zod';
import { LayoutZone } from '../../types/slide-schema';

export const blockTypeSchema = z.enum(['text', 'metric', 'chart', 'image', 'table']);

export const contentBlockSchema = z.object({
    id: z.string(),
    type: blockTypeSchema,
    title: z.string().optional(),
    data: z.any(),
    source: z.string().optional(),
});

export const layoutZoneSchema: z.ZodType<LayoutZone> = z.object({
    id: z.string(),
    type: z.literal('zone'),
    direction: z.enum(['row', 'column']),
    weight: z.number().default(1),
    children: z.lazy(() => z.array(z.union([layoutZoneSchema, contentBlockSchema]))),
    style: z.enum(['plain', 'card', 'highlight']).optional(),
});

export const slideSchema = z.object({
    title: z.string(),
    kicker: z.string(),
    footer: z.string(),
    root_layout: layoutZoneSchema,
});
