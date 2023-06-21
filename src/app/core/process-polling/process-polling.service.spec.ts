import { TestBed } from '@angular/core/testing';

import { ProcessPollingService } from './process-polling.service';

describe('ProcessPollingService', () => {
  let service: ProcessPollingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProcessPollingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
