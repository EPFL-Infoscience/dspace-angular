import { DeduplicationStateService } from '../../deduplication-state.service';
import { SignatureObject } from '../../../core/deduplication/models/signature.model';

import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import floor from 'lodash/floor';

/**
 * Component to display the deduplication signatures cards.
 */
@Component({
  selector: 'ds-deduplication-signatures',
  templateUrl: './deduplication-signatures.component.html',
  styleUrls: ['./deduplication-signatures.component.scss'],
})
export class DeduplicationSignaturesComponent implements OnInit {
  /**
   * The deduplication signatures list.
   */
  @Input() public signatures: Observable<SignatureObject[]>;

  /**
   * The number of deduplication signatures card per row.
   */
  @Input() public elementsPerRow: number;

  /**
   * The number of bootstrap column grid used by a single card.
   */
  public bootstrapColNumber: number;

  constructor(private deduplicationStateService: DeduplicationStateService) { }

  /**
   * Component intitialization.
   */
  public ngOnInit(): void {
    this.bootstrapColNumber = floor(12 / this.elementsPerRow);
  }

  /**
   * Clear the store before entering the sets list
   * Redirects to sets panel
   * @param signatureId The id of the signature
   * @param rule The rule of permissions
   */
  onRedirect(signatureId: string, rule: string) {
    this.deduplicationStateService.dispatchRemoveSets(
      signatureId,
      rule
      );
  }
}
