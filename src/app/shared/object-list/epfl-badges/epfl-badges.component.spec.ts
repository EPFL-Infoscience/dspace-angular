import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpflBadgesComponent } from './epfl-badges.component';
import { VersionDataService } from '../../../core/data/version-data.service';
import { VersionHistoryDataService } from '../../../core/data/version-history-data.service';

describe('WorkspaceWorkflowBadgesComponent', () => {
  let component: EpflBadgesComponent;
  let fixture: ComponentFixture<EpflBadgesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EpflBadgesComponent ],
      providers: [
        { provide: VersionDataService, useValue: {} },
        { provide: VersionHistoryDataService, useValue: {} },
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EpflBadgesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
