export type BlockType =
  | 'paragraph'
  | 'heading'
  | 'rich_text'
  | 'list'
  | 'quote'
  | 'code'
  | 'image'
  | 'gallery'
  | 'video'
  | 'audio'
  | 'file'
  | 'button'
  | 'link'
  | 'table'
  | 'divider'
  | 'spacer'
  | 'columns'
  | 'cards'
  | 'hero'
  | 'cta'
  | 'accordion'
  | 'tabs'
  | 'embed'
  | 'html'
  | 'markdown'
  | 'custom';

export interface BlockAttributes {
  align?: 'left' | 'center' | 'right' | 'justify';
  textColor?: string;
  backgroundColor?: string;
  padding?: string;
  margin?: string;
  customClass?: string;
  anchorId?: string;
  hiddenOnMobile?: boolean;
  hiddenOnDesktop?: boolean;
  [key: string]: unknown;
}

export interface BlockNode {
  id: string;
  type: BlockType;
  attributes?: BlockAttributes;
  data: Record<string, unknown>;
  children?: BlockNode[];
}

export interface BlockDefinition {
  type: BlockType;
  label: string;
  category: 'typography' | 'media' | 'layout' | 'interactive' | 'advanced';
  icon: string;
  description: string;
  defaultData: Record<string, unknown>;
  supportsChildren?: boolean;
}

export const BLOCK_DEFINITIONS: BlockDefinition[] = [
  {
    type: 'paragraph',
    label: 'Paragraph',
    category: 'typography',
    icon: 'Pilcrow',
    description: 'Standard body text block with typography options.',
    defaultData: { text: '' },
  },
  {
    type: 'heading',
    label: 'Heading',
    category: 'typography',
    icon: 'Heading',
    description: 'H1 to H6 headings for content hierarchy.',
    defaultData: { text: '', level: 2 },
  },
  {
    type: 'rich_text',
    label: 'Rich Text',
    category: 'typography',
    icon: 'FileText',
    description: 'Formatted HTML text with bold, italic, links, lists.',
    defaultData: { html: '<p></p>' },
  },
  {
    type: 'list',
    label: 'List',
    category: 'typography',
    icon: 'List',
    description: 'Ordered or bulleted list.',
    defaultData: { items: ['Item 1', 'Item 2'], ordered: false },
  },
  {
    type: 'quote',
    label: 'Quote',
    category: 'typography',
    icon: 'Quote',
    description: 'Blockquote with author citation.',
    defaultData: { quote: '', author: '', role: '' },
  },
  {
    type: 'code',
    label: 'Code Block',
    category: 'advanced',
    icon: 'Code',
    description: 'Syntax-highlighted code snippet.',
    defaultData: { code: '', language: 'typescript', filename: '' },
  },
  {
    type: 'image',
    label: 'Image',
    category: 'media',
    icon: 'Image',
    description: 'Single image with alt text, caption, and link.',
    defaultData: { url: '', alt: '', caption: '', width: null, height: null },
  },
  {
    type: 'gallery',
    label: 'Gallery',
    category: 'media',
    icon: 'Images',
    description: 'Grid or carousel of multiple images.',
    defaultData: { images: [], columns: 3, gap: '1rem' },
  },
  {
    type: 'video',
    label: 'Video',
    category: 'media',
    icon: 'Video',
    description: 'HTML5 or external video (YouTube/Vimeo).',
    defaultData: { url: '', provider: 'html5', autoplay: false, controls: true },
  },
  {
    type: 'audio',
    label: 'Audio',
    category: 'media',
    icon: 'Music',
    description: 'Audio player for podcasts and sound clips.',
    defaultData: { url: '', title: '', artist: '' },
  },
  {
    type: 'file',
    label: 'File Download',
    category: 'media',
    icon: 'Paperclip',
    description: 'Downloadable document or file link.',
    defaultData: { url: '', name: 'Download File', size: 0 },
  },
  {
    type: 'button',
    label: 'Button',
    category: 'interactive',
    icon: 'SquarePlay',
    description: 'Call-to-action button with custom styling.',
    defaultData: { label: 'Click Me', url: '#', variant: 'primary', target: '_self' },
  },
  {
    type: 'link',
    label: 'Link',
    category: 'interactive',
    icon: 'Link',
    description: 'Standalone styled link.',
    defaultData: { text: 'Learn more', url: '#' },
  },
  {
    type: 'table',
    label: 'Table',
    category: 'layout',
    icon: 'Table',
    description: 'Data table with rows and columns.',
    defaultData: {
      headers: ['Col 1', 'Col 2', 'Col 3'],
      rows: [['A', 'B', 'C'], ['D', 'E', 'F']],
    },
  },
  {
    type: 'divider',
    label: 'Divider',
    category: 'layout',
    icon: 'Minus',
    description: 'Horizontal separator line.',
    defaultData: { style: 'solid', thickness: 1 },
  },
  {
    type: 'spacer',
    label: 'Spacer',
    category: 'layout',
    icon: 'Maximize2',
    description: 'Adjustable vertical spacing block.',
    defaultData: { height: 32 },
  },
  {
    type: 'columns',
    label: 'Columns Layout',
    category: 'layout',
    icon: 'Columns',
    description: 'Multi-column container for nested blocks.',
    defaultData: { count: 2, gap: '1.5rem', stackOnMobile: true },
    supportsChildren: true,
  },
  {
    type: 'cards',
    label: 'Card Grid',
    category: 'layout',
    icon: 'LayoutGrid',
    description: 'Grid of cards with title, description, badge, link.',
    defaultData: {
      items: [
        { title: 'Feature 1', description: 'Description text', icon: 'Star', link: '' },
        { title: 'Feature 2', description: 'Description text', icon: 'Zap', link: '' },
      ],
      columns: 2,
    },
  },
  {
    type: 'hero',
    label: 'Hero Section',
    category: 'layout',
    icon: 'Sparkles',
    description: 'High-impact banner with badge, title, subtitle, CTAs.',
    defaultData: {
      badge: 'New Release',
      title: 'Universal Headless CMS',
      subtitle: 'Build any modern digital experience with enterprise speed and security.',
      primaryCta: { label: 'Get Started', url: '/docs' },
      secondaryCta: { label: 'Explore API', url: '/api' },
      backgroundType: 'gradient',
    },
  },
  {
    type: 'cta',
    label: 'Call to Action',
    category: 'interactive',
    icon: 'Megaphone',
    description: 'Attention-grabbing CTA section with button and caption.',
    defaultData: {
      title: 'Ready to build?',
      description: 'Start managing content with unmatched flexibility today.',
      buttonText: 'Try Now',
      buttonUrl: '/signup',
    },
  },
  {
    type: 'accordion',
    label: 'Accordion',
    category: 'interactive',
    icon: 'ChevronDown',
    description: 'Collapsible accordion panels (FAQ, details).',
    defaultData: {
      items: [
        { title: 'Question 1', content: 'Answer text 1' },
        { title: 'Question 2', content: 'Answer text 2' },
      ],
      allowMultiple: false,
    },
  },
  {
    type: 'tabs',
    label: 'Tabs',
    category: 'interactive',
    icon: 'FolderKanban',
    description: 'Tabbed content container.',
    defaultData: {
      tabs: [
        { label: 'Overview', content: 'Overview panel content.' },
        { label: 'Features', content: 'Features panel content.' },
      ],
    },
  },
  {
    type: 'embed',
    label: 'Embed',
    category: 'advanced',
    icon: 'ExternalLink',
    description: 'Embedded iframe or external widget (Maps, Twitter, CodePen).',
    defaultData: { embedUrl: '', aspectRatio: '16/9' },
  },
  {
    type: 'html',
    label: 'Raw HTML',
    category: 'advanced',
    icon: 'FileCode',
    description: 'Custom raw HTML markup.',
    defaultData: { html: '<div>Custom HTML</div>' },
  },
  {
    type: 'markdown',
    label: 'Markdown',
    category: 'advanced',
    icon: 'FileText',
    description: 'Markdown formatted content.',
    defaultData: { markdown: '## Markdown title\n\nContent paragraph.' },
  },
  {
    type: 'custom',
    label: 'Custom Block',
    category: 'advanced',
    icon: 'Sliders',
    description: 'User-defined dynamic JSON block.',
    defaultData: { component: 'CustomHero', props: {} },
  },
];
