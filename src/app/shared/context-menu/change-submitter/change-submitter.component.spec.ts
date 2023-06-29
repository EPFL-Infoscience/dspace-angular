import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeSubmitterComponent } from './change-submitter.component';
import { DSpaceObjectType } from '../../../core/shared/dspace-object-type.model';
import { Collection } from '../../../core/shared/collection.model';

describe('ChangeSubmitterComponent', () => {
  let component: ChangeSubmitterComponent;
  let fixture: ComponentFixture<ChangeSubmitterComponent>;

  beforeEach(async () => {
    const dso = Object.assign(new Collection(), {
      id: 'test-collection',
      _links: {
        self: { href: 'test-collection-selflink' }
      }
    });
    await TestBed.configureTestingModule({
      declarations: [ ChangeSubmitterComponent ],
      providers: [
        { provide: 'contextMenuObjectProvider', useValue: dso },
        { provide: 'contextMenuObjectTypeProvider', useValue: DSpaceObjectType.COLLECTION },
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeSubmitterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
