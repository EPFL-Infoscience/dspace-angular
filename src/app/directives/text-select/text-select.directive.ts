import {
  ApplicationRef, ComponentFactoryResolver,
  ComponentRef,
  Directive,
  ElementRef,
  EmbeddedViewRef,
  Injector,
  NgZone,
  OnDestroy,
  OnInit
} from '@angular/core';
import { TextSelectionTooltipComponent } from './text-selection-tooltip/text-selection-tooltip.component';

// Define the structure of the event that will be emitted when text is selected.
export interface TextSelectEvent {
  text: string;
  viewportRectangle: SelectionRectangle | null;
  hostRectangle: SelectionRectangle | null;
}

// Define the structure of the selection rectangle.
interface SelectionRectangle {
  left: number;
  top: number;
  width: number;
  height: number;
}


// This directive emits an event when the user selects text within the host element.
@Directive({
  selector: '[dsTextSelectTooltip]',
})
export class TextSelectDirective implements OnInit, OnDestroy {

  hasSelection = false;
  selectedText = '';

  private componentRef: ComponentRef<any> = null;

  // Initialize the directive.
  constructor(
    private elementRef: ElementRef,
    private zone: NgZone,
    private appRef: ApplicationRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector
  ) {
  }

  // Clean up when the directive is destroyed.
  public ngOnDestroy(): void {
    this.elementRef.nativeElement.removeEventListener('mousedown', this.handleMousedown, false);
    document.removeEventListener('mouseup', this.handleMouseup, false);
  }

  // Set up event listeners when the directive is initialized.
  public ngOnInit(): void {
    this.elementRef.nativeElement.style.position = 'relative';
    this.zone.runOutsideAngular(() => {
      this.elementRef.nativeElement.addEventListener('mousedown', this.handleMousedown, false);
    });
  }

  // Get the deepest Element node in the DOM tree that contains the entire range.
  private getRangeContainer(range: Range): Node {
    let container = range.commonAncestorContainer;
    while (container.nodeType !== Node.ELEMENT_NODE) {
      container = container.parentNode;
    }
    return (container);
  }

  // Handle mousedown events inside the current element.
  private handleMousedown = (): void => {
    document.addEventListener('mouseup', this.handleMouseup, false);
  };

  // Handle mouseup events anywhere in the document.
  private handleMouseup = (): void => {
    document.removeEventListener('mouseup', this.handleMouseup, false);
    this.processSelection();
  };


  // Inspect the document's current selection and check to see if it should be
  // emitted as a TextSelectEvent within the current element.
  private processSelection(): void {
    // setting up a zero-delay timeout to wait for the selection to be cleared
    // this solves the issue of the previous selection not being cleared before the mouseup event
    // setTimeout(() => {
      const selection = document.getSelection();
      const stringSelection = selection.toString().trim();
      const previousSelection = this.selectedText;
      if (this.hasSelection) {
        this.zone.runGuarded(() => {
          this.hasSelection = false;
          this.selectedText = '';
          this.componentRef.destroy();
          this.componentRef = null;
        });
      }

      // check if there is a selection and if it is different from the previous one
      // (to handle a bug in browsers that fires the mouseup event again if clicking on the selection)
      if (!selection.rangeCount || !stringSelection || previousSelection === stringSelection) {
        return;
      }
      let range = selection.getRangeAt(0);
      let rangeContainer = this.getRangeContainer(range);
      if (this.elementRef.nativeElement.contains(rangeContainer)) {
        let viewportRectangle = range.getBoundingClientRect();
        let bodyRelativeRectangle = this.rectangleRelativeToBody(viewportRectangle, rangeContainer);
        if (stringSelection) {
          this.zone.runGuarded(() => {
            this.hasSelection = true;
            if (this.componentRef === null) {
              const componentFactory =
                this.componentFactoryResolver.resolveComponentFactory(TextSelectionTooltipComponent);
              this.componentRef = componentFactory.create(this.injector);

              this.appRef.attachView(this.componentRef.hostView);

              const domElem =
                (this.componentRef.hostView as EmbeddedViewRef<any>)
                  .rootNodes[0] as HTMLElement;

              document.body.appendChild(domElem);

              this.componentRef.instance.elementRectangleLeft = bodyRelativeRectangle.left;
              this.componentRef.instance.elementRectangleTop = bodyRelativeRectangle.top;
              this.componentRef.instance.elementRectangleWidth = bodyRelativeRectangle.width;
              this.componentRef.instance.elementRectangleHeight = bodyRelativeRectangle.height;
              this.componentRef.instance.text = stringSelection;

              this.selectedText = stringSelection;
            }
          });
        }
      }
    // });
  }

  // Convert the given viewport-relative rectangle to a body-relative rectangle.
  private rectangleRelativeToBody(
    viewportRectangle: SelectionRectangle,
    rangeContainer: Node
  ): SelectionRectangle {
    let host = document.body;
    let hostRectangle = host.getBoundingClientRect();
    let localLeft = (viewportRectangle.left - hostRectangle.left);
    let localTop = (viewportRectangle.top - hostRectangle.top);
    let node = rangeContainer;
    do {
      localLeft += (<Element>node).scrollLeft;
      localTop += (<Element>node).scrollTop;
    } while ((node !== host) && (node = node.parentNode));
    return ({
      left: localLeft,
      top: localTop,
      width: viewportRectangle.width,
      height: viewportRectangle.height
    });
  }
}
