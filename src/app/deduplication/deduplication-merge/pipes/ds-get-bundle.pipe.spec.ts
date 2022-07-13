import { DSONameService } from './../../../core/breadcrumbs/dso-name.service';
import { GetBitstreamsPipe } from './ds-get-bundle.pipe';

describe('GetBitstreamsPipe', () => {

  let dsoDataService: DSONameService;

  beforeEach(() => { (1)
    dsoDataService = new DSONameService({ instant: (a) => a } as any);
  });

  it('create an instance', () => {
    const pipe = new GetBitstreamsPipe(dsoDataService);
    expect(pipe).toBeTruthy();
  });
});
