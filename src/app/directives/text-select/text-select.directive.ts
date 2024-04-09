import { Directive, ElementRef, EventEmitter, NgZone, OnDestroy, OnInit, Output } from '@angular/core';

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
  selector: '[dsTextSelect]',
})
export class TextSelectDirective implements OnInit, OnDestroy {

  // Event emitter for the text select event.
  @Output()
  dsTextSelect: EventEmitter<TextSelectEvent> = new EventEmitter();

  hasSelection = false;

  // Initialize the directive.
  constructor(
    private elementRef: ElementRef,
    private zone: NgZone
  ) {
  }

  // Clean up when the directive is destroyed.
  public ngOnDestroy(): void {
    this.elementRef.nativeElement.removeEventListener('mousedown', this.handleMousedown, false);
    document.removeEventListener('mouseup', this.handleMouseup, false);
  }

  // Set up event listeners when the directive is initialized.
  public ngOnInit(): void {
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
    setTimeout(() => {
      const selection = document.getSelection();
      if (this.hasSelection) {
        this.zone.runGuarded(() => {
          this.hasSelection = false;
          this.dsTextSelect.next({
            text: '',
            viewportRectangle: null,
            hostRectangle: null
          });
        });
      }
      if (!selection.rangeCount || !selection.toString()) {
        return;
      }
      let range = selection.getRangeAt(0);
      let rangeContainer = this.getRangeContainer(range);
      if (this.elementRef.nativeElement.contains(rangeContainer)) {
        let viewportRectangle = range.getBoundingClientRect();
        let localRectangle = this.viewportToHost(viewportRectangle, rangeContainer);
        const stringSelection = selection.toString();
        if (stringSelection) {
          this.zone.runGuarded(() => {
            this.hasSelection = true;
            this.dsTextSelect.emit({
              text: stringSelection,
              viewportRectangle: {
                left: viewportRectangle.left,
                top: viewportRectangle.top,
                width: viewportRectangle.width,
                height: viewportRectangle.height
              },
              hostRectangle: {
                left: localRectangle.left,
                top: localRectangle.top,
                width: localRectangle.width,
                height: localRectangle.height
              }
            });
          });
        }
      }
    });
  }

  // Convert the given viewport-relative rectangle to a host-relative rectangle.
  private viewportToHost(
    viewportRectangle: SelectionRectangle,
    rangeContainer: Node
  ): SelectionRectangle {
    let host = this.elementRef.nativeElement;
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
