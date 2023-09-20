import { autoserialize, deserialize } from 'cerialize';
import { typedObject } from '../../cache/builders/build-decorators';
import { CacheableObject } from '../../cache/cacheable-object.model';
import { HALLink } from '../../shared/hal-link.model';
import { ResourceType } from '../../shared/resource-type';
import { excludeFromEquals } from '../../utilities/equals.decorators';
import { SEARCH_STATISTICS } from './search-statistics.resource-type';

 @typedObject
 export class SearchStatistics extends CacheableObject {

   static type = SEARCH_STATISTICS;

   @excludeFromEquals
   @autoserialize
   type: ResourceType;

   @autoserialize
   id: string;

   @autoserialize
   count: number;

   @autoserialize
   topSearches: Map<string, number>;

   @deserialize
   _links: {
     self: HALLink
   };

 }
