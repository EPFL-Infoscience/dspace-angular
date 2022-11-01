import { autoserialize, deserialize } from 'cerialize';

import { CacheableObject } from '../../cache/object-cache.reducer';
import { DEDUPLICATION_SET } from './deduplication-set.resource-type';
import { excludeFromEquals } from '../../utilities/equals.decorators';
import { ResourceType } from '../../shared/resource-type';
import { HALLink } from '../../shared/hal-link.model';
import { link, typedObject } from '../../cache/builders/build-decorators';
import { Item } from '../../shared/item.model';
import { ITEM } from '../../shared/item.resource-type';
import { Observable } from 'rxjs';
import { PaginatedList } from '../../data/paginated-list.model';
import { RemoteData } from '../../data/remote-data';

/**
 * The interface representing the deduplication set model
 */
@typedObject
export class SetObject implements CacheableObject {
  /**
   * A string representing the kind of object, e.g. community, item, …
   */
  static type = DEDUPLICATION_SET;

  /**
   * The type of this ConfigObject
   */
  @excludeFromEquals
  @autoserialize
  type: ResourceType;

  @autoserialize
  id: string;

  @autoserialize
  signatureId: string;

  @autoserialize
  setChecksum: string;

  @autoserialize
  otherSetIds: string[];

  @link(ITEM, true)
  items: Observable<RemoteData<PaginatedList<Item>>>;

  /**
   * Materialized list of Items
   */
  @excludeFromEquals
  itemsList: Item[];

  /**
   * The links to all related resources returned by the rest api.
   */
  @deserialize
  _links: {
    self: HALLink,
    items?: HALLink,
  };
}
