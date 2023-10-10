import { Component, Inject, OnInit } from '@angular/core';

import { BehaviorSubject, merge, Observable, of as observableOf } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import { FieldRenderingType, MetadataBoxFieldRendering } from '../metadata-box.decorator';
import { BitstreamDataService } from '../../../../../../../core/data/bitstream-data.service';
import { hasValue, isNotEmpty } from '../../../../../../../shared/empty.util';
import { Bitstream } from '../../../../../../../core/shared/bitstream.model';
import { BitstreamRenderingModelComponent } from '../bitstream-rendering-model';
import { Item } from '../../../../../../../core/shared/item.model';
import { LayoutField } from '../../../../../../../core/layout/models/box.model';
import { getFirstCompletedRemoteData } from '../../../../../../../core/shared/operators';
import { PaginatedList } from '../../../../../../../core/data/paginated-list.model';
import { RemoteData } from '../../../../../../../core/data/remote-data';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'span[ds-thumbnail].float-left',
  templateUrl: './thumbnail.component.html',
  styleUrls: ['./thumbnail.component.scss'],
})
@MetadataBoxFieldRendering(FieldRenderingType.THUMBNAIL, true)
/**
 * The component for displaying a thumbnail rendered metadata box
 */
export class ThumbnailComponent extends BitstreamRenderingModelComponent implements OnInit {

  /**
   * The bitstream to be rendered
   */
  thumbnail$: BehaviorSubject<Bitstream> = new BehaviorSubject<Bitstream>(null);

  /**
   * Default image to be shown in the thumbnail
   */
  default: string;

  /**
   * Item rendering initialization state
   */
  initialized: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /**
   * Maximum size of the thumbnail allowed to be shown
   */
  maxSize: number;

  constructor(
    @Inject('fieldProvider') public fieldProvider: LayoutField,
    @Inject('itemProvider') public itemProvider: Item,
    @Inject('renderingSubTypeProvider') public renderingSubTypeProvider: string,
    protected bitstreamDataService: BitstreamDataService,
    protected translateService: TranslateService
  ) {
    super(fieldProvider, itemProvider, renderingSubTypeProvider, bitstreamDataService, translateService);
  }

  /**
   * Get the thumbnail information from api for this item
   */
  ngOnInit(): void {
    this.setDefaultImage();
    // Gets bitstreams configured to be thumbnails
    this.getBitstreamsByItem().pipe(
      map((bitstreamList: PaginatedList<Bitstream>) => bitstreamList.page),
      switchMap((filteredBitstreams: Bitstream[]) => this.getFirstAvailableThumbnailOrNull(filteredBitstreams)),
      take(1)
    ).subscribe((thumbnail: Bitstream) => {
      if (isNotEmpty(thumbnail)) {
        this.thumbnail$.next(thumbnail);
      }
      this.initialized.next(true);
    });
  }

  private getFirstAvailableThumbnailOrNull(bitstreams: Bitstream[]): Observable<Bitstream> {
    return merge(
      ...bitstreams.map(bitstream => this.resolveThumbnail(bitstream.thumbnail)),
      observableOf(null)
    )
      .pipe(
        take(1)
      );
  }

  private resolveThumbnail(thumbnail: Observable<RemoteData<Bitstream>>): Observable<Bitstream> {
    return thumbnail.pipe(
      getFirstCompletedRemoteData(),
      map((thumbnailRD) => {
        if (thumbnailRD.hasSucceeded && isNotEmpty(thumbnailRD.payload)) {
          return thumbnailRD.payload;
        } else {
          return null;
        }
      }),
      filter(hasValue),
    );
  }

  /**
   * Set the default image src depending on item entity type
   */
  setDefaultImage(): void {
    const eType = this.item.firstMetadataValue('dspace.entity.type');
    this.default = 'assets/images/person-placeholder.svg';
    if (this.isProject(eType)) {
      this.default = 'assets/images/project-placeholder.svg';
    } else if (this.isOrgUnit(eType)) {
      this.default = 'assets/images/orgunit-placeholder.svg';
    } else if (this.isPublication(eType)) {
      this.default = 'assets/images/publication-placeholder.svg';
    }
  }

  private isProject(eType: string) {
    return hasValue(eType) && eType.toUpperCase() === 'PROJECT';
  }

  private isOrgUnit(eType: string) {
    return hasValue(eType) && eType.toUpperCase() === 'ORGUNIT';
  }

  private isPublication(eType: string): boolean {
    return hasValue(eType) && eType.toUpperCase() === 'PUBLICATION';
  }
}
