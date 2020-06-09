import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { floor } from 'lodash';
import { SignatureObject } from '../../core/deduplication/models/signature.model';

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

  /**
   * Component intitialization.
   */
  public ngOnInit(): void {
    this.bootstrapColNumber = floor(12 / this.elementsPerRow);
  }
}
