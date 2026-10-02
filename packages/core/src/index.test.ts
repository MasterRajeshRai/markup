import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  hashPassword,
  verifyPassword,
  generateApiKey,
  createPreviewToken,
  verifyPreviewToken,
  hasPermission,
  validateBlocks,
  validateEntryFields,
  validateRedirect,
  computeRevisionDiff,
  PERMISSIONS,
} from './index';

describe('Security & Hash Utilities', () => {
  test('hashes password and verifies successfully', async () => {
    const raw = 'EnterprisePassword123!';
    const hash = await hashPassword(raw);
    assert.ok(hash.includes(':'), 'Hash should contain salt:key delimiter');

    const isValid = await verifyPassword(raw, hash);
    assert.equal(isValid, true, 'Valid password must verify to true');

    const isInvalid = await verifyPassword('WrongPassword', hash);
    assert.equal(isInvalid, false, 'Invalid password must verify to false');
  });

  test('generates API key with environment prefix and hash', () => {
    const keyData = generateApiKey('PRODUCTION');
    assert.ok(keyData.secretKey.startsWith('cms_live_'));
    assert.ok(keyData.keyPrefix.startsWith('cms_live_'));
    assert.equal(keyData.keyHash.length, 64);
  });

  test('creates and verifies signed preview token', () => {
    const secret = 'super-test-secret';
    const entryId = 'entry_12345';
    const token = createPreviewToken(entryId, secret, 10);

    const verified = verifyPreviewToken(token, secret);
    assert.equal(verified.valid, true);
    assert.equal(verified.entryId, entryId);

    const badSecret = verifyPreviewToken(token, 'wrong-secret');
    assert.equal(badSecret.valid, false);
  });
});

describe('RBAC Permission Evaluator', () => {
  test('super admin bypasses all checks', () => {
    const user = {
      id: 'usr_1',
      email: 'admin@example.com',
      roles: [{ slug: 'super_admin', permissions: [] }],
    };
    assert.equal(hasPermission(user, PERMISSIONS.CONTENT_PUBLISH), true);
    assert.equal(hasPermission(user, 'any.unregistered.permission'), true);
  });

  test('evaluates exact match and wildcards', () => {
    const user = {
      id: 'usr_2',
      email: 'editor@example.com',
      roles: [
        {
          slug: 'editor',
          permissions: ['content.*', 'media.upload'],
        },
      ],
    };
    assert.equal(hasPermission(user, PERMISSIONS.CONTENT_CREATE), true);
    assert.equal(hasPermission(user, PERMISSIONS.CONTENT_PUBLISH), true);
    assert.equal(hasPermission(user, PERMISSIONS.MEDIA_UPLOAD), true);
    assert.equal(hasPermission(user, PERMISSIONS.MEDIA_DELETE), false);
    assert.equal(hasPermission(user, PERMISSIONS.USERS_CREATE), false);
  });
});

describe('Block Validation', () => {
  test('validates nested visual blocks successfully', () => {
    const blocks = [
      {
        id: 'blk_1',
        type: 'heading',
        data: { text: 'Welcome', level: 1 },
      },
      {
        id: 'blk_2',
        type: 'columns',
        data: { count: 2 },
        children: [
          {
            id: 'blk_3',
            type: 'paragraph',
            data: { text: 'Column content' },
          },
        ],
      },
    ];

    const result = validateBlocks(blocks);
    assert.equal(result.success, true);
  });

  test('rejects invalid block types', () => {
    const blocks = [{ id: 'blk_bad', type: 'unknown_alien_type', data: {} }];
    const result = validateBlocks(blocks);
    assert.equal(result.success, false);
  });
});

describe('Dynamic Field Validator', () => {
  test('validates required and type constraints', () => {
    const fields = [
      { name: 'Title', apiId: 'title', type: 'text', isRequired: true },
      { name: 'Age', apiId: 'age', type: 'number', isRequired: false, validationRules: { min: 18 } },
      { name: 'Email', apiId: 'email', type: 'email', isRequired: true },
    ];

    const validData = {
      title: 'Hello World',
      age: 25,
      email: 'test@example.com',
    };
    const res1 = validateEntryFields(fields, validData);
    assert.equal(res1.valid, true);
    assert.equal(res1.errors.length, 0);

    const invalidData = {
      title: '',
      age: 12,
      email: 'not-an-email',
    };
    const res2 = validateEntryFields(fields, invalidData);
    assert.equal(res2.valid, false);
    assert.equal(res2.errors.length, 3);
  });
});

describe('Redirect Loop & Cycle Detection', () => {
  test('prevents direct self redirects and cyclic chains', () => {
    const selfRedirect = validateRedirect('/about', '/about', []);
    assert.equal(selfRedirect.valid, false);

    const existing = [
      { sourceUrl: '/page-a', destinationUrl: '/page-b' },
      { sourceUrl: '/page-b', destinationUrl: '/page-c' },
    ];
    // Adding /page-c -> /page-a would create a loop A -> B -> C -> A
    const cyclic = validateRedirect('/page-c', '/page-a', existing);
    assert.equal(cyclic.valid, false);

    const validNew = validateRedirect('/old-blog', '/new-blog', existing);
    assert.equal(validNew.valid, true);
  });
});

describe('Revision Diff Engine', () => {
  test('detects added, removed, and modified values', () => {
    const v1 = { title: 'First Post', content: 'Draft', author: 'Alice' };
    const v2 = { title: 'First Post Updated', content: 'Draft', tags: ['tech'] };

    const diffs = computeRevisionDiff(v1, v2);
    assert.equal(diffs.length, 3);

    const titleDiff = diffs.find((d) => d.field === 'title');
    assert.equal(titleDiff?.type, 'modified');

    const authorDiff = diffs.find((d) => d.field === 'author');
    assert.equal(authorDiff?.type, 'removed');

    const tagsDiff = diffs.find((d) => d.field === 'tags');
    assert.equal(tagsDiff?.type, 'added');
  });
});
