import { ItemData } from '../../interfaces/deduplication-differences.models';
import { ShowDiffBtnPipe } from './show-diff-btn.pipe';

describe('ShowDiffBtnPipe', () => {
  const pipe = new ShowDiffBtnPipe();
  const itemsMock: ItemData[] = [
    {
      id: '8bb47238-2964-4d9f-be56-e912bf17ac58',
      text: 'Content',
      color: 'red',
      itemHandle:'12324123'
    },
    {
      id: '5bb47238-5684-4d9f-be56-e912bf17ac23',
      text: 'Item Content',
      color: 'blue',
      itemHandle:'123241443'
    }
  ];

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should check if all the items in the array are different from each other', () => {
    const res = pipe.transform(itemsMock);
    expect(res).toBeFalse();
  });
});
