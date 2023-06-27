import { Component, Inject } from '@angular/core';
import { ContextMenuEntryComponent } from '../context-menu-entry.component';
import { rendersContextMenuEntriesForType } from '../context-menu.decorator';
import { DSpaceObjectType } from '../../../core/shared/dspace-object-type.model';
import { DSpaceObject } from '../../../core/shared/dspace-object.model';
import { ContextMenuEntryType } from '../context-menu-entry-type';
import { Item } from '../../../core/shared/item.model';

@Component({
  selector: 'ds-context-menu-change-submitter',
  templateUrl: './change-submitter.component.html',
  styleUrls: ['./change-submitter.component.scss']
})
@rendersContextMenuEntriesForType(DSpaceObjectType.ITEM)
export class ChangeSubmitterComponent extends ContextMenuEntryComponent {
  item: Item;

  constructor(
    @Inject('contextMenuObjectProvider') protected injectedContextMenuObject: DSpaceObject,
    @Inject('contextMenuObjectTypeProvider') protected injectedContextMenuObjectType: DSpaceObjectType,
  ) {
    super(injectedContextMenuObject, injectedContextMenuObjectType, ContextMenuEntryType.EditSubmission);
    this.item = this.contextMenuObject as Item;
  }

}
