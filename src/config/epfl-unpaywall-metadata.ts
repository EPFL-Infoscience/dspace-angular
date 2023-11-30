import { Config } from './config.interface';
import { EpflUnpaywallMetadataOaireLicenseCondition } from './epfl-unpaywall-metadata-oaire-licance-condition';
import { EpflUnpaywallMetadataOaireVersion } from './epfl-unpaywall-metadata-oaire-version';

export class EpflUnpaywallMetadata implements Config {
  oaire_licenseCondition: EpflUnpaywallMetadataOaireLicenseCondition;
  oaire_version: EpflUnpaywallMetadataOaireVersion;
}
