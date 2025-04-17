import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalHistoricoPagosComponent } from './modal-historico-pagos.component';

describe('ModalHistoricoPagosComponent', () => {
  let component: ModalHistoricoPagosComponent;
  let fixture: ComponentFixture<ModalHistoricoPagosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalHistoricoPagosComponent]
    });
    fixture = TestBed.createComponent(ModalHistoricoPagosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
