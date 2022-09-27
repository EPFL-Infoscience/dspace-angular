import { Observable } from 'rxjs';
import { PaginatedList } from './../../../core/data/paginated-list.model';
import { PageInfo } from './../../../core/shared/page-info.model';
import { buildPaginatedList } from './../../../core/data/paginated-list.model';
import { Bitstream } from './../../../core/shared/bitstream.model';
import { Bundle } from './../../../core/shared/bundle.model';
import { createSuccessfulRemoteDataObject$ } from './../../../shared/remote-data.utils';
import { createPaginatedList } from './../../../shared/testing/utils.test';
import { DSONameService } from '../../../core/breadcrumbs/dso-name.service';
import { GetBitstreamsPipe } from './ds-get-bitstreams.pipe';
import { Item } from './../../../core/shared/item.model';
import { cold } from 'jasmine-marbles';

describe('GetBitstreamsPipe', () => {
  let pipe: GetBitstreamsPipe;
  let dsoDataService: DSONameService;
  const bitstream1 = Object.assign(new Bitstream(), {
    id: 'bitstream1',
    uuid: 'bitstream1',
  });

  const bitstreamPL: PaginatedList<Bitstream> = createPaginatedList([
    bitstream1,
  ]);

  const bundle = Object.assign(new Bundle(), {
    id: '0db938b1-586e-465b-942c-40145da3452c',
    uuid: '0db938b1-586e-465b-942c-40145da3452c',
    _links: {
      self: { href: 'bundle1-selflink' },
    },
    metadata: {
      'dc.title': [
        {
          value: 'ORIGINAL',
        },
      ],
    },
    bitstreams: createSuccessfulRemoteDataObject$(bitstreamPL),
  });

  const bundles = createSuccessfulRemoteDataObject$(
    buildPaginatedList(new PageInfo(), [bundle])
  );
  const item = Object.assign(new Item(), {
    bundles: bundles,
  });

  beforeEach(() => {
    dsoDataService = jasmine.createSpyObj('dsoNameService', {
      getName: bundle.firstMetadataValue('dc.title'),
    });

    pipe = new GetBitstreamsPipe(dsoDataService);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('return bitstream', () => {
    const result: Observable<Observable<Bitstream[]>> = pipe.transform(item);
    result.subscribe((res: Observable<Bitstream[]>) => {
      expect(res).toBeObservable(
        cold('(a|)', {
          a: [bitstream1],
        })
      );
    });
  });
});
