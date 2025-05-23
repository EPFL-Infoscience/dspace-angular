import { environment } from '../environments/environment.production';
import { extendEnvironmentWithAppConfig } from './config.util';
import { DefaultAppConfig } from './default-app-config';
import { HandleThemeConfig } from './theme.config';

describe('Config Util', () => {
  describe('extendEnvironmentWithAppConfig', () => {
    it('should extend prod environment with app config', () => {
      const appConfig = new DefaultAppConfig();
      expect(appConfig.cache.msToLive.default).toEqual(15 * 60 * 1000); // 15 minute
      expect(appConfig.ui.rateLimiter.windowMs).toEqual(1 * 60 * 1000); // 1 minute
      expect(appConfig.ui.rateLimiter.max).toEqual(500);
      expect(appConfig.ui.useProxies).toEqual(true);

      expect(appConfig.submission.autosave.metadata).toEqual([
        'dc.title',
        'dc.identifier.doi',
        'dc.identifier.pmid',
        'dc.identifier.arxiv',
        'dc.identifier.patentno',
        'dc.identifier.scopus',
        'dc.identifier.isi',
        'dcterms.dateSubmitted',
        'dc.identifier.applicationnumber',
        'dc.type'
      ]);

      expect(appConfig.themes.length).toEqual(2);
      expect(appConfig.themes[0].name).toEqual('infoscience');
      expect(appConfig.themes[1].name).toEqual('dspace');

      const msToLive = 1 * 60 * 1000; // 1 minute
      appConfig.cache.msToLive.default = msToLive;

      const rateLimiter = {
        windowMs: 5 * 50 * 1000, // 5 minutes
        max: 1000
      };
      appConfig.ui.rateLimiter = rateLimiter;

      appConfig.ui.useProxies = false;

      const autoSaveMetadata = [
        'dc.author',
        'dc.title'
      ];

      appConfig.submission.autosave.metadata = autoSaveMetadata;

      const customTheme: HandleThemeConfig = {
        name: 'custom',
        handle: '10673/1233'
      };

      appConfig.themes.push(customTheme);

      extendEnvironmentWithAppConfig(environment, appConfig);

      expect(environment.cache.msToLive.default).toEqual(msToLive);
      expect(environment.ui.rateLimiter.windowMs).toEqual(rateLimiter.windowMs);
      expect(environment.ui.rateLimiter.max).toEqual(rateLimiter.max);
      expect(environment.ui.useProxies).toEqual(false);
      expect(environment.submission.autosave.metadata[0]).toEqual(autoSaveMetadata[0]);
      expect(environment.submission.autosave.metadata[1]).toEqual(autoSaveMetadata[1]);

      expect(environment.themes.length).toEqual(3);
      expect(environment.themes[0].name).toEqual('infoscience');
      expect(environment.themes[1].name).toEqual('dspace');
      expect(environment.themes[2].name).toEqual(customTheme.name);
      expect((environment.themes[2] as HandleThemeConfig).handle).toEqual(customTheme.handle);
    });
  });
});
