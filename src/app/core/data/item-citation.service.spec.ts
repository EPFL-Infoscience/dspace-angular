// import { ItemCitationService } from './item-citation.service';

// class MockItemCitationService extends ItemCitationService {
//   constructor() {
//     super('items', null as any, null as any, null as any, null as any);
//   }
// }

// describe('ItemCitationService', () => {
//   let service: ItemCitationService;

//   beforeEach(() => {
//     service = new MockItemCitationService();
//   });

//   it('should be created', () => {
//     expect(service).toBeTruthy();
//   });

//   it('should return mocked export types', (done) => {
//     service.getAllExportTypes().subscribe((remoteData) => {
//       expect(remoteData.payload.page.map((citation) => citation.uniqueType)).toEqual([
//         'publication-chicago',
//         'publication-mla',
//         'publication-ieee',
//       ]);
//       done();
//     });
//   });

//   it('should return the mocked citation for a type id', (done) => {
//     service.getExportTypeById('publication-ieee').subscribe((remoteData) => {
//       expect(remoteData.payload.uniqueType).toBe('publication-ieee');
//       expect(remoteData.payload.value).toContain('Book con allegati');
//       done();
//     });
//   });

//   it('should return all mocked available citations', (done) => {
//     service.getAllAvailableCitations().subscribe((remoteData) => {
//       expect(remoteData.payload.page.length).toBe(7);
//       expect(remoteData.payload.page.some((citation) => citation.uniqueType === 'publication-cover')).toBeTrue();
//       done();
//     });
//   });
// });
