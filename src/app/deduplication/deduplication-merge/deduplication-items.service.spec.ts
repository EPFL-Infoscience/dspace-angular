import { TestBed } from '@angular/core/testing';

import { DeduplicationItemsService } from './deduplication-items.service';

describe('DeduplicationItemsService', () => {
  let service: DeduplicationItemsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeduplicationItemsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
