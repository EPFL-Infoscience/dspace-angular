import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import {
  getFirstSucceededRemoteData,
  getPaginatedListPayload,
  getRemoteDataPayload
} from '../../core/shared/operators';
import {SearchStatistics} from '../../core/statistics/models/search-statistics.model';
import {SearchStatisticsDataService} from '../../core/statistics/search-statistics-data.service';
import {NgbDate, NgbDateParserFormatter, NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';

/**
 * Component related to the Search statistics page.
 */
@Component({
  selector: 'ds-search-statistics',
  templateUrl: './search-statistics-page.component.html',
  styleUrls: ['./search-statistics-page.component.scss']
})
export class SearchStatisticsPageComponent implements OnInit {

  searches$ = new BehaviorSubject<SearchStatistics>(null);

  dateFrom: NgbDateStruct;

  dateTo: NgbDateStruct;

  constructor( private searchStatisticsService: SearchStatisticsDataService,
    private ngbDateParserFormatter: NgbDateParserFormatter) {

  }

  ngOnInit(): void {
    this.searchByDateRange(null, null);
  }

  /**
   * Perform a search when the search filters change.
   */
  onSearchFilterChange() {
    this.searchByDateRange(this.parseDate(this.dateFrom),this.parseDate(this.dateTo));
  }

  /**
   * Search for the Search steps and Search owners using the provided filters.
   *
   * @param startDate the start date to search for
   * @param endDate the end date to search for
   * @param collectionId the collection id
   * @param limit the limit to apply
   * @private
   */
  private searchByDateRange(startDate: string, endDate: string) {

    this.searchStatisticsService.searchByDateRange(startDate, endDate).pipe(
      getFirstSucceededRemoteData(),
      getRemoteDataPayload(),
      getPaginatedListPayload(),
      take(1)
    ).subscribe((searchSteps) => {
      this.searches$.next(searchSteps[0]);
    });

  }

  /**
   * Reset all the search filters.
   */
  resetFilters(): void {
    this.dateFrom = null;
    this.dateTo = null;
    this.searchByDateRange(null, null);
  }

  /**
   * Parse the incoming date object.
   *
   * @param dateObject the date to parse
   */
  parseDate(dateObject: NgbDateStruct) {
    if ( !dateObject ) {
      return null;
    }
    const date: NgbDate = new NgbDate(dateObject.year, dateObject.month, dateObject.day);
    return this.ngbDateParserFormatter.format(date);
  }

  asIsOrder() {
    return 0;
  }

}
