import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdditionalMetadataComponent } from './additional-metadata.component';
import { Item } from '../../../../core/shared/item.model';

xdescribe('AdditionalMetadataComponent', () => {
  let component: AdditionalMetadataComponent;
  let fixture: ComponentFixture<AdditionalMetadataComponent>;

  const testItem = Object.assign(new Item(),
    {
      type: 'item',
      metadata: {
        'dc.title': 'test-title',
      },
      uuid: 'test-item-uuid',
      entityType: 'publication'
    }
  );

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdditionalMetadataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdditionalMetadataComponent);
    component = fixture.componentInstance;
    component.object = testItem;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
