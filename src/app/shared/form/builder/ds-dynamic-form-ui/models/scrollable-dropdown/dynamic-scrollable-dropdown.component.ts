import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ElementRef,
  OnDestroy
} from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

import { Observable, of as observableOf, Subject, Subscription } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, tap } from 'rxjs/operators';
import { NgbDropdown, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  DynamicFormControlCustomEvent,
  DynamicFormLayoutService,
  DynamicFormValidationService
} from '@ng-dynamic-forms/core';

import { VocabularyEntry } from '../../../../../../core/submission/vocabularies/models/vocabulary-entry.model';
import { DynamicScrollableDropdownModel } from './dynamic-scrollable-dropdown.model';
import { PageInfo } from '../../../../../../core/shared/page-info.model';
import { isEmpty, isNotEmpty } from '../../../../../empty.util';
import { VocabularyService } from '../../../../../../core/submission/vocabularies/vocabulary.service';
import { getFirstSucceededRemoteDataPayload } from '../../../../../../core/shared/operators';
import { buildPaginatedList, PaginatedList } from '../../../../../../core/data/paginated-list.model';
import { DsDynamicVocabularyComponent } from '../dynamic-vocabulary.component';
import { FormFieldMetadataValueObject } from '../../../models/form-field-metadata-value.model';
import { FormBuilderService } from '../../../form-builder.service';
import { SubmissionService } from '../../../../../../submission/submission.service';
import { RemoteData } from '../../../../../../core/data/remote-data';

/**
 * Component representing a dropdown input field
 */
@Component({
  selector: 'ds-dynamic-scrollable-dropdown',
  styleUrls: ['./dynamic-scrollable-dropdown.component.scss'],
  templateUrl: './dynamic-scrollable-dropdown.component.html'
})
export class DsDynamicScrollableDropdownComponent extends DsDynamicVocabularyComponent implements OnInit, OnDestroy {
  @ViewChild('dropdownMenu', { read: ElementRef }) dropdownMenu: ElementRef;

  @Input() bindId = true;
  @Input() group: UntypedFormGroup;
  @Input() model: DynamicScrollableDropdownModel;

  @Output() blur: EventEmitter<any> = new EventEmitter<any>();
  @Output() change: EventEmitter<any> = new EventEmitter<any>();
  @Output() focus: EventEmitter<any> = new EventEmitter<any>();
  @Output() customEvent: EventEmitter<DynamicFormControlCustomEvent> = new EventEmitter();

  public currentValue: Observable<string>;
  public loading = false;
  public pageInfo: PageInfo;
  public optionsList: VocabularyEntry[] = [];
  public inputText: string = null;
  public selectedIndex = 0;
  public acceptableKeys = ['Space', 'NumpadMultiply', 'NumpadAdd', 'NumpadSubtract', 'NumpadDecimal', 'Semicolon', 'Equal', 'Comma', 'Minus', 'Period', 'Quote', 'Backquote'];
  public otherListEntry = '';
  public addButtonDisabled = false;


  /**
   * The text that is being searched
   */
  searchText: string = null;

  /**
   * The subject that is being subscribed to understand when the change happens to implement debounce
   */
  filterTextChanged: Subject<string> = new Subject<string>();

  /**
   * The subscription to be utilized on destroy to remove filterTextChange subscription
   */
  subSearch: Subscription;


  constructor(protected vocabularyService: VocabularyService,
              protected cdr: ChangeDetectorRef,
              protected layoutService: DynamicFormLayoutService,
              protected validationService: DynamicFormValidationService,
              protected formBuilderService: FormBuilderService,
              protected modalService: NgbModal,
              protected submissionService: SubmissionService
  ) {
    super(vocabularyService, layoutService, validationService, formBuilderService, modalService, submissionService);
  }

  /**
   * Initialize the component, setting up the init form value
   */
  ngOnInit() {
    if (this.model.metadataValue) {
      this.setCurrentValue(this.model.metadataValue, true);
    }

    this.updatePageInfo(this.model.maxOptions, 1);
    this.retrieveEntries(null, true);

    this.group.get(this.model.id).valueChanges.pipe(distinctUntilChanged())
      .subscribe((value) => {
        this.setCurrentValue(value, true);
      });
    this.initFilterSubscriber();
  }


  /**
   * Start subscription for filterTextChange to detect change and implement debounce
   */
  initFilterSubscriber(): void {
    this.subSearch = this.filterTextChanged.pipe(
      debounceTime(700),
      distinctUntilChanged()
    ).subscribe((searchText) => {
      this.retrieveEntries(searchText);
    });
  }

  /**
   * On input change value we set the change to filterTextChanged subject
   */
  filter(filterText: string) {
    this.filterTextChanged.next(filterText);
  }


  /**
   * Converts an item from the result list to a `string` to display in the `<input>` field.
   */
  inputFormatter = (x: VocabularyEntry): string => x.display || x.value;

  /**
   * Opens dropdown menu
   * @param sdRef The reference of the NgbDropdown.
   */
  openDropdown(sdRef: NgbDropdown) {
    if (!this.model.readOnly) {
      this.group.markAsUntouched();
      this.inputText = null;
      this.updatePageInfo(this.model.maxOptions, 1);
      this.retrieveEntries(null, false);
      sdRef.open();
    }
  }

  navigateDropdown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      this.selectedIndex = Math.min(this.selectedIndex + 1, this.optionsList.length - 1);
    } else if (event.key === 'ArrowUp') {
      this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
    }
    this.scrollToSelected();
  }

  scrollToSelected() {
    const dropdownItems = this.dropdownMenu.nativeElement.querySelectorAll('.dropdown-item');
    const selectedItem = dropdownItems[this.selectedIndex];
    if (selectedItem) {
      selectedItem.scrollIntoView({ block: 'nearest' });
    }
  }

  /**
   * KeyDown handler to allow toggling the dropdown via keyboard
   * @param event KeyboardEvent
   * @param sdRef The reference of the NgbDropdown.
   */
  selectOnKeyDown(event: KeyboardEvent, sdRef: NgbDropdown) {
    const keyName = event.key;

    if (keyName === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      if (sdRef.isOpen()) {
        this.onSelect(this.optionsList[this.selectedIndex]);
        sdRef.close();
      } else {
        sdRef.open();
      }
    } else if (keyName === 'ArrowDown' || keyName === 'ArrowUp') {
      event.preventDefault();
      event.stopPropagation();
      this.navigateDropdown(event);
    } else if (keyName === 'Backspace') {
      this.removeKeyFromInput();
    } else if (this.isAcceptableKey(keyName)) {
      this.addKeyToInput(keyName);
    }
  }

  addKeyToInput(keyName: string) {
    if (this.inputText === null) {
      this.inputText = '';
    }
    this.inputText += keyName;
    // When a new key is added, we need to reset the page info
    this.updatePageInfo(this.model.maxOptions, 1);
    this.retrieveEntries(this.inputText, false);
  }

  removeKeyFromInput() {
    if (this.inputText !== null) {
      this.inputText = this.inputText.slice(0, -1);
      if (this.inputText === '') {
        this.inputText = null;
      }
      this.retrieveEntries(this.inputText, false);
    }
  }


  isAcceptableKey(keyPress: string): boolean {
    // allow all letters and numbers
    if (keyPress.length === 1 && keyPress.match(/^[a-zA-Z0-9]*$/)) {
      return true;
    }
    // Some other characters like space, dash, etc should be allowed as well
    return this.acceptableKeys.includes(keyPress);
  }

  /**
   * Loads any new entries
   */
  onScroll() {
    if (!this.loading && this.pageInfo.currentPage <= this.pageInfo.totalPages) {
      this.loading = true;
      this.updatePageInfo(
        this.pageInfo.elementsPerPage,
        this.pageInfo.currentPage + 1,
        this.pageInfo.totalElements,
        this.pageInfo.totalPages
      );
      this.retrieveEntries(this.searchText, false, true, true);
    }
  }

  /**
   * Emits a change event and set the current value with the given value.
   * @param event The value to emit.
   */
  onSelect(event) {
    this.group.markAsDirty();
    this.dispatchUpdate(event);
    this.setCurrentValue(event);
    this.otherListEntry = '';
  }

  /**
   * Sets the current value with the given value.
   * @param value The value to set.
   * @param init Representing if is init value or not.
   */
  setCurrentValue(value: any, init = false): void {
    let result: Observable<string>;

    if (init) {
      result = this.getInitValueFromModel().pipe(
        map((formValue: FormFieldMetadataValueObject) => formValue.display)
      );
    } else {
      if (isEmpty(value)) {
        result = observableOf('');
      } else if (typeof value === 'string') {
        result = observableOf(value);
      } else {
        result = observableOf(value.display);
      }
    }

    this.currentValue = result;
  }

  /**
   * Retrieve entries from vocabulary
   * @param searchText If present filter entries for the given text
   * @param initModel  If true set the current value
   * @param concatResults  If true concat results to the current list
   * @private
   */
  private retrieveEntries(searchText = null, initModel = false, concatResults = false, isScrolling = false) {
    this.searchText = searchText;
    let search$: Observable<RemoteData<PaginatedList<VocabularyEntry>>>;
    if (searchText) {
      const searchPageInfo = Object.assign(new PageInfo(), {
        elementsPerPage: this.pageInfo.elementsPerPage,
        currentPage: isScrolling ? this.pageInfo.currentPage : 1,
        totalElements: this.pageInfo.totalElements,
        totalPages: this.pageInfo.totalPages });
      search$ = this.vocabularyService.getVocabularyEntriesByValue(this.searchText, false, this.model.vocabularyOptions,
        searchPageInfo);
    } else {
      search$ = this.vocabularyService.getVocabularyEntries(this.model.vocabularyOptions, this.pageInfo);
    }
    search$.pipe(
      getFirstSucceededRemoteDataPayload(),
      catchError(() => observableOf(buildPaginatedList(
          new PageInfo(),
          []
        ))
      ),
      tap(() => this.loading = false))
      .subscribe((list: PaginatedList<VocabularyEntry>) => {
        this.optionsList = (concatResults) ? this.optionsList.concat(list.page) : list.page;
        if (initModel && this.model.value) {
          this.setCurrentValue(this.model.value, true);
        }
        this.updatePageInfo(
          list.pageInfo.elementsPerPage,
          list.pageInfo.currentPage,
          list.pageInfo.totalElements,
          list.pageInfo.totalPages
        );
        this.selectedIndex = 0;
        // After all entries have been retrieved, if the component is an opendropdown then
        // check if the current value is a custom value and add it to the list
        const isLastPage = this.pageInfo.currentPage === this.pageInfo.totalPages;
        const modelValue: any = this.model.value;
        if (isLastPage && isNotEmpty(modelValue?.value)) {
          const isCustomValue = isEmpty(this.optionsList.filter(element => element.value === modelValue.value));
          if (isCustomValue) {
            const object = this.createVocabularyObject(modelValue.display, modelValue.value, undefined);
            this.optionsList.push(object);
          }
        }
        this.cdr.detectChanges();
      });
  }

  /**
   * Add the Value to List Dropdown.
   */
  addListItem(sdRef: NgbDropdown) {
    let entryCount = 0;
    this.addButtonDisabled = true;
    if (this.otherListEntry.toString() !== '') {
      if (this.optionsList.length > 0) {
        this.optionsList.forEach(element => {
          if ((element.display.toLowerCase() === this.otherListEntry.toLowerCase()) ||
              (element.value?.toLowerCase() === this.otherListEntry.toLowerCase()) ||
              (this.otherListEntry.toLowerCase() === 'other')) {
            entryCount++;
          }
        });
      }
      if (entryCount === 0) {
        const object = this.createVocabularyObject(this.otherListEntry, this.otherListEntry, undefined);
        this.optionsList.push(object);
        this.onSelect(object);
        sdRef.close();
        this.addButtonDisabled = false;
      } else {
        this.addButtonDisabled = false;
      }
    } else {
      this.addButtonDisabled = false;
    }
  }

  /**
   * Create a vocabulary object.
   */
  createVocabularyObject(display, value, otherInformation) {
    const object = Object.assign(new VocabularyEntry(),this.model.value, {
      value: value,
      display: display,
      otherInformation: otherInformation,
      type: 'vocabularyEntry'
    });
    return object;
  }

  ngOnDestroy() {
    this.subSearch.unsubscribe();
  }

}
