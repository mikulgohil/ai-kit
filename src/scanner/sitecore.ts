interface SitecoreResult {
  cms: 'sitecore-xmc' | 'sitecore-jss' | 'none';
  sitecorejssVersion?: string;
}

export function detectSitecore(pkg: Record<string, unknown>): SitecoreResult {
  const deps = {
    ...(pkg.dependencies as Record<string, string> | undefined),
    ...(pkg.devDependencies as Record<string, string> | undefined),
  };

  const jssNextjs = deps['@sitecore-jss/sitecore-jss-nextjs'];
  const jssReact = deps['@sitecore-jss/sitecore-jss-react'];
  const contentSdk = deps['@sitecore-content-sdk/nextjs'];

  if (contentSdk || jssNextjs) {
    const version = (contentSdk || jssNextjs || '').replace(/[\^~>=<]/g, '');
    return { cms: 'sitecore-xmc', sitecorejssVersion: version || undefined };
  }

  if (jssReact) {
    const version = jssReact.replace(/[\^~>=<]/g, '');
    return { cms: 'sitecore-jss', sitecorejssVersion: version || undefined };
  }

  return { cms: 'none' };
}
