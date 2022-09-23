import { TranslateModule } from '@ngx-translate/core';
import { DeduplicationItemsService } from './../deduplication-merge/deduplication-items.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbActiveModal, NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { DeduplicationMergeResultComponent } from './deduplication-merge-result.component';
import { DeduplicationStateService } from '../deduplication-state.service';
import { getMockDeduplicationStateService } from '../../shared/mocks/deduplication.mock';

describe('DeduplicationMergeResultComponent', () => {
  let component: DeduplicationMergeResultComponent;
  let fixture: ComponentFixture<DeduplicationMergeResultComponent>;

  const modalStub = jasmine.createSpyObj('activeModal', ['close', 'dismiss']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeduplicationMergeResultComponent],
      providers: [
        { provide: NgbActiveModal, useValue: modalStub },
        {
          provide: NgbModal, useValue: {
            open: () => {/*comment*/
            }
          }
        },
        { provide: DeduplicationItemsService, useValue: {} },
        { provide: DeduplicationStateService, useClass: getMockDeduplicationStateService },
      ],
      imports: [
        NgbModule,
        TranslateModule.forRoot()
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeduplicationMergeResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
