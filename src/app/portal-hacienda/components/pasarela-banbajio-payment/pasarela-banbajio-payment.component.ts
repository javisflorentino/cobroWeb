import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AfterViewInit, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription, switchMap, takeUntil, takeWhile, timer } from 'rxjs';
import { PagoLineaServiceService } from '../../services/pago-linea-service.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Poliza } from '../../interface/portal-datos-poliza.interface';

@Component({
  selector: 'app-pasarela-banbajio-payment',
  templateUrl: './pasarela-banbajio-payment.component.html',
  styleUrls: ['./pasarela-banbajio-payment.component.css']
})
export class PasarelaBanbajioPaymentComponent implements OnInit, OnDestroy, AfterViewInit {

  //Controla la visualización del Spinner
  public isLoading: boolean = false;

  public url_pagolinea: string = "";
  public hayError: boolean = true;

  private pagoLineaService = inject(PagoLineaServiceService);
  public urlPasarelaSafe!: SafeResourceUrl;
  private pollingSub!: Subscription;

  private sanitizer = inject(DomSanitizer);

  public estadoPago: string = 'PENDING';

  private token_auth_banbajio: string = '';

  // Límite de tiempo: 1 minuto 30 segundos (90,000 ms)
  private readonly TIEMPO_MAXIMO_MS = 90000;

  public datosPoliza: Poliza = {
    fechaVencimiento: '',
    numeroPoliza: '',
    lineaCaptura: '',
    total: 0,
    token: ''
  };

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

  private breakpointObserver = inject(BreakpointObserver);

  constructor() {
    this.mediaQuery();
  }

  ngOnInit() {

    this.datosPoliza = JSON.parse(sessionStorage.getItem('datos_poliza')!);

    this.pagoLineaService.getTokenAuth().subscribe({
      next: (resp) => {
        if (resp.success) {
          console.log('Token Banbajio:', resp);
          this.pagoLineaService.getSessionBanbajio({linea_captura: this.datosPoliza.lineaCaptura,monto: this.datosPoliza.total,sistema:"64"},resp.token).subscribe({
            next: (sessionResp) => {
              console.log('Session Banbajio:', sessionResp);
              this.url_pagolinea = sessionResp.data.url;
              this.urlPasarelaSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.url_pagolinea);
              this.hayError = false;
              this.datosPoliza.token = sessionResp.token; // Guardamos el token para futuras consultas
              // Iniciamos el ciclo de preguntas al Backend en Java
              this.iniciarPolling();
            },
            error: (err) => {
              console.error('Error al iniciar sesión en Banbajio:', err);
              this.hayError = true;
            }
          });
        } else {
          console.error('Error al obtener el token de Banbajio:', resp);
          this.hayError = true;
        }
      },
      error: (err) => {
        console.error('Error al obtener el token de Banbajio:', err);
        this.hayError = true;
      }
    });
  }

  ngOnDestroy(): void {
    sessionStorage.removeItem('datos_poliza');
    sessionStorage.removeItem('datosPago');

    this.destroyed.next();
    this.destroyed.unsubscribe();

    // Evita fugas de memoria si el usuario abandona la vista antes de terminar
    if (this.pollingSub) this.detenerPolling("");
  }

  ngAfterViewInit(): void {
    throw new Error('Method not implemented.');
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

  iniciarPolling() {
    const tiempoInicio = Date.now(); // Guardamos la hora de inicio
    this.pollingSub = timer(0, 20000) // Pregunta inmediatamente, y luego cada 20000 - 20 segundos.
      .pipe(
        // SwitchMap cancela la petición anterior si no ha terminado y lanza la nueva
        switchMap(() => this.pagoLineaService.verificarStatus(this.datosPoliza.lineaCaptura,this.datosPoliza.token!)),
        // Se mantiene vivo MIENTRAS el estado sea PENDING
        // El parámetro 'true' incluye el valor que rompe la condición (APPROVED/REJECTED) en el subscribe
        // Y ADEMÁS el tiempo transcurrido sea menor al máximo permitido
        takeWhile((res) => {
          const tiempoTranscurrido = Date.now() - tiempoInicio;
          const dentroDelTiempo = tiempoTranscurrido < this.TIEMPO_MAXIMO_MS;

          if (!dentroDelTiempo && res.data.status === 'PENDING') {
            // Si se acabó el tiempo y seguía procesando, cambiamos el estado local para la vista
            this.estadoPago = 'TIMEOUT';
          }
          // REFRESH AUTOMÁTICO: Pisamos el token viejo guardando el nuevo devuelto en el body
          if (res.token) {
            this.datosPoliza.token = res.token;
            console.log('Token actualizado en Angular para el siguiente ciclo:', res.token.substring(0, 15) + '...');
          }
          // Retornamos true para mantener el flujo, o false para romperlo automáticamente
          return res.data.status === 'PENDING' && dentroDelTiempo;
        }, true) // El parámetro 'true' asegura que el último valor (el que rompe la condición) pase al subscribe
      )
      .subscribe({
        next: (res) => {
          // Si el flujo terminó por tiempo, aquí ya se habrá actualizado a 'TIMEOUT'
          if (this.estadoPago === 'TIMEOUT') {
            this.detenerPolling('SE EXCEDIO EL TIEMPO DE ESPERA DE 1:30 MINUTOS.');
            return;
          }

          this.estadoPago = res.data.status;

          if (res.data.status === 'APPROVED') {
            this.detenerPolling ("PAGO APROBADO");
            this.procesarExito();
          } else if (res.data.status === 'REJECTED') {
            this.detenerPolling("PAGO RECHAZADO");
            this.procesarFallo();
          }
        },
        error: (err) => console.error('Error conectando al servidor Java:', err)
      });
  }

  procesarExito() {
    console.log('¡Pago aprobado!');
    // Aquí ocultas el iframe de tu HTML o rediriges usando el Router de Angular
  }

  procesarFallo() {
    console.log('Pago rechazado por el banco.');
  }

  detenerPolling(mensaje: string) {
    console.log(mensaje);
    if (this.pollingSub) this.pollingSub.unsubscribe();
  }

}
