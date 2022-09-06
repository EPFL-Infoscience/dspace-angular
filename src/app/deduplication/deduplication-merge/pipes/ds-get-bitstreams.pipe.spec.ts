import { DSONameService } from '../../../core/breadcrumbs/dso-name.service';
import { GetBitstreamsPipe } from './ds-get-bitstreams.pipe';

describe('GetBitstreamsPipe', () => {

  let dsoDataService: DSONameService;

  beforeEach(() => {
    dsoDataService = new DSONameService({ instant: (a) => a } as any);
  });

  it('create an instance', () => {
    const pipe = new GetBitstreamsPipe(dsoDataService);
    expect(pipe).toBeTruthy();
  });
});
