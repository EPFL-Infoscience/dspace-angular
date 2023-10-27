import { Config } from './config.interface';


export class EpflUnpaywallMetadata implements Config {
  oaire_licenseCondition: EpflUnpaywallMetadataOaireLicenseCondition;
  oaire_version: EpflUnpaywallMetadataOaireVersion;
}

export class EpflUnpaywallMetadataOaireLicenseCondition implements Config {
  cc_by: string;
  cc_by_sa: string;
  cc_by_nd: string;
  cc_by_nc: string;
  cc_by_nc_sa: string;
  cc_by_nc_nd: string;
  cc_0: string;
  pdm: string;
}

export class EpflUnpaywallMetadataOaireVersion implements Config {
  submittedVersion: string;
  acceptedVersion: string;
  publishedVersion: string;
}
