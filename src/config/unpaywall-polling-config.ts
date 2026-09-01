import { Config } from './config.interface';

/**
 * Configuration for the Unpaywall polling retry strategy.
 *
 * Phase 1: polls every `initialIntervalMs` for up to `initialMaxRetries` attempts.
 * Phase 2: polls every `extendedIntervalMs` for up to `extendedMaxRetries` attempts.
 *
 * With the defaults (10s × 3 + 30s × 5) the maximum total wait is ~180s (3 minutes).
 */
export class UnpaywallPollingConfig implements Config {
  /** Polling interval in milliseconds for the first phase. */
  initialIntervalMs: number;
  /** Maximum number of retries during the first phase. */
  initialMaxRetries: number;
  /** Polling interval in milliseconds for the second (extended) phase. */
  extendedIntervalMs: number;
  /** Maximum number of retries during the second phase. */
  extendedMaxRetries: number;
}
