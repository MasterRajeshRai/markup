export interface RedirectRule {
  sourceUrl: string;
  destinationUrl: string;
}

/**
 * Validates a redirect and detects direct self-loops or cyclic redirect chains
 */
export function validateRedirect(
  newSource: string,
  newDestination: string,
  existingRedirects: RedirectRule[]
): { valid: boolean; error?: string } {
  const normSource = normalizeUrl(newSource);
  const normDest = normalizeUrl(newDestination);

  // 1. Direct self-redirect
  if (normSource === normDest) {
    return { valid: false, error: 'Self-redirect loop detected: Source and destination cannot be identical.' };
  }

  // 2. Build graph and check for cycles
  const graph = new Map<string, string>();
  for (const r of existingRedirects) {
    graph.set(normalizeUrl(r.sourceUrl), normalizeUrl(r.destinationUrl));
  }
  graph.set(normSource, normDest);

  // Trace from normSource
  const visited = new Set<string>();
  let current: string | undefined = normSource;

  while (current) {
    if (visited.has(current)) {
      return { valid: false, error: `Redirect loop cycle detected involving: ${current}` };
    }
    visited.add(current);
    current = graph.get(current);
    if (visited.size > 20) {
      return { valid: false, error: 'Redirect chain is too long (exceeds 20 hops).' };
    }
  }

  return { valid: true };
}

function normalizeUrl(url: string): string {
  try {
    if (url.startsWith('/')) {
      return url.toLowerCase().replace(/\/+$/, '') || '/';
    }
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname.toLowerCase().replace(/\/+$/, '')}`;
  } catch {
    return url.toLowerCase().trim();
  }
}
