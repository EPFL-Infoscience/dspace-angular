import { Config } from './config.interface';
import { EpflUnpaywallMetadataOaireVersion } from './epfl-unpaywall-metadata-oaire-version';
import { EpflUnpaywallMetadataOaireLicenseCondition } from './epfl-unpaywall-metadata-oaire-license-condition';


export class EpflUnpaywallMetadata implements Config {
  oaire_licenseCondition: EpflUnpaywallMetadataOaireLicenseCondition;
  oaire_version: EpflUnpaywallMetadataOaireVersion;
}
