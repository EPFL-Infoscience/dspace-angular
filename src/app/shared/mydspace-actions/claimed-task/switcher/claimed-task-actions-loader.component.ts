import {
  Component,
  ComponentFactoryResolver,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { getComponentByWorkflowTaskOption } from './claimed-task-actions-decorator';
import { ClaimedTask } from '../../../../core/tasks/models/claimed-task-object.model';
import { ClaimedTaskActionsDirective } from './claimed-task-actions.directive';
import { ClaimedTaskActionsAbstractComponent } from '../abstract/claimed-task-actions-abstract.component';
import { hasValue } from '../../../empty.util';
import { Subscription } from 'rxjs';
import { MyDSpaceActionsResult } from '../../mydspace-actions';

@Component({
  selector: 'ds-claimed-task-actions-loader',
  templateUrl: './claimed-task-actions-loader.component.html'
})
/**
 * Component for loading a ClaimedTaskAction component depending on the "option" input
 * Passes on the ClaimedTask to the component and subscribes to the processCompleted output
 */
export class ClaimedTaskActionsLoaderComponent implements OnInit, OnDestroy, OnChanges {
  /**
   * The ClaimedTask object
   */
  @Input() object: ClaimedTask;

  /**
   * The name of the option to render
   * Passed on to the decorator to fetch the relevant component for this option
   */
  @Input() option: string;

  /**
   * If the actions need to be disabled
   */
  @Input() disabled = false;

  /**
   * Emits the success or failure of a processed action
   */
  @Output() processCompleted = new EventEmitter<MyDSpaceActionsResult>();

  /**
   * Directive to determine where the dynamic child component is located
   */
  @ViewChild(ClaimedTaskActionsDirective, { static: true }) claimedTaskActionsDirective: ClaimedTaskActionsDirective;


  public componentInstance: ClaimedTaskActionsAbstractComponent;
  /**
   * Array to track all subscriptions and unsubscribe them onDestroy
   * @type {Array}
   */
  protected subs: Subscription[] = [];

  constructor(private componentFactoryResolver: ComponentFactoryResolver) {
  }

  /**
   * Fetch, create and initialize the relevant component
   */
  ngOnInit(): void {

    const comp = this.getComponentByWorkflowTaskOption(this.option);
    if (hasValue(comp)) {
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(comp);

      const viewContainerRef = this.claimedTaskActionsDirective.viewContainerRef;
      viewContainerRef.clear();

      const componentRef = viewContainerRef.createComponent(componentFactory);
      this.componentInstance = (componentRef.instance as ClaimedTaskActionsAbstractComponent);
      this.componentInstance.object = this.object;
      this.componentInstance.disabled = this.disabled;
      if (hasValue(this.componentInstance.processCompleted)) {
        this.subs.push(this.componentInstance.processCompleted.subscribe((result) => this.processCompleted.emit(result)));
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.componentInstance && changes.hasOwnProperty('disabled')) {
      this.componentInstance.disabled = this.disabled;
    }
  }

  getComponentByWorkflowTaskOption(option: string) {
    return getComponentByWorkflowTaskOption(option);
  }

  /**
   * Unsubscribe from open subscriptions
   */
  ngOnDestroy(): void {
    this.subs
      .filter((subscription) => hasValue(subscription))
      .forEach((subscription) => subscription.unsubscribe());
  }
}
