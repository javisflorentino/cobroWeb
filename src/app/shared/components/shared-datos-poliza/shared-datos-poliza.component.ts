import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Poliza } from 'src/app/portal-hacienda/interface/portal-datos-poliza.interface';
import { TopLevel } from '../../interfaces/calculo-conceptos';
import { Subject, takeUntil } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-shared-datos-poliza',
  templateUrl: './shared-datos-poliza.component.html',
  styles: [
  ]
})
export class SharedDatosPolizaComponent implements OnInit, OnDestroy {

  public links = ['Pago en Línea','Depósito Bancario','Otros Métodos de Pago'];
  public links_icons = ['credit_card','account_balance','credit_card'];
  public position: boolean[] = [true,false,false];

  private url = 'https://app.hacienda.morelos.gob.mx/recibo/poliza/imprimirPoliza?lineaCaptura=';
  public url_pagolinea: string =  'https://app.hacienda.morelos.gob.mx/pagoenlinea/reqByGetOnlyEvo';//'http://localhost:8080/pagoenlinea/reqByGetOnlyEvo';
  public url_pagolinea_only: string =  'https://app.hacienda.morelos.gob.mx/pagoenlinea/reqByGetIndex';//'http://localhost:8080/pagoenlinea/reqByGetIndex';


  @ViewChild('formPL', { read: ElementRef })
  private paytmForm!: ElementRef;


  public datosPoliza:Poliza = {
    fechaVencimiento: '',
    numeroPoliza:     '',
    lineaCaptura:     '',
    total:            0,
  };

  private contribuyenteArr = {} as TopLevel;

  public myForm = this.fb.group({
    numeroPoliza: [''],
    lineaCaptura: [''],
    monto: [''],
    nombrePago: [''],
    lineaDetallePago: [''],
    pago2015: ['2015'],
    banco: ['Bancomer'],
    extra: ['ECONOMIA-'],
    fecha: ['']
  })

  //Controla la visualización del Spinner
    public isLoading: boolean = false;

    private destroyed = new Subject<void>();
    /* CONTROLAR LA RESOLUCION DE LA PANTALLA */
    public sizeDisplay!: string;
    /* CONTROLAR EL TIPO DE RESOLUCIONES */
    private displayNameMap = new Map([
      [Breakpoints.XSmall, 'XSmall'],
      [Breakpoints.Small, 'Small'],
      [Breakpoints.Medium, 'Medium'],
      [Breakpoints.Large, 'Large'],
      [Breakpoints.XLarge, 'XLarge'],
    ]);
    /* INYECCION DE LA DEPENDECIA QUE ESCUCHA  LA RESOLUCION ACTUAL */
    private breakpointObserver = inject(BreakpointObserver);

  constructor( private fb: FormBuilder ) {
    this.mediaQuery();
  }


  ngOnInit(): void {
    this.contribuyenteArr = JSON.parse(localStorage.getItem('contribuyente')!);
 
    const contribuyenteStr = localStorage.getItem('contribuyente');
    const contribuyenteOnlyStr = localStorage.getItem('contribuyente_only');
    this.contribuyenteArr = contribuyenteStr ? JSON.parse(contribuyenteStr) : null;
    if (!this.contribuyenteArr?.data?.contribuyente) {
      this.contribuyenteArr = contribuyenteOnlyStr ? JSON.parse(contribuyenteOnlyStr) : null;
    }
    const contribuyente = this.contribuyenteArr?.data?.contribuyente;
  const nombrePago = contribuyente
    ? `${contribuyente.nombre} ${contribuyente.primerApellido} ${contribuyente.segundoApellido}`
    : '';

  const lineaDetalle = this.contribuyenteArr?.data?.lineaDetalle || '';
    this.datosPoliza = JSON.parse(localStorage.getItem('datos_poliza')!);
    console.log(this.datosPoliza)
    this.myForm.reset({
      numeroPoliza:this.datosPoliza.numeroPoliza,
      lineaCaptura:this.datosPoliza.lineaCaptura,
      monto: this.datosPoliza.total.toString(),
      nombrePago: nombrePago,
      lineaDetallePago: lineaDetalle,
      pago2015: '2015',
      banco: 'Bancomer',
      extra: 'ECONOMIA-',
      fecha: String(new Date().getDate()+4).toString()
    });

    this.url_pagolinea += '?lineaCaptura='+this.datosPoliza.lineaCaptura+'&monto='+this.datosPoliza.total.toString()+'&sistema=0';
    this.url_pagolinea_only += '?lineaCaptura='+this.datosPoliza.lineaCaptura+'&monto='+this.datosPoliza.total.toString();

  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.unsubscribe();
  }


  activeLink = this.links[0];


  activeLinkFunct(link:number):void {
    console.log('entra = ' + link)
    this.activeLink = this.links[link];
    //this.position[link] = true;
    //this.position[(link>0)?0:1] = false;
    this.position.forEach((val,ind) =>{
      if(ind!==link) {
        this.position[ind]=false
      } else {
        this.position[ind]=true
      }
    })
  }

  getPoliza() {
    window.open(`${this.url}${this.datosPoliza.lineaCaptura}`);
  }

  portalPagoLinea() {
    this.paytmForm.nativeElement.submit();
  }

  public mediaQuery() {

      this.breakpointObserver
        .observe([
          Breakpoints.XSmall,
          Breakpoints.Small,
          Breakpoints.Medium,
          Breakpoints.Large,
          Breakpoints.XLarge,
        ])
        .pipe(takeUntil(this.destroyed))
        .subscribe(result => {
          for (const query of Object.keys(result.breakpoints)) {
            if (result.breakpoints[query]) {
              this.sizeDisplay = this.displayNameMap.get(query) ?? 'Unknown';
            }
          }
        });


    }

}
