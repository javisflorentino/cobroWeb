import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, inject, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { SafeHtml } from '@angular/platform-browser';
import { PagoLineaServiceService } from 'src/app/portal-hacienda/services/pago-linea-service.service';
import { ThreeDSecureModalComponent } from '../three-dsecure-modal/three-dsecure-modal.component';
import { Poliza } from '../../interface/portal-datos-poliza.interface';

declare var PaymentSession: any;

@Component({
  selector: 'app-pasarela-evo-pay',
  templateUrl: './pasarela-evo-pay.component.html',
  styleUrls: ['./pasarela-evo-pay.component.css']
})
export class PasarelaEvoPayComponent implements OnInit {
  private sessionid: string = 'SESSION_ID_FROM_BACK';
  public lineaCaptura: string = 'REFERENCIA_123';
  public monto: string = '0.00';
  // ... dentro de tu clase ...
  authHtml: SafeHtml | null = null;
  showChallenge: boolean = false;
  private pagoLineaService = inject(PagoLineaServiceService);
  evoErrors: any = {};
  private cd = inject(ChangeDetectorRef)
  private dialog = inject(MatDialog);
  public isLoading: boolean = false;

  // Genera los años desde el actual hasta 15 años adelante
  years: number[] = Array.from({ length: 16 }, (_, i) => new Date().getFullYear() + i);
  months: string[] = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

  private fb = inject(FormBuilder);
  private renderer = inject(Renderer2)

  public myForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    cardholder_name: ['']
  })

  public datosPoliza: Poliza = {
    fechaVencimiento: '',
    numeroPoliza: '',
    lineaCaptura: '',
    total: 0,
  };

  constructor(@Inject(DOCUMENT) private document: Document
  ) {
    //this.mediaQuery();
  }
  ngOnInit(): void {
    console.log("Iniciando componente de EVO Payment");
    this.datosPoliza = JSON.parse(sessionStorage.getItem('datos_poliza')!);

    this.lineaCaptura = this.datosPoliza.lineaCaptura;
    this.monto = this.datosPoliza.total.toString();
    this.loadEvoSDK();
  }

  private loadEvoSDK() {
    const script = this.renderer.createElement('script');
    script.src = `https://evopaymentsmexico.gateway.mastercard.com/form/version/72/merchant/TEST1206211HS/session.js`;
    this.pagoLineaService.getSessionEvo({ "lineaCaptura": this.lineaCaptura, "monto": this.monto })
      .subscribe({
        next: (resp: any) => {
          if (!resp.error) {
            console.log(resp);
            this.sessionid = resp.sessionid;
            script.onload = () => this.configureEvoSession();
            this.renderer.appendChild(this.document.body, script);
          } else {
            alert("Error al obtener sesión de pago");
          }
        },
        error: (err) => alert("Error de conexión con el servidor")
      });
    //script.onload = () => this.configureEvoSession();
    //this.renderer.appendChild(this.document.body, script);
  }
  configureEvoSession() {
    setTimeout(() => {
      PaymentSession.configure({
        session: this.sessionid,
        // AGREGAR ESTA LÍNEA CRÍTICA:
        frameEmbeddingMitigation: ['localhost'],
        fields: {
          card: {
            number: "#card-number",
            securityCode: "#security-code",
            expiryMonth: "#expiry-month",
            expiryYear: "#expiry-year",
            nameOnCard: "#cardholder-name"
          }
        },
        interaction: {
          displayHtml: 'placeholder', // Esto ayuda a que EVO use los placeholders en lugar de encimar texto
          formatting: {
            cardNumber: true // Esto activa el separador automático
          }
        },
        callbacks: {
          initialized: (response: any) => console.log("Evo SDK Listo"),
          // AGREGA ESTO PARA VALIDACIÓN INMEDIATA
          onChange: (response: any) => {
            console.log("Cambio detectado en EVO:", response);
            this.cd.detectChanges(); // Forzar a Angular a ver el cambio
          },
          formSessionUpdate: (response: any) => {
            this.evoErrors = {}; // Limpiamos errores previos
            // HANDLE RESPONSE FOR UPDATE SESSION
            if (response.status) {
              if ("ok" == response.status) {
                // Si todo está bien, iniciamos la autenticación 3D
                console.log("Sesión actualizada con éxito:", response.session.id);
                this.initAuthenticate3D(response.session.id);

              } else if ("fields_in_error" == response.status) {
                this.isLoading = false;

                // Guardamos los errores que vienen de EVO
                this.evoErrors = response.errors;
                console.log("Errores detectados por EVO:", this.evoErrors);

                // Validaciones específicas de campos
                /*if (response.errors.cardNumber) {
                  alert("Número de tarjeta inválido o faltante.");
                }
                if (response.errors.expiryYear) {
                  alert("Año de expiración inválido o faltante.");
                }
                if (response.errors.expiryMonth) {
                  alert("Mes de expiración inválido o faltante.");
                }
                if (response.errors.securityCode) {
                  alert("Código de seguridad (CVV) inválido.");
                }*/


                // Forzamos a Angular a detectar el cambio si es necesario
                this.myForm.markAllAsTouched();

              } else if ("request_timeout" == response.status) {
                this.isLoading = false;
                alert("Tiempo de espera agotado: " + response.errors.message);

              } else if ("system_error" == response.status) {
                this.isLoading = false;
                alert("Error de sistema: " + response.errors.message);
              }
            } else {
              this.isLoading = false;
              alert("Fallo en la actualización de sesión: " + response);
            }
          }
        }
      });
    }, 500);
  }

  refreshEvoValidation() {
    // Verificamos si PaymentSession existe y si ya se inicializó
    console.log(PaymentSession);
    if (typeof PaymentSession !== 'undefined') {
      try {
        // Solo intentamos actualizar si el formulario tiene algún valor
        // para evitar enviar peticiones vacías que rompan el script
        PaymentSession.updateSessionFromForm('card');
      } catch (e) {
        console.warn("El SDK de EVO aún no está listo para enviar datos.");
      }
    }
  }

  syncEvoErrorsWithAngular() {
    // Mapeamos los errores de EVO a los controles de nuestro FormBuilder
    if (this.evoErrors.cardNumber) {
      this.myForm.get('numTarjeta')?.setErrors({ 'invalidCard': true });
      this.myForm.get('numTarjeta')?.markAsTouched();
    }
    if (this.evoErrors.securityCode) {
      this.myForm.get('cvv')?.setErrors({ 'invalidCvv': true });
      this.myForm.get('securityCode')?.markAsTouched();
    }
    // Repetir para mes y año...
  }

  handleEvoResponse(response: any) {
    this.evoErrors = {}; // Limpiar errores previos

    if (response.status === "fields_in_error") {
      this.isLoading = false;

      // Asignamos los errores al objeto que lee el HTML
      this.evoErrors = response.errors;

      // IMPORTANTE: Forzar a Angular a detectar que hubo un cambio
      // y que debe mostrar los mat-error
      Object.keys(this.evoErrors).forEach(field => {
        const controlName = this.mapEvoFieldToFormControl(field);
        if (controlName) {
          this.myForm.get(controlName)?.setErrors({ evoError: true });
          this.myForm.get(controlName)?.markAsTouched();
        }
      });

    } else if (response.status === "ok") {
      this.initAuthenticate3D(response.session.id);
    }
  }

  // Mapeo simple para conectar EVO con tu Reactive Form
  mapEvoFieldToFormControl(evoField: string): string | null {
    const map: { [key: string]: string } = {
      'cardNumber': 'numTarjeta',
      'securityCode': 'cvv',
      'expiryMonth': 'expiryMonth',
      'expiryYear': 'expiryYear'
    };
    return map[evoField] || null;
  }

  // Sustituye a tu función $.ajax de initAutenticate3D
  initAuthenticate3D(sessionId: string) {
    const payload = { sessionId: sessionId, lineacaptura: this.lineaCaptura, sistema: '64' };
    this.pagoLineaService.authenticate3dEvo(payload).subscribe({
      next: (resp: any) => {
        if (!resp.error && resp.mensaje === "PROCEED") {
          console.log("Autenticación 3D iniciada con éxito");
          this.authenticatePayer(sessionId);
          /*const cleanHtml = resp.redirect.replace(/\\/g, "");
          this.authHtml = this.sanitizer.bypassSecurityTrustHtml(cleanHtml);
          this.showChallenge = true;
          this.isLoading = false;*/
        } else {
          this.isLoading = false;
          alert(resp.mensaje || "Error en la autenticación 3D");
        }
      },
      error: (err) => {
        this.isLoading = false;
        alert("Error de conexión con el servidor durante autenticación 3D");
      }
    });
    /*this.http.post('api/evopayment/authenticate3d', payload).subscribe((resp: any) => {
      if (resp.mensaje === "PROCEED") {
        this.authenticatePayer();
      }
    });*/
  }

  pay() {
    //this.isLoading = true;
    //PaymentSession.updateSessionFromForm('card');

    // Validamos manualmente los campos que NO son de EVO (Email y Teléfono)
    const emailControl = this.myForm.get('email');
    const phoneControl = this.myForm.get('phone');

    if (emailControl?.invalid || phoneControl?.invalid) {
      this.myForm.markAllAsTouched();
      alert("Por favor, ingrese un correo y teléfono válidos.");
      return;
    }

    this.isLoading = true;

    // 1. Recolectamos los datos del formulario reactivo
    const rawData = this.myForm.value;

    const updateData = {
      sessionId: this.sessionid, // El que generaste previamente en Java
      lineaCaptura: this.lineaCaptura,
      monto: this.monto, // EVO suele pedir solo los últimos 2 dígitos (ej. "26")
      currency: 'MXN',
      email: rawData.email,
      phone: rawData.phone,
      sistema: '64',
      sistop: '1234'
    };

    // 2. Enviamos primero a actualizar la sesión en tu API de Java
    console.log("Enviando actualización de sesión a EVO con datos:", updateData);
    this.pagoLineaService.updatesessionEvo(updateData).subscribe({
      next: (resp: any) => {
        if (resp.error === false) {
          console.log('Sesión actualizada con éxito en EVO');
          PaymentSession.updateSessionFromForm('card');
          // 3. Una vez actualizada la sesión, disparamos la autenticación 3DS
          //this.procederAAutenticacion();
        } else {
          this.isLoading = false;
          console.log(resp.mensaje || 'Error al actualizar la sesión');
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.log('Error de conexión con el servidor de Hacienda');
      }
    });

  }

  procederAAutenticacion(sessionConTarjeta: string) {
    const authParams = {
      session_id: sessionConTarjeta, //<--- Muy importante usar el nuevo
      lineacaptura: this.lineaCaptura,
      email: this.myForm.value.email
    };

    /*this.http.post('api/evopayment/authenticatepayer', authParams).subscribe({
      next: (resp: any) => {
        if (resp.mensaje === "PROCEED" && !resp.error) {
          const cleanHtml = resp.redirect.replace(/\\/g, "");
          this.authHtml = this.sanitizer.bypassSecurityTrustHtml(cleanHtml);

          this.showChallenge = true;
          this.isLoading = false;
        } else {
          this.isLoading = false;
          //this.mostrarError(resp.mensaje);
        }
      },
      error: (err) => {
        this.isLoading = false;
        //this.mostrarError("Error en la verificación 3D Secure");
      }
    });*/
  }

  authenticatePayer(sessionId: string) {
    const params = { sessionId: sessionId, lineacaptura: this.lineaCaptura, sistema: '64', sistop: '1234', email: this.myForm.value.email };

    this.pagoLineaService.genAuthPayerEvo(params)
      .subscribe({
        next: (resp: any) => {
          if (!resp.error) {// && resp.authentication?.redirect?.html) {
            alert("Pago autenticado exitosamente");
            const dialogRef = this.dialog.open(ThreeDSecureModalComponent, {
              width: '90vw',
              maxWidth: '600px',
              height: '650px',
              data: { html: resp.redirect },
              disableClose: true // Evita que el usuario cierre el proceso de autenticación por error
            });

            dialogRef.afterClosed().subscribe(result => {
              // Aquí manejas lo que pasa después de la autenticación
              console.log('El flujo 3DS ha terminado');
            });
          } else {
            alert("Error al autenticar pago");
          }
        },
        error: (err) => alert("Error de conexión con el servidor")
      });



    /* next: (resp: any) => {
       if (resp.mensaje === "PROCEED" && !resp.error) {
         // 1. Limpiamos el string (quitamos backslashes si vienen del JSON)
         const cleanHtml = resp.redirect.replace(/\\/g, "");
         // 2. Marcamos el HTML como seguro para Angular
         this.authHtml = this.sanitizer.bypassSecurityTrustHtml(cleanHtml);
         // 3. Cambiamos la vista
         this.showChallenge = true;
         this.isLoading = false;
       } else {
         this.handleError(resp.mensaje);
       }*/
  }
}
