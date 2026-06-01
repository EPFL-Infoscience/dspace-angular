import { of } from 'rxjs';

import { ItemExportTypeService } from './item-export-type.service';

describe('ItemExportTypeService', () => {
  let service: ItemExportTypeService;

  const requestService = {} as any;
  const rdbService = {} as any;
  const objectCache = {} as any;
  const halService = { getEndpoint: () => of('http://api') } as any;

  beforeEach(() => {
    service = new ItemExportTypeService(
      requestService,
      rdbService,
      objectCache,
      halService,
    );
  });

  it('returns string payload directly', (done) => {
    spyOn(service as any, 'findByHref').and.returnValue(of({ payload: 'plain citation' } as any));

    service.getExportTypeById('item-1', 'apa').subscribe((result) => {
      expect(result).toBe('plain citation');
      done();
    });
  });

  it('trims string payloads', (done) => {
    spyOn(service as any, 'findByHref').and.returnValue(of({ payload: '  plain citation  ' } as any));

    service.getExportTypeById('item-1', 'apa').subscribe((result) => {
      expect(result).toBe('plain citation');
      done();
    });
  });

  it('extracts value property when payload is object', (done) => {
    spyOn(service as any, 'findByHref').and.returnValue(of({ payload: { value: 'obj citation' } } as any));

    service.getExportTypeById('item-1', 'apa').subscribe((result) => {
      expect(result).toBe('obj citation');
      done();
    });
  });

  it('trims value property when payload is object', (done) => {
    spyOn(service as any, 'findByHref').and.returnValue(of({ payload: { value: '  obj citation  ' } } as any));

    service.getExportTypeById('item-1', 'apa').subscribe((result) => {
      expect(result).toBe('obj citation');
      done();
    });
  });

  it('returns empty string for unexpected payloads', (done) => {
    spyOn(service as any, 'findByHref').and.returnValue(of({ payload: 123 } as any));

    service.getExportTypeById('item-1', 'apa').subscribe((result) => {
      expect(result).toBe('');
      done();
    });
  });
});
