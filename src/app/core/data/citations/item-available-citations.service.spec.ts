import { of } from 'rxjs';

import { ItemAvailableCitationsService } from './item-available-citations.service';

describe('ItemAvailableCitationsService', () => {
  let service: ItemAvailableCitationsService;

  const requestService = {} as any;
  const rdbService = {} as any;
  const objectCache = {} as any;
  const halService = { getEndpoint: () => of('http://api') } as any;

  beforeEach(() => {
    service = new ItemAvailableCitationsService(
      requestService,
      rdbService,
      objectCache,
      halService,
    );
  });

  it('maps payload object to Citation[]', (done) => {
    const payload = { apa: 'apa text', mla: 'mla text' };
    spyOn(service as any, 'findByHref').and.returnValue(of({ payload } as any));

    service.getAllAvailableCitations('item-1').subscribe((result) => {
      expect(result.length).toBe(2);
      const types = result.map((c: any) => c.exportType).sort();
      expect(types).toEqual(['apa', 'mla']);
      done();
    });
  });

  it('handles empty payload gracefully', (done) => {
    spyOn(service as any, 'findByHref').and.returnValue(of({ payload: {} } as any));

    service.getAllAvailableCitations('item-1').subscribe((result) => {
      expect(Array.isArray(result)).toBeTrue();
      expect(result.length).toBe(0);
      done();
    });
  });
});
