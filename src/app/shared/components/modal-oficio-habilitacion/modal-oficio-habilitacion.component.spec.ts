import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalOficioHabilitacionComponent } from './modal-oficio-habilitacion.component';

describe('ModalOficioHabilitacionComponent', () => {
  let component: ModalOficioHabilitacionComponent;
  let fixture: ComponentFixture<ModalOficioHabilitacionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalOficioHabilitacionComponent]
    });
    fixture = TestBed.createComponent(ModalOficioHabilitacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
