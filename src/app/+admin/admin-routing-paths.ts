import { URLCombiner } from '../core/url-combiner/url-combiner';
import { getAdminModuleRoute } from '../app-routing-paths';

export const REGISTRIES_MODULE_PATH = 'registries';
export const ACCESS_CONTROL_MODULE_PATH = 'access-control';
export const DEDUPLICATION_PATH = 'deduplication';

export function getRegistriesModuleRoute() {
  return new URLCombiner(getAdminModuleRoute(), REGISTRIES_MODULE_PATH).toString();
}

export function getAccessControlModuleRoute() {
  return new URLCombiner(getAdminModuleRoute(), ACCESS_CONTROL_MODULE_PATH).toString();
}

export function getDeduplicationModuleRoute() {
  return new URLCombiner(getAdminModuleRoute(), DEDUPLICATION_PATH).toString();
}
