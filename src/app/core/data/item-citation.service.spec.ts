import { TestBed } from '@angular/core/testing';

import { ItemCitationService } from './item-citation.service';

describe('ItemCitationService', () => {
  let service: ItemCitationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ItemCitationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
