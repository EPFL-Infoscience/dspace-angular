import { Component, Inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { SearchResult } from '../../search/models/search-result.model';
import { DSpaceObject } from '../../../core/shared/dspace-object.model';
import { hasValue } from '../../empty.util';
import {
  AbstractListableElementComponent
} from '../../object-collection/shared/object-collection-element/abstract-listable-element.component';
import { TruncatableService } from '../../truncatable/truncatable.service';
import { Metadata } from '../../../core/shared/metadata.utils';
import { DSONameService } from '../../../core/breadcrumbs/dso-name.service';
import { APP_CONFIG, AppConfig } from '../../../../config/app-config.interface';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'ds-search-result-list-element',
  template: ``
})
export class SearchResultListElementComponent<T extends SearchResult<K>, K extends DSpaceObject> extends AbstractListableElementComponent<T> implements OnInit {
  /**
   * The DSpaceObject of the search result
   */
  dso: K;
  dsoTitle: string;

  /**
   * Limit of additional metadata values to show
   */
  additionalMetadataLimit = environment.followAuthorityMetadataValuesLimit;

  public constructor(protected truncatableService: TruncatableService,
                     public dsoNameService: DSONameService,
                     @Inject(APP_CONFIG) protected appConfig?: AppConfig) {
    super(dsoNameService);
  }

  /**
   * Retrieve the dso from the search result
   */
  ngOnInit(): void {
    this.showLabel = this.showLabel ?? this.appConfig.browseBy.showLabels;
    this.showThumbnails = this.showThumbnails ?? this.appConfig.browseBy.showThumbnails;
    if (hasValue(this.object)) {
      this.dso = this.object.indexableObject;
      this.dsoTitle = this.dsoNameService.getHitHighlights(this.object, this.dso);
    }
  }

  /**
   * Gets all matching metadata string values from hitHighlights or dso metadata.
   *
   * @param {string|string[]} keyOrKeys The metadata key(s) in scope. Wildcards are supported; see [[Metadata]].
   * @returns {string[]} the matching string values or an empty array.
   */
  allMetadataValues(keyOrKeys: string | string[]): string[] {
    let dsoMetadata: string[] = Metadata.allValues([this.dso.metadata], keyOrKeys);
    let highlights: string[] = Metadata.allValues([this.object.hitHighlights], keyOrKeys);
    let removedHighlights: string[] = highlights.map(str => str.replace(/<\/?em>/g, ''));
    for (let i = 0; i < removedHighlights.length; i++) {
        let index = dsoMetadata.indexOf(removedHighlights[i]);
        if (index !== -1) {
          dsoMetadata[index] = highlights[i];
        }
    }
    return dsoMetadata;
  }

  /**
   * Gets the first matching metadata string value from hitHighlights or dso metadata, preferring hitHighlights.
   *
   * @param {string|string[]} keyOrKeys The metadata key(s) in scope. Wildcards are supported; see [[Metadata]].
   * @returns {string} the first matching string value, or `undefined`.
   */
  firstMetadataValue(keyOrKeys: string | string[]): string {
    return Metadata.firstValue([this.object.hitHighlights, this.dso.metadata], keyOrKeys);
  }

  /**
   * Emits if the list element is currently collapsed or not
   */
  isCollapsed(): Observable<boolean> {
    return this.truncatableService.isCollapsed(this.dso.id);
  }

}
