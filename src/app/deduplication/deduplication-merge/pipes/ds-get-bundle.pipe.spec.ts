import { DSONameService } from './../../../core/breadcrumbs/dso-name.service';
import { DsGetBitstreamsPipe } from './ds-get-bundle.pipe';

describe('DsGetBitstreamsPipe', () => {

  let dsoDataService: DSONameService;

  beforeEach(() => { (1)
    dsoDataService = new DSONameService({ instant: (a) => a } as any);
  });

  it('create an instance', () => {
    const pipe = new DsGetBitstreamsPipe(dsoDataService);
    expect(pipe).toBeTruthy();
  });
});
