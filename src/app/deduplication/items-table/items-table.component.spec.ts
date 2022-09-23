import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemsTableComponent } from './items-table.component';
import { Item } from 'src/app/core/shared/item.model';
import { of } from 'rxjs';

describe('ItemsTableComponent', () => {
  let component: ItemsTableComponent;
  let fixture: ComponentFixture<ItemsTableComponent>;
  let item = Object.assign(new Item(), {
    id: 'item-id',
    metadata: {
      'dspace.entity.type': [
        {
          language: 'en_US',
          value: 'Publication'
        }
      ],
      'dc.title': [
        {
          value: 'item-name'
        }
      ]
    }
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ItemsTableComponent],
      imports: [
        TranslateModule.forRoot(),
        CommonModule
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Should call getOwningCollectionTitle', () => {
    spyOn(component, 'getOwningCollectionTitle');
    // HERE
  });

  afterEach(() => {
    fixture.destroy();
  });
});
