import { z } from 'zod';

export const blockAttributesSchema = z.record(z.unknown()).optional();

export const blockTypeSchema = z.enum([
  'paragraph',
  'heading',
  'rich_text',
  'list',
  'quote',
  'code',
  'image',
  'gallery',
  'video',
  'audio',
  'file',
  'button',
  'link',
  'table',
  'divider',
  'spacer',
  'columns',
  'cards',
  'hero',
  'cta',
  'accordion',
  'tabs',
  'embed',
  'html',
  'markdown',
  'custom',
]);

export interface BlockNodeInput {
  id: string;
  type: string;
  attributes?: Record<string, unknown>;
  data?: Record<string, unknown>;
  children?: BlockNodeInput[];
}

export const blockNodeSchema: z.ZodType<BlockNodeInput, z.ZodTypeDef, any> = z.lazy(() =>
  z.object({
    id: z.string().min(1),
    type: blockTypeSchema,
    attributes: blockAttributesSchema,
    data: z.record(z.unknown()).default({}),
    children: z.array(blockNodeSchema).optional(),
  })
);

export const blocksArraySchema = z.array(blockNodeSchema);

export function validateBlocks(blocks: unknown): { success: boolean; data?: BlockNodeInput[]; error?: string } {
  const result = blocksArraySchema.safeParse(blocks);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error.message };
}
