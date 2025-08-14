import { Component, Inject, Input, OnInit } from '@angular/core';
import { Bitstream } from '../../../../../../../../core/shared/bitstream.model';
import { environment } from '../../../../../../../../../environments/environment';
import { AdvancedAttachmentElementType } from '../../../../../../../../../config/advanced-attachment-rendering.config';
import { BitstreamRenderingModelComponent } from '../../bitstream-rendering-model';
import { LayoutField } from '../../../../../../../../core/layout/models/box.model';
import { Item } from '../../../../../../../../core/shared/item.model';
import { BitstreamDataService } from '../../../../../../../../core/data/bitstream-data.service';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AttachmentRenderingType } from './attachment-type.decorator';
import { RemoteData } from '../../../../../../../../core/data/remote-data';
import { BehaviorSubject } from 'rxjs';
import {
  getFirstCompletedRemoteData,
  getPaginatedListPayload,
  getRemoteDataPayload
} from '../../../../../../../../core/shared/operators';
import { VocabularyService } from '../../../../../../../../core/submission/vocabularies/vocabulary.service';
import { map, take } from 'rxjs/operators';

@Component({
  selector: 'ds-bitstream-attachment',
  templateUrl: './bitstream-attachment.component.html',
  styleUrls: ['./bitstream-attachment.component.scss']
})
export class BitstreamAttachmentComponent extends BitstreamRenderingModelComponent implements OnInit {

  /**
   * Environment variables configuring the fields to be viewed
   */
  envMetadata = environment.advancedAttachmentRendering.metadata;

  /**
   * Configuration type enum
   */
  AdvancedAttachmentElementType = AdvancedAttachmentElementType;

  AttachmentRenderingType = AttachmentRenderingType;

  /**
   * All item providers to show buttons of
   */
  allAttachmentProviders: string[] = [];

  /**
   * Attachment metadata to be displayed in title case
   */

  attachmentTypeMetadata = 'dc.type';

  @Input()
  attachment: Bitstream;

  thumbnail$: BehaviorSubject<RemoteData<Bitstream>> = new BehaviorSubject<RemoteData<Bitstream>>(null);

  metadataVocabularyValues: { [key: string]: { [key: string]: string } } = {};

  constructor(
    @Inject('fieldProvider') public fieldProvider: LayoutField,
    @Inject('itemProvider') public itemProvider: Item,
    @Inject('renderingSubTypeProvider') public renderingSubTypeProvider: string,
    @Inject('tabNameProvider') public tabNameProvider: string,
    protected readonly bitstreamDataService: BitstreamDataService,
    protected readonly translateService: TranslateService,
    protected readonly router: Router,
    protected readonly route: ActivatedRoute,
    protected vocabularyService: VocabularyService,
  ) {
    super(fieldProvider, itemProvider, renderingSubTypeProvider, tabNameProvider, bitstreamDataService, translateService);
  }

  ngOnInit() {
    this.attachment.thumbnail.pipe(
      getFirstCompletedRemoteData()
    ).subscribe((thumbnail: RemoteData<Bitstream>) => {
      this.thumbnail$.next(thumbnail);
    });
    this.allAttachmentProviders = this.attachment?.allMetadataValues('bitstream.viewer.provider');

    this.envMetadata.forEach((metadata) => {
      const metadataValue = this.attachment.firstMetadataValue(metadata.name);
      if (metadata.type === AdvancedAttachmentElementType.Metadata && metadata.vocabularyName && metadataValue) {
        this.getVocabularyValue(this.attachment, metadata.name, metadata.vocabularyName).subscribe((value) => {
          if (!this.metadataVocabularyValues[metadata.vocabularyName]) {
            this.metadataVocabularyValues[metadata.vocabularyName] = {};
          }
          this.metadataVocabularyValues[metadata.vocabularyName][metadataValue] = value;
        });
      }
    });
  }

  getVocabularyValue(attachment: Bitstream, name: string, vocabularyName: string) {
    return this.vocabularyService.getPublicVocabularyEntryByValue(vocabularyName, attachment.firstMetadataValue(name)).pipe(
      getFirstCompletedRemoteData(),
      getRemoteDataPayload(),
      getPaginatedListPayload(),
      map((res) => res?.length > 0 ? res[0] : null),
      map((res) => res?.display ?? attachment.firstMetadataValue(name)),
      take(1));
  }
}
