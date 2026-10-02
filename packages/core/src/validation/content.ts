import { z } from 'zod';

export interface FieldDefinitionInput {
  name: string;
  apiId: string;
  type: string;
  isRequired: boolean;
  defaultValue?: unknown;
  validationRules?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    options?: string[];
  } | null;
}

export interface ValidationErrorItem {
  field: string;
  message: string;
}

/**
 * Validates dynamic entry field values against the ContentType's field definitions
 */
export function validateEntryFields(
  fields: FieldDefinitionInput[],
  data: Record<string, unknown>
): { valid: boolean; errors: ValidationErrorItem[] } {
  const errors: ValidationErrorItem[] = [];

  for (const field of fields) {
    const val = data[field.apiId];
    const rules = field.validationRules || {};

    // 1. Check required
    if (field.isRequired) {
      if (val === undefined || val === null || val === '') {
        errors.push({ field: field.apiId, message: `${field.name} is required.` });
        continue;
      }
    }

    if (val === undefined || val === null || val === '') {
      continue;
    }

    // 2. Type-specific checks
    switch (field.type) {
      case 'text':
      case 'longtext':
      case 'richtext':
      case 'markdown':
      case 'code':
        if (typeof val !== 'string') {
          errors.push({ field: field.apiId, message: `${field.name} must be a text string.` });
        } else {
          if (rules.minLength !== undefined && val.length < rules.minLength) {
            errors.push({
              field: field.apiId,
              message: `${field.name} must be at least ${rules.minLength} characters.`,
            });
          }
          if (rules.maxLength !== undefined && val.length > rules.maxLength) {
            errors.push({
              field: field.apiId,
              message: `${field.name} cannot exceed ${rules.maxLength} characters.`,
            });
          }
          if (rules.pattern) {
            try {
              const regex = new RegExp(rules.pattern);
              if (!regex.test(val)) {
                errors.push({
                  field: field.apiId,
                  message: `${field.name} does not match required format pattern.`,
                });
              }
            } catch {
              // Ignore invalid regex in user config
            }
          }
        }
        break;

      case 'number':
      case 'decimal':
        if (typeof val !== 'number' || isNaN(val)) {
          errors.push({ field: field.apiId, message: `${field.name} must be a valid number.` });
        } else {
          if (rules.min !== undefined && val < rules.min) {
            errors.push({ field: field.apiId, message: `${field.name} cannot be less than ${rules.min}.` });
          }
          if (rules.max !== undefined && val > rules.max) {
            errors.push({ field: field.apiId, message: `${field.name} cannot exceed ${rules.max}.` });
          }
        }
        break;

      case 'boolean':
        if (typeof val !== 'boolean') {
          errors.push({ field: field.apiId, message: `${field.name} must be true or false.` });
        }
        break;

      case 'email':
        if (typeof val !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
          errors.push({ field: field.apiId, message: `${field.name} must be a valid email address.` });
        }
        break;

      case 'url':
        if (typeof val !== 'string') {
          errors.push({ field: field.apiId, message: `${field.name} must be a valid URL.` });
        } else {
          try {
            new URL(val);
          } catch {
            errors.push({ field: field.apiId, message: `${field.name} must be a valid URL (e.g. https://...).` });
          }
        }
        break;

      case 'color':
        if (typeof val !== 'string' || !/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(val)) {
          errors.push({ field: field.apiId, message: `${field.name} must be a valid hex color code (e.g. #3b82f6).` });
        }
        break;

      case 'date':
      case 'datetime':
        if (typeof val !== 'string' && !(val instanceof Date)) {
          errors.push({ field: field.apiId, message: `${field.name} must be a valid date.` });
        } else {
          const d = new Date(val as string | Date);
          if (isNaN(d.getTime())) {
            errors.push({ field: field.apiId, message: `${field.name} is an invalid date format.` });
          }
        }
        break;

      case 'select':
      case 'enumeration':
        if (rules.options && Array.isArray(rules.options)) {
          if (!rules.options.includes(String(val))) {
            errors.push({
              field: field.apiId,
              message: `${field.name} must be one of: ${rules.options.join(', ')}.`,
            });
          }
        }
        break;

      case 'gallery':
      case 'repeatable':
        if (!Array.isArray(val)) {
          errors.push({ field: field.apiId, message: `${field.name} must be an array of items.` });
        }
        break;

      case 'json':
      case 'object':
      case 'component':
        if (typeof val !== 'object' || val === null) {
          errors.push({ field: field.apiId, message: `${field.name} must be an object or JSON structure.` });
        }
        break;
    }
  }

  return { valid: errors.length === 0, errors };
}
