import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfViewerComponentComponent } from './pdf-viewer-component.component';

describe('PdfViewerComponentComponent', () => {
  let component: PdfViewerComponentComponent;
  let fixture: ComponentFixture<PdfViewerComponentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PdfViewerComponentComponent]
    });
    fixture = TestBed.createComponent(PdfViewerComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
