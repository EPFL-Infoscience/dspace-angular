import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { SetObject } from '../../core/deduplication/models/set.model';
import { DeduplicationSetsService } from './deduplication-sets.service';
import { DeduplicationStateService } from '../deduplication-state.service';

@Component({
  selector: 'ds-deduplication-sets',
  templateUrl: './deduplication-sets.component.html',
  styleUrls: ['./deduplication-sets.component.scss'],
})
export class DeduplicationSetsComponent implements OnInit {

  sets$: Observable<SetObject[]>;
  sets1$: Observable<any>;
  signatureId: string;
  rule: string;

  constructor(private route: ActivatedRoute, private deduplicationStateService: DeduplicationStateService) {
    this.signatureId = this.route.snapshot.params.id;
    this.rule = this.route.snapshot.params.rule;
    this.deduplicationStateService.dispatchRetrieveDeduplicationSetsBySignature(this.signatureId, this.rule, 5);
  }

  ngOnInit(): void { }
}
