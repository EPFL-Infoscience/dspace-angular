import { Component, Inject, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { RenderCrisLayoutBoxFor } from '../../../../decorators/cris-layout-box.decorator';
import { LayoutBox } from '../../../../enums/layout-box.enum';
import { CrisLayoutBoxModelComponent } from '../../../../models/cris-layout-box-component.model';
import { CrisLayoutBox } from '../../../../../core/layout/models/box.model';
import { Item } from '../../../../../core/shared/item.model';
import { VocabularyOptions } from '../../../../../core/submission/vocabularies/models/vocabulary-options.model';

@Component({
  selector: 'ds-hierarchy.component',
  templateUrl: './hierarchy.component.html'
})
@RenderCrisLayoutBoxFor(LayoutBox.HIERARCHY,true)
export class HierarchyComponent extends CrisLayoutBoxModelComponent implements OnInit {

  /**
   * The {@link VocabularyOptions} object
   */
  vocabularyOptions = new VocabularyOptions('publication-coar-types', 'dc.type');

  /**
   * For hierarchical vocabularies express the preference to preload the tree at a specific
   * level of depth (0 only the top nodes are shown, 1 also their children are preloaded and so on)
   */
  preloadLevel = 0;

  /**
   * The selected Item from submission
   */
  selectedItem: any = {};

  constructor(
    protected translateService: TranslateService,
    @Inject('boxProvider') public boxProvider: CrisLayoutBox,
    @Inject('itemProvider') public itemProvider: Item) {
    super(translateService, boxProvider, itemProvider);
  }

  ngOnInit() {
    super.ngOnInit();
    this.selectedItem = this.item.firstMetadata('dc.type');
  }
}
