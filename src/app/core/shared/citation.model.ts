import { autoserialize, inheritSerialization } from 'cerialize';
import { typedObject } from '../cache/builders/build-decorators';

import { DSpaceObject } from './dspace-object.model';
import { CITATION } from './citation.resource-type';
import { ChildHALResource } from './child-hal-resource.model';
import { HandleObject } from './handle-object.model';

/**
 * Class representing a DSpace Citation
 */
@typedObject
@inheritSerialization(DSpaceObject)
export class Citation
  extends DSpaceObject
  implements ChildHALResource, HandleObject {
  static type = CITATION;

  handle: string;

  @autoserialize
  exportType: string;

  @autoserialize
  value: string;

  getParentLinkKey(): keyof this['_links'] {
    throw new Error('Method not implemented.'); //TODO implement
  }
}
