interface OptimizelyResult {
  optimizelySaas: boolean;
  optimizelyVersion?: string;
  optimizelyPackages: string[];
}

// Packages from the @remkoj/optimizely-* ecosystem (community SDK by Remko Jantzen)
const OPTIMIZELY_PACKAGES = [
  '@remkoj/optimizely-cms-react',
  '@remkoj/optimizely-cms-nextjs',
  '@remkoj/optimizely-cms-api',
  '@remkoj/optimizely-cms-cli',
  '@remkoj/optimizely-graph-client',
  '@remkoj/optimizely-graph-cli',
  '@remkoj/optimizely-graph-functions',
  '@remkoj/optimizely-one-nextjs',
] as const;

// Official Optimizely packages (if they release official SDK in future)
const OPTIMIZELY_OFFICIAL_PACKAGES = [
  '@optimizely/cms',
  '@optimizely/graph',
  '@optimizely/cms-react',
  '@optimizely/cms-nextjs',
] as const;

export function detectOptimizely(pkg: Record<string, unknown>): OptimizelyResult {
  const deps = {
    ...(pkg.dependencies as Record<string, string> | undefined),
    ...(pkg.devDependencies as Record<string, string> | undefined),
  };

  const foundPackages: string[] = [];
  let version: string | undefined;

  // Check @remkoj community SDK packages (primary detection)
  for (const pkgName of OPTIMIZELY_PACKAGES) {
    if (deps[pkgName]) {
      foundPackages.push(pkgName);

      // Prefer cms-nextjs or cms-react version as the canonical version
      if (
        !version &&
        (pkgName === '@remkoj/optimizely-cms-nextjs' ||
          pkgName === '@remkoj/optimizely-cms-react')
      ) {
        version = deps[pkgName].replace(/[\^~>=<]/g, '');
      }
    }
  }

  // Check official Optimizely packages (future-proofing)
  for (const pkgName of OPTIMIZELY_OFFICIAL_PACKAGES) {
    if (deps[pkgName]) {
      foundPackages.push(pkgName);
      if (!version) {
        version = deps[pkgName].replace(/[\^~>=<]/g, '');
      }
    }
  }

  // Also detect by optimizely graph env config pattern (codegen.ts with optimizely preset)
  if (foundPackages.length === 0 && deps['@remkoj/optimizely-graph-functions']) {
    foundPackages.push('@remkoj/optimizely-graph-functions');
  }

  return {
    optimizelySaas: foundPackages.length > 0,
    optimizelyVersion: version || undefined,
    optimizelyPackages: foundPackages,
  };
}
