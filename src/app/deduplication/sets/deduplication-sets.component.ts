import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { SetObject } from '../../core/deduplication/models/set.model';
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

  constructor(private route: ActivatedRoute,   private deduplicationStateService: DeduplicationStateService ) {
   this.signatureId = this.route.snapshot.params.id;
console.log(this.signatureId);
 this.deduplicationStateService.getDeduplicationSetsPerSignature().subscribe(x=>{
   console.log(x,'test');

 });

  }

  ngOnInit(): void {

  }

}
