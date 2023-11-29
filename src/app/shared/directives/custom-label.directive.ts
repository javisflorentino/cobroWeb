import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

@Directive({
  selector: '[customLabel]'
})
export class CustomLabelDirective implements OnInit {

  private htmlElement?: ElementRef<HTMLElement>;
  private _color: string = 'red';
  private _errors?: ValidationErrors | null;

  @Input() set errors(value: ValidationErrors | null | undefined) {
    this._errors = value;
    this.setErrorMessage();
  }

  constructor( private el: ElementRef<HTMLElement> ) {
    this.htmlElement = el;
  }

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  setErrorMessage(): void {
    if ( !this.htmlElement ) return;

    if ( !this._errors ) {
      this.htmlElement.nativeElement.innerText = '';//'No hay errores';
      return;
    }

    const errors = Object.keys(this._errors);
    if(errors.includes('required')) {
      this.htmlElement.nativeElement.innerHTML = 'Este campo es requerido';
      return;
    }
    if(errors.includes('minlength')) {
      const msg = '6 / ' + (this._errors['minlength']['requiredLength'] - this._errors['minlength']['actualLength']);
      this.htmlElement.nativeElement.innerHTML = msg;
      return;
    }
    if(errors.includes('email')) {
      this.htmlElement.nativeElement.innerHTML = 'El formato no corresponde a un Email válido';
      return;
    }
  }

}
