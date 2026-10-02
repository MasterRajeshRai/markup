import { describe, it } from 'node:test';
import assert from 'node:assert';
import { hasPermission, hasRole, PERMISSIONS, DEFAULT_ROLES } from '@headless/core';
import { ROUTE_PERMISSION_MAP } from './components/auth-context';

describe('Role-Based Access Control (RBAC) & Limited User Visibility', () => {
  const superAdminUser = {
    id: 'user_01',
    email: 'admin@headless.io',
    roles: [{ slug: 'super_admin', permissions: ['*'] }],
  };

  const editorUser = {
    id: 'user_02',
    email: 'editor@headless.io',
    roles: [
      {
        slug: 'editor',
        permissions: [
          'content.*',
          'media.*',
          'publishing.*',
          'calendar.*',
          'workflows.*',
          'revisions.*',
          'sliders.*',
          'comments.*',
          'forms.*',
          'newsletter.*',
          'seo.*',
          'redirects.*',
          'taxonomy.*',
          'navigation.*',
          'ads.*',
        ],
      },
    ],
  };

  const authorUser = {
    id: 'user_03',
    email: 'author@headless.io',
    roles: [
      {
        slug: 'author',
        permissions: [
          'content.read',
          'content.create',
          'content.update',
          'media.read',
          'media.upload',
          'sliders.read',
          'sliders.manage',
          'calendar.read',
          'revisions.read',
        ],
      },
    ],
  };

  const reviewerUser = {
    id: 'user_04',
    email: 'reviewer@headless.io',
    roles: [
      {
        slug: 'reviewer',
        permissions: [
          'content.read',
          'content.update',
          'workflows.read',
          'workflows.manage',
          'calendar.read',
          'revisions.read',
          'comments.read',
          'comments.manage',
        ],
      },
    ],
  };

  it('allows Super Administrator unrestricted access to all permissions and routes', () => {
    assert.strictEqual(hasPermission(superAdminUser, 'users.read'), true);
    assert.strictEqual(hasPermission(superAdminUser, 'settings.manage'), true);
    assert.strictEqual(hasPermission(superAdminUser, 'api.manage'), true);
    assert.strictEqual(hasPermission(superAdminUser, 'content.publish'), true);
    assert.strictEqual(hasPermission(superAdminUser, 'random.custom.permission'), true);
    assert.strictEqual(hasRole(superAdminUser, 'super_admin'), true);
  });

  it('permits Editor full editorial control while restricting system settings and user management', () => {
    // Permitted items
    assert.strictEqual(hasPermission(editorUser, 'content.read'), true);
    assert.strictEqual(hasPermission(editorUser, 'content.create'), true);
    assert.strictEqual(hasPermission(editorUser, 'content.publish'), true);
    assert.strictEqual(hasPermission(editorUser, 'media.read'), true);
    assert.strictEqual(hasPermission(editorUser, 'newsletter.read'), true);
    assert.strictEqual(hasPermission(editorUser, 'seo.manage'), true);
    assert.strictEqual(hasPermission(editorUser, 'sliders.read'), true);

    // Restricted items (Security, System, Developer tools)
    assert.strictEqual(hasPermission(editorUser, 'users.read'), false);
    assert.strictEqual(hasPermission(editorUser, 'roles.manage'), false);
    assert.strictEqual(hasPermission(editorUser, 'api.manage'), false);
    assert.strictEqual(hasPermission(editorUser, 'settings.manage'), false);
    assert.strictEqual(hasPermission(editorUser, 'sites.manage'), false);
  });

  it('restricts Author to own draft creation, media, and calendar while hiding publishing queue and system tools', () => {
    // Permitted items
    assert.strictEqual(hasPermission(authorUser, 'content.read'), true);
    assert.strictEqual(hasPermission(authorUser, 'content.create'), true);
    assert.strictEqual(hasPermission(authorUser, 'media.read'), true);
    assert.strictEqual(hasPermission(authorUser, 'media.upload'), true);
    assert.strictEqual(hasPermission(authorUser, 'calendar.read'), true);

    // Restricted items
    assert.strictEqual(hasPermission(authorUser, 'content.publish'), false, 'Author cannot publish directly');
    assert.strictEqual(hasPermission(authorUser, 'workflows.read'), false, 'Author cannot manage workflows');
    assert.strictEqual(hasPermission(authorUser, 'users.read'), false, 'Author cannot access users');
    assert.strictEqual(hasPermission(authorUser, 'settings.manage'), false, 'Author cannot access settings');
    assert.strictEqual(hasPermission(authorUser, 'newsletter.read'), false, 'Author cannot access newsletter');
    assert.strictEqual(hasPermission(authorUser, 'seo.manage'), false, 'Author cannot access SEO');
    assert.strictEqual(hasPermission(authorUser, 'api.manage'), false, 'Author cannot access API keys');
  });

  it('restricts Reviewer to reviewing drafts and moderating comments while preventing media upload and settings', () => {
    // Permitted items
    assert.strictEqual(hasPermission(reviewerUser, 'content.read'), true);
    assert.strictEqual(hasPermission(reviewerUser, 'workflows.read'), true);
    assert.strictEqual(hasPermission(reviewerUser, 'comments.read'), true);
    assert.strictEqual(hasPermission(reviewerUser, 'comments.manage'), true);

    // Restricted items
    assert.strictEqual(hasPermission(reviewerUser, 'media.upload'), false, 'Reviewer cannot upload media');
    assert.strictEqual(hasPermission(reviewerUser, 'content.publish'), false, 'Reviewer cannot publish directly');
    assert.strictEqual(hasPermission(reviewerUser, 'users.read'), false, 'Reviewer cannot access users');
    assert.strictEqual(hasPermission(reviewerUser, 'settings.manage'), false, 'Reviewer cannot access settings');
    assert.strictEqual(hasPermission(reviewerUser, 'api.manage'), false, 'Reviewer cannot access API');
  });

  it('accurately protects admin routes according to the ROUTE_PERMISSION_MAP', () => {
    // Users route requires users.read
    const usersRequired = ROUTE_PERMISSION_MAP['/admin/users'];
    assert.strictEqual(usersRequired, 'users.read');
    assert.strictEqual(hasPermission(superAdminUser, usersRequired), true);
    assert.strictEqual(hasPermission(authorUser, usersRequired), false);
    assert.strictEqual(hasPermission(editorUser, usersRequired), false);

    // Settings route requires settings.manage
    const settingsRequired = ROUTE_PERMISSION_MAP['/admin/settings'];
    assert.strictEqual(settingsRequired, 'settings.manage');
    assert.strictEqual(hasPermission(superAdminUser, settingsRequired), true);
    assert.strictEqual(hasPermission(authorUser, settingsRequired), false);
    assert.strictEqual(hasPermission(reviewerUser, settingsRequired), false);

    // Media route requires media.read
    const mediaRequired = ROUTE_PERMISSION_MAP['/admin/media'];
    assert.strictEqual(mediaRequired, 'media.read');
    assert.strictEqual(hasPermission(superAdminUser, mediaRequired), true);
    assert.strictEqual(hasPermission(editorUser, mediaRequired), true);
    assert.strictEqual(hasPermission(authorUser, mediaRequired), true);
    assert.strictEqual(hasPermission(reviewerUser, mediaRequired), false);
  });

  it('prunes sections completely when a limited user has zero permitted items in that section', () => {
    // Define a section simulator
    const sampleSecuritySection = {
      title: 'Security & Access',
      items: [
        { title: 'Users', requiredPermission: 'users.read' },
        { title: 'Roles', requiredPermission: 'roles.manage' },
        { title: 'API Keys', requiredPermission: 'api.manage' },
      ],
    };

    const filterForUser = (user: any, sec: typeof sampleSecuritySection) => {
      const visibleItems = sec.items.filter((item) => hasPermission(user, item.requiredPermission));
      return visibleItems.length > 0;
    };

    // Super Admin sees Security & Access
    assert.strictEqual(filterForUser(superAdminUser, sampleSecuritySection), true);

    // Author CANNOT see Security & Access (section pruned!)
    assert.strictEqual(filterForUser(authorUser, sampleSecuritySection), false);

    // Reviewer CANNOT see Security & Access (section pruned!)
    assert.strictEqual(filterForUser(reviewerUser, sampleSecuritySection), false);

    // Editor CANNOT see Security & Access (section pruned!)
    assert.strictEqual(filterForUser(editorUser, sampleSecuritySection), false);
  });

  describe('Authorship Scoping & Ownership Isolation', () => {
    const contributorUser = {
      id: 'user_05',
      email: 'contributor@headless.io',
      roles: [
        {
          slug: 'contributor',
          permissions: ['content.read', 'content.create'],
        },
      ],
    };

    const customAuditorUser = {
      id: 'user_06',
      email: 'auditor@headless.io',
      roles: [
        {
          slug: 'compliance_officer',
          permissions: ['content.read', 'content.read_all', 'revisions.read_all'],
        },
      ],
    };

    it('correctly calculates canViewAllContent, canViewAllMedia, and canViewAllRevisions', async () => {
      const { canViewAllContent, canViewAllMedia, canViewAllRevisions } = await import('@headless/core');

      // Super Admin and Editor can view all
      assert.strictEqual(canViewAllContent(superAdminUser), true);
      assert.strictEqual(canViewAllMedia(superAdminUser), true);
      assert.strictEqual(canViewAllRevisions(superAdminUser), true);

      assert.strictEqual(canViewAllContent(editorUser), true);
      assert.strictEqual(canViewAllMedia(editorUser), true);
      assert.strictEqual(canViewAllRevisions(editorUser), true);

      // Reviewer can view all content and revisions, but NOT all media
      assert.strictEqual(canViewAllContent(reviewerUser), true);
      assert.strictEqual(canViewAllMedia(reviewerUser), false);
      assert.strictEqual(canViewAllRevisions(reviewerUser), true);

      // Author and Contributor are restricted to own items
      assert.strictEqual(canViewAllContent(authorUser), false);
      assert.strictEqual(canViewAllMedia(authorUser), false);
      assert.strictEqual(canViewAllRevisions(authorUser), false);

      assert.strictEqual(canViewAllContent(contributorUser), false);
      assert.strictEqual(canViewAllMedia(contributorUser), false);
      assert.strictEqual(canViewAllRevisions(contributorUser), false);

      // Custom role with specific read_all permissions
      assert.strictEqual(canViewAllContent(customAuditorUser), true);
      assert.strictEqual(canViewAllMedia(customAuditorUser), false);
      assert.strictEqual(canViewAllRevisions(customAuditorUser), true);
    });

    it('isolates content entries so limited users only see their own authored posts', async () => {
      const { canViewAllContent } = await import('@headless/core');

      const mockEntries = [
        { id: 'entry-1', title: 'Admin System Post', authorId: 'user_01' },
        { id: 'entry-2', title: 'Editor Feature Guide', authorId: 'user_02' },
        { id: 'entry-3', title: 'Author Product Review', authorId: 'user_03' },
        { id: 'entry-4', title: 'Contributor Guest Post', authorId: 'user_05' },
      ];

      const getVisibleEntries = (user: any) => {
        if (canViewAllContent(user)) {
          return mockEntries;
        }
        return mockEntries.filter((e) => e.authorId === user.id);
      };

      // Admin and Editor see all 4 entries
      assert.strictEqual(getVisibleEntries(superAdminUser).length, 4);
      assert.strictEqual(getVisibleEntries(editorUser).length, 4);

      // Author ONLY sees entry-3
      const authorVisible = getVisibleEntries(authorUser);
      assert.strictEqual(authorVisible.length, 1);
      assert.strictEqual(authorVisible[0].id, 'entry-3');
      assert.strictEqual(authorVisible[0].authorId, 'user_03');

      // Contributor ONLY sees entry-4
      const contribVisible = getVisibleEntries(contributorUser);
      assert.strictEqual(contribVisible.length, 1);
      assert.strictEqual(contribVisible[0].id, 'entry-4');
      assert.strictEqual(contribVisible[0].authorId, 'user_05');
    });

    it('isolates media files so limited users only see assets they uploaded', async () => {
      const { canViewAllMedia } = await import('@headless/core');

      const mockMediaAssets = [
        { id: 'med-1', filename: 'brand-hero.webp', createdById: 'user_01' },
        { id: 'med-2', filename: 'editor-banner.webp', createdById: 'user_02' },
        { id: 'med-3', filename: 'author-diagram.png', createdById: 'user_03' },
      ];

      const getVisibleMedia = (user: any) => {
        if (canViewAllMedia(user)) {
          return mockMediaAssets;
        }
        return mockMediaAssets.filter((m) => m.createdById === user.id);
      };

      // Admin and Editor see all 3 media files
      assert.strictEqual(getVisibleMedia(superAdminUser).length, 3);
      assert.strictEqual(getVisibleMedia(editorUser).length, 3);

      // Author ONLY sees med-3
      const authorMedia = getVisibleMedia(authorUser);
      assert.strictEqual(authorMedia.length, 1);
      assert.strictEqual(authorMedia[0].id, 'med-3');
      assert.strictEqual(authorMedia[0].createdById, 'user_03');
    });

    it('isolates revisions so authors only see revision history for content they worked on', async () => {
      const { canViewAllRevisions } = await import('@headless/core');

      const mockRevisions = [
        { id: 'rev-1', entryId: 'entry-1', entryAuthorId: 'user_01', revisionAuthorId: 'user_01' },
        { id: 'rev-2', entryId: 'entry-2', entryAuthorId: 'user_02', revisionAuthorId: 'user_02' },
        { id: 'rev-3', entryId: 'entry-3', entryAuthorId: 'user_03', revisionAuthorId: 'user_03' },
      ];

      const getVisibleRevisions = (user: any) => {
        if (canViewAllRevisions(user)) {
          return mockRevisions;
        }
        return mockRevisions.filter(
          (r) => r.entryAuthorId === user.id || r.revisionAuthorId === user.id
        );
      };

      // Admin and Editor see all revisions
      assert.strictEqual(getVisibleRevisions(superAdminUser).length, 3);
      assert.strictEqual(getVisibleRevisions(editorUser).length, 3);

      // Author only sees revisions for entry-3
      const authorRevs = getVisibleRevisions(authorUser);
      assert.strictEqual(authorRevs.length, 1);
      assert.strictEqual(authorRevs[0].id, 'rev-3');
      assert.strictEqual(authorRevs[0].entryId, 'entry-3');
    });
  });
});
