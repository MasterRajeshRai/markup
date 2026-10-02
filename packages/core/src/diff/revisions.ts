export interface FieldDiff {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  type: 'added' | 'removed' | 'modified';
}

/**
 * Calculates differences between two versions of entry data/blocks/seo
 */
export function computeRevisionDiff(
  oldData: Record<string, unknown> = {},
  newData: Record<string, unknown> = {}
): FieldDiff[] {
  const diffs: FieldDiff[] = [];
  const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

  for (const key of allKeys) {
    const oldVal = oldData[key];
    const newVal = newData[key];

    if (!(key in oldData) && key in newData) {
      diffs.push({ field: key, oldValue: undefined, newValue: newVal, type: 'added' });
    } else if (key in oldData && !(key in newData)) {
      diffs.push({ field: key, oldValue: oldVal, newValue: undefined, type: 'removed' });
    } else if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      diffs.push({ field: key, oldValue: oldVal, newValue: newVal, type: 'modified' });
    }
  }

  return diffs;
}
