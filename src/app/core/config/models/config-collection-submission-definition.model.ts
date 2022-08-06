import { inheritSerialization } from 'cerialize';
import { typedObject } from '../../cache/builders/build-decorators';
import { ConfigObject } from './config.model';
import { COLLECTION_SUBMISSION_DEFINITION_TYPE } from './config-type';

/**
 * Class for the configuration describing the submission
 */
@typedObject
@inheritSerialization(ConfigObject)
export class CollectionSubmissionDefinitionModel extends ConfigObject {
  static type = COLLECTION_SUBMISSION_DEFINITION_TYPE;
}
