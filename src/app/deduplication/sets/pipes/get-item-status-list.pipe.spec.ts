import { ItemMock } from './../../../shared/mocks/item.mock';
import { GetItemStatusListPipe, ItemStatus } from './get-item-status-list.pipe';

describe('GetItemStatusListPipe', () => {
  let pipe: any;
  beforeEach(() => {
    pipe = new GetItemStatusListPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('shoud return a list with the item\'s status', () => {
    const result: string[] = pipe.transform(ItemMock);
    expect(result.length).toBeGreaterThan(0);
    expect(result).toContain(ItemStatus.IN_ARCHIVE.toString());
  });
});
