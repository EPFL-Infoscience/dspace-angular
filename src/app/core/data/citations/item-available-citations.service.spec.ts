import { of } from 'rxjs';

import { ItemAvailableCitationsService } from './item-available-citations.service';
import { createSuccessfulRemoteDataObject$ } from '../../../shared/remote-data.utils';
import { environment } from '../../../../environments/environment';

describe('ItemAvailableCitationsService', () => {
  let service: ItemAvailableCitationsService;

  const requestService = {} as any;
  const rdbService = {} as any;
  const objectCache = {} as any;
  const halService = { getEndpoint: () => of('http://api') } as any;

  beforeEach(() => {
    spyOnProperty(environment, 'citationTypesWhitelist').and.returnValue([
      'publication-apa',
      'publication-mla',
    ]);

    service = new ItemAvailableCitationsService(
      requestService,
      rdbService,
      objectCache,
      halService,
    );
  });

  it('maps payload object to Citation[]', (done) => {
    const payload = { 'publication-apa': 'apa text', 'publication-mla': 'mla text' };
    spyOn(service as any, 'findByHref').and.returnValue(createSuccessfulRemoteDataObject$(payload));

    service.getAllAvailableCitations('item-1').subscribe((result) => {
      expect(result.length).toBe(2);
      const types = result.map((c: any) => c.exportType).sort();
      expect(types).toEqual(['publication-apa', 'publication-mla']);
      done();
    });
  });

  it('filters out citation types that are not in the whitelist', (done) => {
    const payload = { 'publication-apa': 'apa text', 'publication-mla': 'mla text', 'other-type': 'other text' };
    spyOn(service as any, 'findByHref').and.returnValue(createSuccessfulRemoteDataObject$(payload));

    service.getAllAvailableCitations('item-1').subscribe((result) => {
      expect(result.length).toBe(2);
      const types = result.map((c: any) => c.exportType).sort();
      expect(types).toEqual(['publication-apa', 'publication-mla']);
      done();
    });
  });

  it('trims citation values', (done) => {
    const payload = { 'publication-apa': '  apa text  ' };
    spyOn(service as any, 'findByHref').and.returnValue(createSuccessfulRemoteDataObject$(payload));

    service.getAllAvailableCitations('item-1').subscribe((result) => {
      expect(result[0].value).toBe('apa text');
      done();
    });
  });

  it('handles empty payload gracefully', (done) => {
    spyOn(service as any, 'findByHref').and.returnValue(createSuccessfulRemoteDataObject$({}));

    service.getAllAvailableCitations('item-1').subscribe((result) => {
      expect(Array.isArray(result)).toBeTrue();
      expect(result.length).toBe(0);
      done();
    });
  });
});
