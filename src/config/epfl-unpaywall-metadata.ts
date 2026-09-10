import { Config } from './config.interface';
import { EpflUnpaywallMetadataOaireVersion } from './epfl-unpaywall-metadata-oaire-version';
import { EpflUnpaywallMetadataOaireLicenseCondition } from './epfl-unpaywall-metadata-oaire-license-condition';
import { UnpaywallPollingConfig } from './unpaywall-polling-config';


export class EpflUnpaywallMetadata implements Config {
  oaire_licenseCondition: EpflUnpaywallMetadataOaireLicenseCondition;
  oaire_version: EpflUnpaywallMetadataOaireVersion;
  polling: UnpaywallPollingConfig;
}
