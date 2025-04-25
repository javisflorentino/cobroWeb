import { Component, EventEmitter, Output, OnDestroy, Input, OnInit, inject } from '@angular/core';
import { PortalMenu } from '../../interface/portal-menu.interface';

import ListaDependencias from '../../../../../data/arreglos/portal_pago_menu.json'
import { MenuService } from 'src/app/shared/services/menu.service';
import { MenuConceptos } from 'src/app/shared/interfaces/shared-conceptos.interface';
import { LayoutPortalPagosComponent } from '../../pages/layout-portal-pagos.component';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { ModalPagoLineaComponent } from 'src/app/shared/components/modal-pago-linea/modal-pago-linea.component';
import { MatDialog } from '@angular/material/dialog';
import { ModalComprobantePagoComponent } from 'src/app/shared/components/modal-comprobante-pago/modal-comprobante-pago.component';
import { ModalHistoricoPagosComponent } from 'src/app/shared/components/modal-historico-pagos/modal-historico-pagos.component';
import { ModalFacturacionComponent } from 'src/app/shared/components/modal-facturacion/modal-facturacion.component';
import Swal from 'sweetalert2';
import { ModalValidarReciboOficioComponent } from 'src/app/shared/components/modal-validar-recibo-oficio/modal-validar-recibo-oficio.component';


@Component({
  selector: 'portalhacienda-cards-dependencias',
  templateUrl: './cards-dependencias.component.html',
  animations: [
    trigger('buttonAnimation', [
      transition('* => *', [
        query('.menu-button', style({ opacity: 0, transform: 'scale(0.5) translateY(50px)' }), { optional: true }),
        query('.menu-button', stagger('100ms', [
          animate('500ms ease-out', style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
        ]), { optional: true })
      ])
    ])
  ],
  styles: [`
    .menu-container {
      display: flex;
      justify-content: center;
      padding: 20px;
      width: 100%;
    }

    .menu-buttons-row {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 20px;
    }

    .menu-button {
      width: 60px;
      height: 60px;
      background-color: #C49A6D; /* Color café claro/beige como en la imagen */
      box-shadow: none;
      border-radius: 50%;
    }

    .menu-button:hover {
      background-color:rgb(206, 173, 144); /* Un poco más oscuro al hacer hover */
      transform: translateY(-3px);
      transition: all 0.3s ease;
    }

    /* Estilo para los iconos dentro de los botones */
    .custom-icon {
      color: #FFFFFF; /* Color café más oscuro/rojizo para los iconos */
      font-size: 28px;
      height: 28px;
      width: 28px;
    }

    /* Para imágenes personalizadas si las usas */
    .custom-icon-img {
      width: 28px;
      height: 28px;
    }
  `]
})
export class CardsDependenciasComponent implements OnInit, OnDestroy {

  @Input()
  public viewResolution!: string;

  /* NOTA: VARIABLE USADA PAR EMITIR VALORES AL PADRE (DATOS DE LA DEP. SELECCIONADA) */
  @Output()
  public valCardDep = new EventEmitter<MenuConceptos[]>();//PortalMenu[]>();

  //public cardsArr: PortalMenu[] = ListaDependencias;

  private generalService = inject(MenuService);

  /*NOTA: LISTA DE CONCEPTOS DE LA DEPENDENCIA SELECCIONADA */
  public cardsArr: MenuConceptos[] = [];

  /* NOTA: CONTROLA LA VISUALIZACION DEL SPINNER */
  public isLoading: boolean = true;

  private parentLayout = inject(LayoutPortalPagosComponent);

  private activRoute = inject(ActivatedRoute);
  private activRouteSubs?: Subscription;
  show = false;

  menuButtons = [
    { icon: 'receipt_long', label: 'Recibo de Pago' },
    { icon: 'request_quote', label: 'Facturación' },
    { icon: 'history', label: 'Histórico' },
    { icon: 'payments', label: 'Pagar Póliza' },
    { icon: 'article', label: 'Oficio de Habilitación' }

  ];
  constructor(private dialog: MatDialog) { }


  ngOnInit(): void {
    // Activar la animación después de un pequeño retraso
    setTimeout(() => {
      this.show = true;
    }, 300);
    this.activRouteSubs = this.activRoute.params.subscribe(({ flag }) => {
      if (!flag) {
        this.parentLayout.redirectHome(true);
      }
      this.generalService.requestConceptos(0)
        .subscribe({
          next: (conceptos) => {
            const result = conceptos.filter(resp => resp.rol == 0);
            if (result.length > 0) {
              this.isLoading = false;
              this.cardsArr = result;
              return;
            }

            this.cardsArr = [];
            this.isLoading = false;
            return;
          },
          error: (message) => {
            this.isLoading = false;
            Swal.fire({icon: "error", title: `Error !!`, text: `${message}`, allowOutsideClick:false});
          },
        }

        /*conceptos => {
          const result = conceptos.filter(resp => resp.rol == 0);
          if (result.length > 0) {
            this.cardsArr = result;
            return;
          }

          this.cardsArr = [];
          this.isLoading = false;
          return;

        }*/);
    });


  }

  ngOnDestroy(): void {
    console.log('DESTROY DEPENDENCIAS-CARDS');
    this.activRouteSubs?.unsubscribe();
  }
  /* NOTA: EMITE EL VALOR DE LA DEPENDECIA SELECCIONADA A LAYOUT */
  emitValCard(id: number): void {
    //this.valCardDep.emit(this.cardsArr.filter(({pk}) => pk===id))
    this.parentLayout.reciveValCard(this.cardsArr.filter(({ pk }) => pk === id));
  }
  openDialog(button: any): void {
    // Solo abrimos el diálogo si es el botón de "Pagar Póliza"
    if (button.label === 'Pagar Póliza') {
      const dialogRef = this.dialog.open(ModalPagoLineaComponent, {
        width: '350px',
        disableClose: false,
        
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log('Datos del formulario:', result);
          // Aquí puedes manejar los datos recibidos del diálogo
        }
      });
    }
    if (button.label === 'Recibo de Pago') {
      const dialogRef = this.dialog.open(ModalComprobantePagoComponent, {
        width: '350px',
        disableClose: false
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log('Datos del formulario:', result);
          // Aquí puedes manejar los datos recibidos del diálogo
        }
      });
    }
    if (button.label === 'Histórico') {
      const dialogRef = this.dialog.open(ModalHistoricoPagosComponent, {
        width: '350px',
        disableClose: false
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log('Datos del formulario:', result);
          // Aquí puedes manejar los datos recibidos del diálogo
        }
      });
    }
    if (button.label === 'Facturación') {
      const dialogRef = this.dialog.open(ModalFacturacionComponent, {
        width: '550px',
        disableClose: false
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log('Datos del formulario:', result);
          // Aquí puedes manejar los datos recibidos del diálogo
        }
      });
    }
    if (button.label === 'Oficio de Habilitación') {
      const dialogRef = this.dialog.open(ModalValidarReciboOficioComponent, {
        width: '350px',
        disableClose: false
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log('Datos del formulario:', result);
          // Aquí puedes manejar los datos recibidos del diálogo
        }
      });
    }
  }
}
