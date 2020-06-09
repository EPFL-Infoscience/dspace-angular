import { CommonModule } from '@angular/common';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { DeduplicationSignaturesComponent } from './deduplication-signatures.component';

describe('DeduplicationSignaturesComponent test suite', () => {
  let fixture: ComponentFixture<DeduplicationSignaturesComponent>;
  let comp: DeduplicationSignaturesComponent;

  beforeEach(async (() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        TranslateModule.forRoot(),
      ],
      declarations: [
        DeduplicationSignaturesComponent,
        TestComponent,
      ],
      providers: [
        DeduplicationSignaturesComponent
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents().then();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeduplicationSignaturesComponent);
    comp = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
    comp = null;
    // compAsAny = null;
  });

  it('Should init component properly', () => {
    comp.elementsPerRow = 3;
    comp.ngOnInit();
    fixture.detectChanges();

    expect(comp.bootstrapColNumber).toEqual(4);
  });
});

// declare a test component
@Component({
  selector: 'ds-test-cmp',
  template: ``
})
class TestComponent {

}
