import { Collection } from './../../core/shared/collection.model';
import { Item } from './../../core/shared/item.model';
import { GetOwningCollectionTitlePipe } from './get-owning-collection-title.pipe';
import { of } from 'rxjs';
import { createSuccessfulRemoteDataObject } from './../../shared/remote-data.utils';

describe('GetOwningCollectionTitlePipe', () => {
  const pipe = new GetOwningCollectionTitlePipe();
  const collection = Object.assign(new Collection(), {
    metadata: {
      'dc.title': [
        {
          value: 'Owning Collection Title',
        },
      ],
    },
  });
  const collectionRD = createSuccessfulRemoteDataObject(collection);
  const item = Object.assign(new Item(), {
    id: 'item-id',
    owningCollection: of(collectionRD),
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return title', () => {
    const expectedResult = pipe.transform(item);
    expectedResult.subscribe((res: string) => {
      expect(res).toEqual('Owning Collection Title');
    });
  });
});
