import { Collection } from './../../core/shared/collection.model';
import { Item } from 'src/app/core/shared/item.model';
import { GetOwningCollectionTitlePipe } from './get-owning-collection-title.pipe';
import { of } from 'rxjs';
import { createSuccessfulRemoteDataObject } from 'src/app/shared/remote-data.utils';
import { cold, hot } from 'jasmine-marbles';

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

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('create return title', (done) => {
    const expectedResult = pipe.transform(item);
    console.log(expectedResult, 'GetOwningCollectionTitlePipe');
    const expectedValue = cold('Owning Collection Title' );
    // const expected$ = hot('(a|)', { a: expected });
    expect(expectedResult).toBe(expectedValue);
    done();
  });
});
