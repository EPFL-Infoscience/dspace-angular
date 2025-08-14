import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef, Inject,
  Injector,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Type,
  ViewChild
} from '@angular/core';

import { BehaviorSubject, Observable, fromEvent, merge, Subscription, animationFrameScheduler, Subject } from 'rxjs';
import { auditTime, map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import { SectionsDirective } from '../sections.directive';
import { SectionDataObject } from '../models/section-data.model';
import { rendersSectionType } from '../sections-decorator';
import { AlertType } from '../../../shared/alert/alert-type';
import { JsonPatchOperationPathCombiner } from '../../../core/json-patch/builder/json-patch-operation-path-combiner';
import { JsonPatchOperationsBuilder } from '../../../core/json-patch/builder/json-patch-operations-builder';
import { isNotEmpty } from '../../../shared/empty.util';
import { DOCUMENT } from '@angular/common';

/**
 * This component represents a section that contains the submission license form.
 */
@Component({
  selector: 'ds-submission-section-container',
  templateUrl: './section-container.component.html',
  styleUrls: ['./section-container.component.scss']
})
export class SubmissionSectionContainerComponent implements OnInit, AfterViewInit, OnDestroy {

  /**
   * The collection id this submission belonging to
   * @type {string}
   */
  @Input() collectionId: string;
  /**
   * The entity type, needed in order to search for metadata level security
   */

  @Input() entityType: string;


  /**
   * The section data
   * @type {SectionDataObject}
   */
  @Input() sectionData: SectionDataObject;

  /**
   * The submission id
   * @type {string}
   */
  @Input() submissionId: string;

  /**
   * The AlertType enumeration
   * @type {AlertType}
   */
  public AlertTypeEnum = AlertType;

  /**
   * A boolean representing if a section has a info message to display
   * @type {Observable<boolean>}
   */
  public hasInfoMessage: Observable<boolean>;

  /**
   * Whether this section has at least one visible leaf ds-dynamic-form-control-container
   * A leaf container is a ds-dynamic-form-control-container that does not contain another
   * ds-dynamic-form-control-container inside it.
   * If all leaf containers are hidden (via the hidden HTML attribute), the section will be hidden.
   */
  public hasVisibleLeafControls = true;

  /**
   * A boolean representing if a section delete operation is pending
   * @type {BehaviorSubject<boolean>}
   */
  public isRemoving: BehaviorSubject<boolean> = new BehaviorSubject(false);

  /**
   * Injector to inject a section component with the @Input parameters
   * @type {Injector}
   */
  public objectInjector: Injector;

  /**
   * The [[JsonPatchOperationPathCombiner]] object
   * @type {JsonPatchOperationPathCombiner}
   */
  protected pathCombiner: JsonPatchOperationPathCombiner;

  /**
   * The SectionsDirective reference
   */
  @ViewChild('sectionRef') sectionRef: SectionsDirective;

  /**
   * Reference to the rendered content where the child component is injected
   */
  @ViewChild('sectionContentContainer', { read: ElementRef }) sectionContentContainer: ElementRef;

  private mutationObserver: MutationObserver;
  private globalInputsSub: Subscription;
  private visibilityTrigger$ = new Subject<void>();

  /**
   * Initialize instance variables
   *
   * @param {Injector} injector
   * @param {JsonPatchOperationsBuilder} operationsBuilder
   * @param {TranslateService} translate
   * @param zone
   * @param cdr
   * @param document
   */
  constructor(
    private injector: Injector,
    private operationsBuilder: JsonPatchOperationsBuilder,
    private translate: TranslateService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
    @Inject(DOCUMENT) private document,
    ) {
  }

  /**
   * Initialize all instance variables
   */
  ngOnInit() {
    this.objectInjector = Injector.create({
      providers: [
        { provide: 'collectionIdProvider', useFactory: () => (this.collectionId), deps: [] },
        { provide: 'sectionDataProvider', useFactory: () => (this.sectionData), deps: [] },
        { provide: 'submissionIdProvider', useFactory: () => (this.submissionId), deps: [] },
        { provide: 'entityType', useFactory: () => (this.entityType), deps: [] },
      ],
      parent: this.injector
    });
    this.pathCombiner = new JsonPatchOperationPathCombiner('sections', this.sectionData.id);
    const messageInfoKey = 'submission.sections.' + this.sectionData.header + '.info';
    this.hasInfoMessage = this.translate.get(messageInfoKey).pipe(
      map((message: string) => isNotEmpty(message) && messageInfoKey !== message)
    );
  }

  ngAfterViewInit(): void {
    // Initial scan after the view initializes
    this.updateVisibilityBasedOnLeafControls();
    // Watch for dynamic content changes inside the section content container
    if (this.sectionContentContainer?.nativeElement) {
      // Run observer outside Angular to avoid triggering CD on every mutation
      this.zone.runOutsideAngular(() => {
        this.mutationObserver = new MutationObserver(() => {
          // Batch updates via subject to throttle rapid mutations
          this.visibilityTrigger$.next();
        });
        this.mutationObserver.observe(this.sectionContentContainer.nativeElement, {
          childList: true,
          subtree: true,
          attributes: true,
          // Observe only attributes that affect visibility state to avoid loops on class/style toggles
          attributeFilter: ['hidden', 'aria-hidden']
        });
      });
    }

    // Re-run the check whenever any input/select/textarea changes anywhere on the page
    const input$ = fromEvent(this.document, 'input');
    const change$ = fromEvent(this.document, 'change');

    // Merge all triggers (mutations + global input/change), and audit per animation frame to prevent loops
    this.globalInputsSub = merge(this.visibilityTrigger$, input$, change$)
      .pipe(auditTime(0, animationFrameScheduler))
      .subscribe(() => {
        this.zone.run(() => this.updateVisibilityBasedOnLeafControls());
      });
  }

  ngOnDestroy(): void {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
    if (this.globalInputsSub) {
      this.globalInputsSub.unsubscribe();
    }
  }

  private updateVisibilityBasedOnLeafControls() {
    try {
      const root: HTMLElement = this.sectionContentContainer?.nativeElement as HTMLElement;
      let visible = true;
      if (root) {
        const containers = Array.from(root.querySelectorAll('ds-dynamic-form-control-container')) as HTMLElement[];
        // leaf = a container without nested ds-dynamic-form-control-container inside
        const leaves = containers.filter((c) => !c.querySelector('ds-dynamic-form-control-container'));
        if (leaves.length > 0) {
          // A leaf is considered hidden if it has the hidden attribute/property or via computed styles/aria
          visible = leaves.some((leaf) => !this.isElementHidden(leaf));
        } else {
          // No leaves found, keep section visible by default
          visible = true;
        }
      }
      if (visible !== this.hasVisibleLeafControls) {
        this.hasVisibleLeafControls = visible;
        this.cdr.markForCheck();
      }
    } catch {
      // default to visible in case of errors
      this.hasVisibleLeafControls = true;
      this.cdr.markForCheck();
    }
  }

  private isElementHidden(el: HTMLElement): boolean {
    if (!el) {
      return false;
    }
    if (el.hasAttribute('hidden') || (el as any).hidden === true) {
      return true;
    }
    const ariaHidden = el.getAttribute('aria-hidden');
    if (ariaHidden === 'true') {
      return true;
    }
    const style = (el.ownerDocument?.defaultView || window).getComputedStyle(el);
    if (!style) {
      return false;
    }
    return style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0';
  }

  /**
   * Remove section from submission form
   *
   * @param event
   *    the event emitted
   */
  public removeSection(event) {
    event.preventDefault();
    event.stopPropagation();

    if (this.isRemoving.value === false) {
      this.isRemoving.next(true);
      this.operationsBuilder.remove(this.pathCombiner.getPath());
      this.sectionRef.removeSection(this.submissionId, this.sectionData.id);
      setTimeout(() => {
        this.isRemoving.next(false);
      }, 1000);
    }
  }

  /**
   * Find the correct component based on the section's type
   */
  getSectionContent(): Type<any> {
    return rendersSectionType(this.sectionData.sectionType) as unknown as Type<any>;
  }
}
