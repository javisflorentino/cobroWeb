import { AfterContentInit, AfterViewInit, Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Poliza } from 'src/app/portal-hacienda/interface/portal-datos-poliza.interface';
import { TopLevel } from '../../interfaces/calculo-conceptos';
import { Subject, takeUntil } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DatosPago } from '../../interfaces/datos-pago';
import { EstadoCuenta, EstadoCuentaRequest, EstadoCuentaResponse } from 'src/app/portal-hacienda/services/predial-municipal.service';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthSiigemService } from '../../services/auth-siigem.service';

import { environments } from 'src/environments/environments';

import 'altcha'; // Esto registra el elemento <altcha-widget>
import Swal from 'sweetalert2';
import { GeneralesService } from 'src/app/portal-hacienda/services/generales.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-shared-datos-poliza',
  templateUrl: './shared-datos-poliza.component.html',
  styles: [
  ],
})
export class SharedDatosPolizaComponent implements OnInit, OnDestroy, AfterViewInit {

  isVerified = false;
  payload: string | null = null;

  public environment = environments.URL_PAGO_EN_LINEA + '/';

  public soloMostrarPost: boolean = false;
  public links = ['Pago en Línea', 'Depósito Bancario', 'Otros Métodos de Pago', 'Banorte'];
  public links_icons = ['credit_card', 'account_balance', 'credit_card', 'credit_card'];
  public position: boolean[] = [true, false, false, false];
  public mostrarEmbedBanorte: boolean = true;

  //QA
  //private url = 'https://qa.hacienda.morelos.gob.mx/recibo/poliza/imprimirPoliza?lineaCaptura=';
  //public url_pagolinea: string =  'https://app.hacienda.morelos.gob.mx/pagoLineaQA/reqByGetOnlyEvo';//'http://localhost:8080/pagoenlinea/reqByGetOnlyEvo';
  //public url_pagolinea_only: string =  'https://app.hacienda.morelos.gob.mx/pagoLineaQA/reqByGetIndex';//'http://localhost:8080/pagoenlinea/reqByGetIndex';
  //public url_pagolineaBanorte: string =  'https://app.hacienda.morelos.gob.mx/pagoLineaQA/reqByPostBanorte';//'http://localhost:8080/pagoenlinea/reqByGetOnlyEvo';

  private url = environments.URL_PAGO_EN_LINEA_RECIBO + '/poliza/imprimirPoliza?lineaCaptura=';
  public url_pagolinea: string = `/${environments.pagoLineaEnvironment}/reqByGetOnlyEvo`;//'http://localhost:8080/pagoenlinea/reqByGetOnlyEvo';
  public url_pagolinea_only: string = `/${environments.pagoLineaEnvironment}/reqByGetIndex`;//'http://localhost:8080/pagoenlinea/reqByGetIndex';
  //public url_pagolinea: string = environments.URL_PAGO_EN_LINEA + '/reqByGetIndex';
  //public url_pagolinea_only: string = environments.URL_PAGO_EN_LINEA + '/reqByGetOnlyEvo';//'http://localhost:8080/pagoenlinea/reqByGetIndex';
  public url_pagolineaBanorte: string = `/${environments.pagoLineaEnvironment}/reqByPostBanorte`;//'http://localhost:8080/pagoenlinea/reqByGetOnlyEvo';


  authSiigemService = inject(AuthSiigemService);
  @ViewChild('miBoton') miBoton!: ElementRef<HTMLButtonElement>;

  @ViewChild('formPL', { read: ElementRef })
  private paytmForm!: ElementRef;


  public datosPoliza: Poliza = {
    fechaVencimiento: '',
    numeroPoliza: '',
    lineaCaptura: '',
    total: 0,
  };
  public estadoCuenta: EstadoCuenta | undefined;

  private contribuyenteArr = {} as TopLevel;

  public myForm = this.fb.group({
    poliza: [''],
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
  private generalService = inject(GeneralesService);
  private router = inject(Router);

  constructor(private fb: FormBuilder,
    private http: HttpClient, private sanitizer: DomSanitizer
  ) {
    this.mediaQuery();
  }
  ngAfterViewInit(): void {


    Swal.fire({
      title: 'Verificación de Seguridad',
      html: `
        <div id="captcha-container" style="display: flex; justify-content: center; margin-top: 15px;">
          <altcha-widget
            challengeurl="/${environments.pagoLineaEnvironment}/${environments.pasarelaCaptchaChallenge}"
            hidefooter
            strings='{
              "label": "Verifica que eres humano",
              "placeholder": "Cargando verificación...",
              "error": "La verificación falló. Reintente.",
              "expired": "La sesión expiró. Reintente.",
              "verified": "Verificación exitosa",
              "verifying": "Verificando..."
            }'>
          </altcha-widget>
        </div>
      `,
      showConfirmButton: false, // Ocultamos el botón hasta que verifique
      allowOutsideClick: false,
      didOpen: () => {
        const widget = document.querySelector('altcha-widget');
        // Escuchamos el evento nativo del Web Component
        widget?.addEventListener('statechange', (event: any) => {
          const { state, payload } = event.detail;

          if (state === 'verified') {
            console.log('Captcha verificado con payload:', payload);
            this.generalService.validateCaptcha(payload)
              .subscribe({
                next: (response) => {
                  console.log('Respuesta de validación de captcha:', response);
                  if (response?.success) {
                    this.isVerified = true;
                    this.payload = payload;
                    // Cerramos el modal automáticamente tras el éxito
                    Swal.fire({
                      icon: 'success',
                      title: 'Verificado',
                      timer: 1500,
                      showConfirmButton: false
                    });
                    setTimeout(() => {
                      this.miBoton.nativeElement.click();
                    });
                  } else {
                    Swal.fire({
                      icon: 'error',
                      title: 'Error',
                      text: 'Captcha no válido'
                    }).then((result) => {
                      /* ESTA ES LA PARTE CLAVE */
                      if (result.isConfirmed) {
                        this.router.navigate(['pagos/dependencias']);
                        return;
                      }
                    });
                  }
                },
                error: (err) => {
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error validando captcha'
                  }).then((result) => {
                    /* ESTA ES LA PARTE CLAVE */
                    if (result.isConfirmed) {
                      this.router.navigate(['pagos/dependencias']);
                      return;
                    }
                  });
                },
                complete: () => { }

              });
          } else if (state === 'expired') {
            Swal.fire({
              icon: 'warning',
              title: 'Expirado',
              text: 'El captcha ha expirado. Por favor, inténtalo de nuevo.'
            }).then((result) => {
              /* ESTA ES LA PARTE CLAVE */
              if (result.isConfirmed) {
                this.router.navigate(['pagos/dependencias']);
                return;
              }
            });
          }
        });
      }
    });
  }


  ngOnInit(): void {
    this.contribuyenteArr = JSON.parse(sessionStorage.getItem('contribuyente')!);

    const contribuyenteStr = sessionStorage.getItem('contribuyente');
    const contribuyenteOnlyStr = sessionStorage.getItem('contribuyente_only');
    this.contribuyenteArr = contribuyenteStr ? JSON.parse(contribuyenteStr) : null;
    if (!this.contribuyenteArr?.data?.contribuyente) {
      this.contribuyenteArr = contribuyenteOnlyStr ? JSON.parse(contribuyenteOnlyStr) : null;
    }
    const contribuyente = this.contribuyenteArr?.data?.contribuyente;
    const nombrePago = contribuyente
      ? `${contribuyente.nombre} ${contribuyente.primerApellido} ${contribuyente.segundoApellido}`
      : '';

    const lineaDetalle = this.contribuyenteArr?.data?.lineaDetalle || '';
    this.datosPoliza = JSON.parse(sessionStorage.getItem('datos_poliza')!);
    this.estadoCuenta = JSON.parse(sessionStorage.getItem('datosPago')!);



    // Si viene estado de cuenta → solo usar flujo POST personalizado
    if (this.estadoCuenta) {
      this.mostrarEmbedBanorte = true;
      this.position = [false, false, false, true];
      this.links = ['Pago en Línea'];  // Solo Banorte
      this.links_icons = ['credit_card'];  // Solo un icono
      //this.enviarDatosCliente(); // llamada al método que ya tienes
      //this.enviarDatosClientePorPost();

    } else if (this.datosPoliza) {
      this.mostrarEmbedBanorte = false;
      this.position = [true, false, false, false];
      this.links = ['Pago en Línea', 'Depósito Bancario', 'Otros Métodos de Pago'];  // Sin Banorte
      this.links_icons = ['credit_card', 'account_balance', 'credit_card'];  // Sin el último icono
      // Llenar formulario
      this.myForm.reset({
        poliza: this.datosPoliza.numeroPoliza,
        lineaCaptura: this.datosPoliza.lineaCaptura,
        monto: this.datosPoliza.total.toString(),
        nombrePago: nombrePago,
        lineaDetallePago: lineaDetalle,
        pago2015: '2015',
        banco: 'Bancomer',
        extra: 'ECONOMIA-',
        fecha: String(new Date().getDate() + 4)
      });

      // Generar URLs de pago por GET
      this.url_pagolinea += `?lineaCaptura=${this.datosPoliza.lineaCaptura}&monto=${this.datosPoliza.total.toString()}&sistema=0`;
      this.url_pagolinea_only += `?lineaCaptura=${this.datosPoliza.lineaCaptura}&monto=${this.datosPoliza.total.toString()}`;

      //this.url_pagolinea += `?lineaCaptura=${this.datosPoliza.lineaCaptura}&monto=${this.datosPoliza.total.toString()}`;//`?lineaCaptura=${this.datosPoliza.lineaCaptura}&monto=${this.datosPoliza.total.toString()}&sistema=0`;
      //this.url_pagolinea_only += `?lineaCaptura=${this.datosPoliza.lineaCaptura}&monto=${this.datosPoliza.total.toString()}&sistema=0`;//`?lineaCaptura=${this.datosPoliza.lineaCaptura}&monto=${this.datosPoliza.total.toString()}`;
    }
  }
  enviarDatosCliente(): void {
    var datos = JSON.parse(sessionStorage.getItem('datosPago')!);
    this.url_pagolineaBanorte =
      environments.URL_PAGO_EN_LINEA + '/reqByGetOnlyBanorte' +
      '?referencia=' + datos.referencia +
      '&referencia2=' + datos.referencia2 +
      '&sistema=' + 106 +
      '&banco=' + "86" +
      '&importe=' + datos.importeTotal +
      '&pkPago=' + datos.pkPago +
      '&clave=' + datos.clave +
      '&pkMunicipio=' + datos.pkMunicipio;


    const requestData: DatosPago = {
      referencia: datos.referencia,
      referencia2: datos.referencia2,
      sistema: 106,
      banco: "86",
      importeTotal: datos.importeTotal,
      pkPago: datos.pkPago,
      clave: datos.clave,
      pkMunicipio: datos.pkMunicipio,
    };

  }
  enviarDatosClientePorPost(): void {
    const datos = JSON.parse(sessionStorage.getItem('datosPago')!);

    // Crear formulario dinámicamente
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = this.url_pagolineaBanorte;
    form.target = 'pagoFrame'; // Nombre del iframe

    // Agregar campos ocultos
    const campos: any = {
      referencia: datos.referencia,
      importeTotal: datos.importeTotal,
      token: this.authSiigemService.getToken()
    };

    Object.keys(campos).forEach(key => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = campos[key];
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }
  ngOnDestroy(): void {
    sessionStorage.removeItem('datos_poliza');
    sessionStorage.removeItem('datosPago');

    this.destroyed.next();
    this.destroyed.unsubscribe();
  }


  activeLink = this.links[0];


  activeLinkFunct(link: number): void {
    console.log('entra = ' + link)
    this.activeLink = this.links[link];
    //this.position[link] = true;
    //this.position[(link>0)?0:1] = false;
    this.position.forEach((val, ind) => {
      if (ind !== link) {
        this.position[ind] = false
      } else {
        this.position[ind] = true
      }
    })
    // Ejecutar POST solo si entra al tab Banorte
    /*if (link === 3) {
      this.enviarDatosCliente();
    }*/
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

  // Se ejecuta cuando el usuario resuelve el reto
  onStateChange(event: any) {
    console.log('Estado del captcha:', event.detail);
    const { state, payload } = event.detail;
    if (state === 'verified') {
      this.isVerified = true;
      this.payload = payload; // Este string Base64 contiene la solución
    }
  }

}
