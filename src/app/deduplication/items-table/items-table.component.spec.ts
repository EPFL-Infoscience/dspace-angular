import { GetOwningCollectionTitlePipe } from './get-owning-collection-title.pipe';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemsTableComponent } from './items-table.component';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { ItemData } from '../interfaces/deduplication-differences.models';

describe('ItemsTableComponent', () => {
  let component: ItemsTableComponent;
  let fixture: ComponentFixture<ItemsTableComponent>;
  let de: DebugElement;

  let itemsData: ItemData[] = [{
    id: '1234-65487-12354-1235',
    text: 'Test Content',
    color: 'blue',
  }];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ItemsTableComponent, GetOwningCollectionTitlePipe],
      imports: [
        TranslateModule.forRoot(),
        CommonModule
      ],
      providers:[
        GetOwningCollectionTitlePipe
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemsTableComponent);
    component = fixture.componentInstance;
    de = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('item table', () => {
    it('should display a table', () => {
      component.itemsToCompare = itemsData;
      fixture.detectChanges();

      expect(de.query(By.css('table'))).toBeTruthy();
    });
  });

  afterEach(() => {
    fixture.destroy();
  });
});
