import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription, switchMap } from 'rxjs';
import { HALEndpointService } from './hal-endpoint.service';

export const KEEP_ALIVE_INTERVAL_MS = 5000; // 5 seconds

@Injectable({ providedIn: 'root' })
export class KeepConnectionAliveService implements OnDestroy {
  private readonly keepAliveUrl = this.halService.getRootHref();
  private sub: Subscription;

  constructor(private http: HttpClient, private halService: HALEndpointService) {}

  start(): void {
    this.sub = interval(KEEP_ALIVE_INTERVAL_MS)
      .pipe(switchMap(() => this.http.get(this.keepAliveUrl)))
      .subscribe();
  }

  stop(): void {
    this.sub?.unsubscribe();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
