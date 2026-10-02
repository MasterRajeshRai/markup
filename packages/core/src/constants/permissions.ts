export const PERMISSIONS = {
  // Content permissions
  CONTENT_READ: 'content.read',
  CONTENT_READ_ALL: 'content.read_all', // View all content across team (vs only own authored work)
  CONTENT_CREATE: 'content.create',
  CONTENT_UPDATE: 'content.update',
  CONTENT_DELETE: 'content.delete',
  CONTENT_PUBLISH: 'content.publish',
  CONTENT_SCHEDULE: 'content.schedule',
  CONTENT_ARCHIVE: 'content.archive',

  // Content type builder permissions
  CONTENT_TYPE_READ: 'content_type.read',
  CONTENT_TYPE_MANAGE: 'content_type.manage',

  // Media permissions
  MEDIA_READ: 'media.read',
  MEDIA_READ_ALL: 'media.read_all', // View all media across team (vs only own uploads)
  MEDIA_UPLOAD: 'media.upload',
  MEDIA_UPDATE: 'media.update',
  MEDIA_DELETE: 'media.delete',

  // User & RBAC permissions
  USERS_READ: 'users.read',
  USERS_CREATE: 'users.create',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  ROLES_MANAGE: 'roles.manage',

  // Taxonomies & Navigation
  TAXONOMY_MANAGE: 'taxonomy.manage',
  NAVIGATION_MANAGE: 'navigation.manage',

  // SEO & Redirects
  SEO_MANAGE: 'seo.manage',
  REDIRECTS_MANAGE: 'redirects.manage',

  // Comments & Moderation
  COMMENTS_READ: 'comments.read',
  COMMENTS_MANAGE: 'comments.manage',

  // API & Webhooks
  API_MANAGE: 'api.manage',
  WEBHOOKS_MANAGE: 'webhooks.manage',

  // Settings, Sites & System
  SETTINGS_MANAGE: 'settings.manage',
  SITES_MANAGE: 'sites.manage',
  AUDIT_READ: 'audit.read',

  // Editorial & Publishing
  CALENDAR_READ: 'calendar.read',
  CALENDAR_MANAGE: 'calendar.manage',
  WORKFLOWS_READ: 'workflows.read',
  WORKFLOWS_MANAGE: 'workflows.manage',
  REVISIONS_READ: 'revisions.read',
  REVISIONS_READ_ALL: 'revisions.read_all', // View all revisions across team (vs only own work)
  REVISIONS_MANAGE: 'revisions.manage',
  PUBLISHING_READ: 'publishing.read',
  PUBLISHING_MANAGE: 'publishing.manage',

  // Sliders & Visual Components
  SLIDERS_READ: 'sliders.read',
  SLIDERS_MANAGE: 'sliders.manage',

  // Audience & Community
  NEWSLETTER_READ: 'newsletter.read',
  NEWSLETTER_MANAGE: 'newsletter.manage',
  FORMS_READ: 'forms.read',
  FORMS_MANAGE: 'forms.manage',

  // Monetization & Ads
  ADS_MANAGE: 'ads.manage',

  // Developer & Integrations
  EMAIL_MANAGE: 'email.manage',
  INTEGRATIONS_MANAGE: 'integrations.manage',
  IMPORT_EXPORT_MANAGE: 'import_export.manage',
  GRAPHQL_MANAGE: 'graphql.manage',
  MODULES_MANAGE: 'modules.manage',
} as const;

export type PermissionAction = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export interface RoleDefinition {
  name: string;
  slug: string;
  description: string;
  permissions: PermissionAction[];
  isSystem: boolean;
}

export const DEFAULT_ROLES: RoleDefinition[] = [
  {
    name: 'Super Administrator',
    slug: 'super_admin',
    description: 'Full unrestricted access to all sites, settings, users, and content.',
    permissions: Object.values(PERMISSIONS),
    isSystem: true,
  },
  {
    name: 'Administrator',
    slug: 'admin',
    description: 'Site administration, user management, content models, and publishing.',
    permissions: Object.values(PERMISSIONS).filter((p) => p !== PERMISSIONS.SITES_MANAGE),
    isSystem: true,
  },
  {
    name: 'Editor',
    slug: 'editor',
    description: 'Can create, edit, approve, schedule, and publish all content and media.',
    permissions: [
      PERMISSIONS.CONTENT_READ,
      PERMISSIONS.CONTENT_READ_ALL,
      PERMISSIONS.CONTENT_CREATE,
      PERMISSIONS.CONTENT_UPDATE,
      PERMISSIONS.CONTENT_DELETE,
      PERMISSIONS.CONTENT_PUBLISH,
      PERMISSIONS.CONTENT_SCHEDULE,
      PERMISSIONS.CONTENT_ARCHIVE,
      PERMISSIONS.CALENDAR_READ,
      PERMISSIONS.CALENDAR_MANAGE,
      PERMISSIONS.WORKFLOWS_READ,
      PERMISSIONS.WORKFLOWS_MANAGE,
      PERMISSIONS.REVISIONS_READ,
      PERMISSIONS.REVISIONS_READ_ALL,
      PERMISSIONS.REVISIONS_MANAGE,
      PERMISSIONS.PUBLISHING_READ,
      PERMISSIONS.PUBLISHING_MANAGE,
      PERMISSIONS.SLIDERS_READ,
      PERMISSIONS.SLIDERS_MANAGE,
      PERMISSIONS.MEDIA_READ,
      PERMISSIONS.MEDIA_READ_ALL,
      PERMISSIONS.MEDIA_UPLOAD,
      PERMISSIONS.MEDIA_UPDATE,
      PERMISSIONS.MEDIA_DELETE,
      PERMISSIONS.NEWSLETTER_READ,
      PERMISSIONS.NEWSLETTER_MANAGE,
      PERMISSIONS.FORMS_READ,
      PERMISSIONS.FORMS_MANAGE,
      PERMISSIONS.ADS_MANAGE,
      PERMISSIONS.TAXONOMY_MANAGE,
      PERMISSIONS.NAVIGATION_MANAGE,
      PERMISSIONS.SEO_MANAGE,
      PERMISSIONS.REDIRECTS_MANAGE,
      PERMISSIONS.COMMENTS_READ,
      PERMISSIONS.COMMENTS_MANAGE,
    ],
    isSystem: true,
  },
  {
    name: 'Author',
    slug: 'author',
    description: 'Can create and edit own content and upload media, but cannot publish directly.',
    permissions: [
      PERMISSIONS.CONTENT_READ,
      PERMISSIONS.CONTENT_CREATE,
      PERMISSIONS.CONTENT_UPDATE,
      PERMISSIONS.MEDIA_READ,
      PERMISSIONS.MEDIA_UPLOAD,
      PERMISSIONS.SLIDERS_READ,
      PERMISSIONS.CALENDAR_READ,
      PERMISSIONS.REVISIONS_READ,
    ],
    isSystem: true,
  },
  {
    name: 'Contributor',
    slug: 'contributor',
    description: 'Can create and submit drafts for review.',
    permissions: [
      PERMISSIONS.CONTENT_READ,
      PERMISSIONS.CONTENT_CREATE,
      PERMISSIONS.CONTENT_UPDATE,
    ],
    isSystem: true,
  },
  {
    name: 'Reviewer',
    slug: 'reviewer',
    description: 'Can review and approve content drafts before publishing.',
    permissions: [
      PERMISSIONS.CONTENT_READ,
      PERMISSIONS.CONTENT_READ_ALL,
      PERMISSIONS.CONTENT_UPDATE,
      PERMISSIONS.WORKFLOWS_READ,
      PERMISSIONS.CALENDAR_READ,
      PERMISSIONS.REVISIONS_READ,
      PERMISSIONS.REVISIONS_READ_ALL,
      PERMISSIONS.COMMENTS_READ,
      PERMISSIONS.COMMENTS_MANAGE,
    ],
    isSystem: true,
  },
  {
    name: 'SEO Manager',
    slug: 'seo_manager',
    description: 'Can manage SEO metadata, schema, sitemaps, and redirects.',
    permissions: [
      PERMISSIONS.CONTENT_READ,
      PERMISSIONS.SEO_MANAGE,
      PERMISSIONS.REDIRECTS_MANAGE,
    ],
    isSystem: true,
  },
  {
    name: 'Media Manager',
    slug: 'media_manager',
    description: 'Can upload, organize, edit, and delete assets in the digital asset management system.',
    permissions: [
      PERMISSIONS.MEDIA_READ,
      PERMISSIONS.MEDIA_UPLOAD,
      PERMISSIONS.MEDIA_UPDATE,
      PERMISSIONS.MEDIA_DELETE,
    ],
    isSystem: true,
  },
  {
    name: 'Developer',
    slug: 'developer',
    description: 'Can manage API keys, webhooks, integrations, and content schemas.',
    permissions: [
      PERMISSIONS.CONTENT_READ,
      PERMISSIONS.CONTENT_TYPE_READ,
      PERMISSIONS.CONTENT_TYPE_MANAGE,
      PERMISSIONS.API_MANAGE,
      PERMISSIONS.WEBHOOKS_MANAGE,
      PERMISSIONS.EMAIL_MANAGE,
      PERMISSIONS.INTEGRATIONS_MANAGE,
      PERMISSIONS.IMPORT_EXPORT_MANAGE,
      PERMISSIONS.GRAPHQL_MANAGE,
      PERMISSIONS.MODULES_MANAGE,
      PERMISSIONS.SETTINGS_MANAGE,
      PERMISSIONS.AUDIT_READ,
    ],
    isSystem: true,
  },
  {
    name: 'Read Only',
    slug: 'read_only',
    description: 'Can view content, media, and taxonomies without editing capabilities.',
    permissions: [
      PERMISSIONS.CONTENT_READ,
      PERMISSIONS.CONTENT_TYPE_READ,
      PERMISSIONS.MEDIA_READ,
    ],
    isSystem: true,
  },
];
