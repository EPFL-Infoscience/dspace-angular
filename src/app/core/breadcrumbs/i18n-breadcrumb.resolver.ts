import { BreadcrumbConfig } from '../../breadcrumbs/breadcrumb/breadcrumb-config.model';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { I18nBreadcrumbsService } from './i18n-breadcrumbs.service';
import { hasNoValue } from '../../shared/empty.util';
import { currentPathFromSnapshot } from '../../shared/utils/route.utils';

/**
 * The class that resolves a BreadcrumbConfig object with an i18n key string for a route
 */
@Injectable({
  providedIn: 'root'
})
export class I18nBreadcrumbResolver implements Resolve<BreadcrumbConfig<string>> {
  constructor(protected breadcrumbService: I18nBreadcrumbsService) {
  }

  /**
   * Method for resolving an I18n breadcrumb configuration object
   * @param {ActivatedRouteSnapshot} route The current ActivatedRouteSnapshot
   * @param {RouterStateSnapshot} state The current RouterStateSnapshot
   * @returns BreadcrumbConfig object
   */
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): BreadcrumbConfig<string> {
    return this.getConfig(this.breadcrumbService, this.getKey(route), this.getFullPath(route));
  }

  protected getKey(route: ActivatedRouteSnapshot): string {
    const key = route.data.breadcrumbKey;
    if (hasNoValue(key)) {
      throw new Error('You provided an i18nBreadcrumbResolver for url \"' + route.url + '\" but no breadcrumbKey in the route\'s data');
    }
    return key;
  }

  protected getFullPath(route: ActivatedRouteSnapshot) {
    return currentPathFromSnapshot(route);
  }

  protected getConfig(provider: I18nBreadcrumbsService, key: string, url: string): BreadcrumbConfig<string> {
    return { provider, key, url };
  }
}
