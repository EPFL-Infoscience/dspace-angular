import { of } from 'rxjs';

import { ItemExportTypesService } from './item-export-types.service';

describe('ItemExportTypesService', () => {
  let service: ItemExportTypesService;

  const requestService = {} as any;
  const rdbService = {} as any;
  const objectCache = {} as any;
  const halService = { getEndpoint: () => of('http://api') } as any;

  beforeEach(() => {
    service = new ItemExportTypesService(
      requestService,
      rdbService,
      objectCache,
      halService,
    );
  });

  it('returns page payload when present', (done) => {
    const page: any = [{ id: 'fmt1' }];
    spyOn(service as any, 'findListByHref').and.returnValue(of({ payload: { page } } as any));

    service.getAllExportTypes('item-1').subscribe((result) => {
      expect(result).toEqual(page);
      done();
    });
  });

  it('returns empty array when no page present', (done) => {
    spyOn(service as any, 'findListByHref').and.returnValue(of({ payload: {} } as any));

    service.getAllExportTypes('item-1').subscribe((result) => {
      expect(Array.isArray(result)).toBeTrue();
      expect(result.length).toBe(0);
      done();
    });
  });
});
