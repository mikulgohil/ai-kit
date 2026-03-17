import { describe, it, expect } from 'vitest';
import { detectSitecore } from '../../src/scanner/sitecore.js';

describe('detectSitecore', () => {
  describe('sitecore-xmc detection', () => {
    it('detects sitecore-xmc when @sitecore-jss/sitecore-jss-nextjs is in dependencies', () => {
      const pkg = {
        dependencies: { '@sitecore-jss/sitecore-jss-nextjs': '^21.6.0' },
      };
      const result = detectSitecore(pkg);
      expect(result.cms).toBe('sitecore-xmc');
    });

    it('detects sitecore-xmc when @sitecore-jss/sitecore-jss-nextjs is in devDependencies', () => {
      const pkg = {
        devDependencies: { '@sitecore-jss/sitecore-jss-nextjs': '21.6.0' },
      };
      const result = detectSitecore(pkg);
      expect(result.cms).toBe('sitecore-xmc');
    });

    it('detects sitecore-xmc when @sitecore-content-sdk/nextjs is in dependencies', () => {
      const pkg = {
        dependencies: { '@sitecore-content-sdk/nextjs': '^1.0.0' },
      };
      const result = detectSitecore(pkg);
      expect(result.cms).toBe('sitecore-xmc');
    });

    it('prefers content-sdk version when both content-sdk and jss-nextjs present', () => {
      const pkg = {
        dependencies: {
          '@sitecore-content-sdk/nextjs': '^1.0.0',
          '@sitecore-jss/sitecore-jss-nextjs': '^21.0.0',
        },
      };
      const result = detectSitecore(pkg);
      expect(result.cms).toBe('sitecore-xmc');
      expect(result.sitecorejssVersion).toBe('1.0.0');
    });
  });

  describe('sitecore-jss detection', () => {
    it('detects sitecore-jss when @sitecore-jss/sitecore-jss-react is in dependencies', () => {
      const pkg = {
        dependencies: { '@sitecore-jss/sitecore-jss-react': '21.0.0' },
      };
      const result = detectSitecore(pkg);
      expect(result.cms).toBe('sitecore-jss');
    });

    it('detects sitecore-jss when @sitecore-jss/sitecore-jss-react is in devDependencies', () => {
      const pkg = {
        devDependencies: { '@sitecore-jss/sitecore-jss-react': '~21.0.0' },
      };
      const result = detectSitecore(pkg);
      expect(result.cms).toBe('sitecore-jss');
    });

    it('does not detect sitecore-jss when xmc deps are also present (xmc wins)', () => {
      const pkg = {
        dependencies: {
          '@sitecore-jss/sitecore-jss-nextjs': '21.0.0',
          '@sitecore-jss/sitecore-jss-react': '21.0.0',
        },
      };
      const result = detectSitecore(pkg);
      expect(result.cms).toBe('sitecore-xmc');
    });
  });

  describe('no sitecore detected', () => {
    it('returns cms none when no Sitecore deps exist', () => {
      const pkg = { dependencies: { react: '18.0.0', next: '14.0.0' } };
      const result = detectSitecore(pkg);
      expect(result.cms).toBe('none');
    });

    it('returns cms none when pkg has no deps', () => {
      const pkg = {};
      const result = detectSitecore(pkg);
      expect(result.cms).toBe('none');
    });

    it('does not set sitecorejssVersion when cms is none', () => {
      const pkg = { dependencies: { react: '18.0.0' } };
      const result = detectSitecore(pkg);
      expect(result.sitecorejssVersion).toBeUndefined();
    });
  });

  describe('version extraction', () => {
    it('strips caret from jss-nextjs version', () => {
      const pkg = {
        dependencies: { '@sitecore-jss/sitecore-jss-nextjs': '^21.6.0' },
      };
      const result = detectSitecore(pkg);
      expect(result.sitecorejssVersion).toBe('21.6.0');
    });

    it('strips tilde from content-sdk version', () => {
      const pkg = {
        dependencies: { '@sitecore-content-sdk/nextjs': '~1.2.0' },
      };
      const result = detectSitecore(pkg);
      expect(result.sitecorejssVersion).toBe('1.2.0');
    });

    it('strips caret from jss-react version', () => {
      const pkg = {
        dependencies: { '@sitecore-jss/sitecore-jss-react': '^20.0.1' },
      };
      const result = detectSitecore(pkg);
      expect(result.sitecorejssVersion).toBe('20.0.1');
    });

    it('handles empty version string by returning undefined', () => {
      const pkg = {
        dependencies: { '@sitecore-jss/sitecore-jss-nextjs': '' },
      };
      const result = detectSitecore(pkg);
      expect(result.sitecorejssVersion).toBeUndefined();
    });
  });
});
