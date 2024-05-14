import { DeduplicationSetsEffects } from './sets/deduplication-sets.effects';
import { DeduplicationSignaturesEffects } from './signatures/deduplication-signatures.effects';

export const deduplicationEffects = [
  DeduplicationSignaturesEffects,
  DeduplicationSetsEffects
];
