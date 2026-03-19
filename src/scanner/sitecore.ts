interface SitecoreResult {
  cms: 'sitecore-xmc-v2' | 'sitecore-xmc' | 'sitecore-jss' | 'none';
  sitecorejssVersion?: string;
  sitecoreContentSdkVersion?: string;
}

export function detectSitecore(pkg: Record<string, unknown>): SitecoreResult {
  const deps = {
    ...(pkg.dependencies as Record<string, string> | undefined),
    ...(pkg.devDependencies as Record<string, string> | undefined),
  };

  const jssNextjs = deps['@sitecore-jss/sitecore-jss-nextjs'];
  const jssReact = deps['@sitecore-jss/sitecore-jss-react'];
  const contentSdk = deps['@sitecore-content-sdk/nextjs'];

  // Content SDK v2.x — newer XM Cloud projects
  if (contentSdk) {
    const version = contentSdk.replace(/[\^~>=<]/g, '');
    return {
      cms: 'sitecore-xmc-v2',
      sitecoreContentSdkVersion: version || undefined,
    };
  }

  // JSS-based XM Cloud projects
  if (jssNextjs) {
    const version = jssNextjs.replace(/[\^~>=<]/g, '');
    return { cms: 'sitecore-xmc', sitecorejssVersion: version || undefined };
  }

  if (jssReact) {
    const version = jssReact.replace(/[\^~>=<]/g, '');
    return { cms: 'sitecore-jss', sitecorejssVersion: version || undefined };
  }

  return { cms: 'none' };
}
