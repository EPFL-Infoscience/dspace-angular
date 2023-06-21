import { Injectable } from '@angular/core';
import { of, Subject, Subscription, timer } from 'rxjs';
import { getFirstCompletedRemoteData, getFirstSucceededRemoteListPayload } from '../shared/operators';
import { Bitstream } from '../shared/bitstream.model';
import { DSpaceObject } from '../shared/dspace-object.model';
import { ProcessDataService } from '../data/processes/process-data.service';
import { map, switchMap } from 'rxjs/operators';
import { DSONameService } from '../breadcrumbs/dso-name.service';

interface PollingConfig {
  interval?: number;
  maxAttempts?: number;
  withFiles?: boolean;
  closeOnCompleted?: boolean;
  closeOnFailed?: boolean;
}

const defaultConfig: PollingConfig = {
  interval: 4000,
  maxAttempts: 15,
  withFiles: false,
  closeOnCompleted: true,
  closeOnFailed: true,
};

@Injectable({providedIn: 'root'})
export class ProcessPollingService {

  private pollingProcesses = new Map<string, Subscription>();

  constructor(
    protected processService: ProcessDataService,
    protected nameService: DSONameService,
  ) {}

  startPolling(processId: string, config: PollingConfig = defaultConfig) {
    const { interval, maxAttempts, withFiles, closeOnCompleted, closeOnFailed} = {...defaultConfig, ...config};
    const sourceTimer$ = timer(0, interval);
    const processData$ = this.processService.getProcess(processId).pipe(getFirstCompletedRemoteData());

    let attempt = 0;

    const data$ = sourceTimer$.pipe(
      switchMap(() => processData$.pipe(
        switchMap((process) => {
          if (process.hasSucceeded) {
            if (closeOnCompleted) {
              this.closePolling(processId);
            }

            if (withFiles) {
              return this.getFiles(processId).pipe(
                map((files: Bitstream[]) => {
                  return {...process.payload, files};
                })
              );
            }

            return of(process.payload);
          } else if (process.hasFailed) {
            if (closeOnFailed) {
              this.closePolling(processId);
            }
            return of(process.payload);
          } else {
            attempt++; // increase attempt counter if process is still running
            if (attempt > maxAttempts) {
              this.closePolling(processId);
              return of({...(process.payload || {}) , reachedMaxAttempt: true});
            } else {
              return of({...(process.payload || {}) , loading: true});
            }
          }
        })
      )),
    );

    const dataSubject = new Subject<any>();

    // create subscription to data$ and push data to subject so we can use it in the component
    const subscription = data$.subscribe(dataSubject);

    // add subscription to map so we can close it later
    this.pollingProcesses.set(processId, subscription);

    // return observable so we can subscribe to it in the component and not the subject directly
    return dataSubject.asObservable();
  }


  closePolling(processId: string) {
    const subscription = this.pollingProcesses.get(processId);
    if (subscription) {
      subscription.unsubscribe();
      this.pollingProcesses.delete(processId);
    }
  }


  private getFiles(processId: string) {
    return this.processService.getFiles(processId)
      .pipe(
        getFirstSucceededRemoteListPayload(),
        map((files: Bitstream[]) => {
          return files.filter((file) => {
            if (file instanceof DSpaceObject) {
              // we don't want to show log files
              return !this.nameService.getName(file).includes('.log');
            }
            return true;
          });
        })
      );
  }

}
