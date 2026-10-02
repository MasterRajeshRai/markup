import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const openApiSpec = {
    openapi: '3.0.3',
    info: {
      title: 'Markup REST API',
      version: '1.0.0',
      description:
        'Enterprise-grade, API-first headless content management system. Exposes high-performance read APIs for digital experiences and management APIs for editorial operations.',
      contact: {
        name: 'CMS Architecture Support',
        email: 'dev@headless.io',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'Custom API Key for Delivery or Management operations',
        },
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT or API Key',
        },
      },
      schemas: {
        ContentEntry: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            slug: { type: 'string' },
            title: { type: 'string' },
            status: { type: 'string', enum: ['DRAFT', 'IN_REVIEW', 'APPROVED', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED'] },
            contentType: { type: 'string' },
            locale: { type: 'string', example: 'en-US' },
            data: { type: 'object', description: 'Dynamic fields data defined on ContentType' },
            blocks: { type: 'array', items: { type: 'object' }, description: 'Visual nested block tree' },
            seo: { type: 'object', description: 'SEO metadata, OpenGraph, and Schema.org' },
            publishedAt: { type: 'string', format: 'date-time' },
          },
        },
        BlockNode: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            type: { type: 'string', example: 'hero' },
            data: { type: 'object' },
            children: { type: 'array', items: { $ref: '#/components/schemas/BlockNode' } },
          },
        },
      },
    },
    paths: {
      '/content': {
        get: {
          summary: 'List published content entries',
          tags: ['Content Delivery'],
          parameters: [
            { name: 'type', in: 'query', schema: { type: 'string' }, description: 'Filter by content type slug (e.g. pages, articles, products)' },
            { name: 'locale', in: 'query', schema: { type: 'string' }, description: 'Target locale (e.g. en-US)' },
            { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Search keywords' },
            { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Taxonomy term slug' },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          ],
          responses: {
            '200': { description: 'Successful content query response' },
          },
        },
        post: {
          summary: 'Create a new content entry',
          tags: ['Content Management'],
          security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
          responses: {
            '201': { description: 'Entry created' },
          },
        },
      },
      '/content/{id}': {
        get: {
          summary: 'Get single content entry by ID or slug',
          tags: ['Content Delivery'],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'previewToken', in: 'query', schema: { type: 'string' }, description: 'Signed token for draft preview' },
          ],
          responses: {
            '200': { description: 'Entry data' },
            '404': { description: 'Not found' },
          },
        },
        patch: {
          summary: 'Update content entry and record revision',
          tags: ['Content Management'],
          security: [{ BearerAuth: [] }],
          responses: {
            '200': { description: 'Entry updated' },
          },
        },
        delete: {
          summary: 'Delete content entry',
          tags: ['Content Management'],
          security: [{ BearerAuth: [] }],
          responses: {
            '200': { description: 'Entry deleted' },
          },
        },
      },
      '/content/{id}/publish': {
        post: {
          summary: 'Publish content entry immediately',
          tags: ['Publishing'],
          security: [{ BearerAuth: [] }],
          responses: { '200': { description: 'Published' } },
        },
      },
      '/content/{id}/schedule': {
        post: {
          summary: 'Schedule content entry for future publishing',
          tags: ['Publishing'],
          security: [{ BearerAuth: [] }],
          responses: { '200': { description: 'Scheduled' } },
        },
      },
      '/content/{id}/preview-token': {
        post: {
          summary: 'Generate signed preview token for unpublished draft',
          tags: ['Publishing'],
          security: [{ BearerAuth: [] }],
          responses: { '200': { description: 'Preview token created' } },
        },
      },
      '/content-types': {
        get: { summary: 'List all content types and schemas', tags: ['Content Modeling'] },
        post: { summary: 'Create new content type with fields', tags: ['Content Modeling'] },
      },
      '/media': {
        get: { summary: 'List media assets', tags: ['Media Library'] },
      },
      '/media/upload': {
        post: { summary: 'Upload file to Digital Asset Management', tags: ['Media Library'] },
      },
      '/navigation/{slug}': {
        get: { summary: 'Get hierarchical navigation tree', tags: ['Navigation'] },
      },
      '/taxonomies': {
        get: { summary: 'List taxonomies and terms', tags: ['Taxonomies'] },
      },
      '/search': {
        get: { summary: 'Cross-entity CMS search', tags: ['Search'] },
      },
      '/webhooks': {
        get: { summary: 'List configured webhooks', tags: ['Webhooks'] },
        post: { summary: 'Register webhook subscriber', tags: ['Webhooks'] },
      },
      '/api-keys': {
        get: { summary: 'List active API keys', tags: ['API Keys'] },
        post: { summary: 'Generate new scoped API key', tags: ['API Keys'] },
      },
      '/auth/login': {
        post: { summary: 'Authenticate administrative session', tags: ['Authentication'] },
      },
      '/health': {
        get: { summary: 'Liveness and database health status', tags: ['System'] },
      },
    },
  };

  return NextResponse.json(openApiSpec);
}
