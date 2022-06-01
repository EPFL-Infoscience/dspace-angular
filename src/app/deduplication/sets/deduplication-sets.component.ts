import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { SetObject } from '../../core/deduplication/models/set.model';
import { DeduplicationStateService } from '../deduplication-state.service';
import { DeduplicationSetsService } from './deduplication-sets.service';

@Component({
  selector: 'ds-deduplication-sets',
  templateUrl: './deduplication-sets.component.html',
  styleUrls: ['./deduplication-sets.component.scss'],
})
export class DeduplicationSetsComponent implements OnInit {

  sets$: Observable<SetObject[]>;
  sets1$: Observable<any>;
  signatureId: string;

  constructor(private route: ActivatedRoute, private deduplicationSetsService: DeduplicationSetsService) {
    this.signatureId = this.route.snapshot.params.id;
    // this.deduplicationStateService.getDeduplicationSetsPerSignature().subscribe(x => {
    //   console.log(x, 'test');
    // });
  }

  ngOnInit(): void { }

  asdf(){
    this.deduplicationSetsService.dispatchRetrieveDeduplicationSetsBySignature(this.signatureId, 5)
  }
}
