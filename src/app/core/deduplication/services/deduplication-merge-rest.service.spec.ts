import { TestBed } from '@angular/core/testing';

import { DeduplicationMergeRestService } from './deduplication-merge-rest.service';

describe('DeduplicationMergeRestService', () => {
  let service: DeduplicationMergeRestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeduplicationMergeRestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
