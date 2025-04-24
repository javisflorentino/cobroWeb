import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalValidarReciboOficioComponent } from './modal-validar-recibo-oficio.component';

describe('ModalValidarReciboOficioComponent', () => {
  let component: ModalValidarReciboOficioComponent;
  let fixture: ComponentFixture<ModalValidarReciboOficioComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalValidarReciboOficioComponent]
    });
    fixture = TestBed.createComponent(ModalValidarReciboOficioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
