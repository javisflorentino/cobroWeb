import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { AfterContentInit, Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import ListaPasarelaPagos from '../../../../../data/arreglos/portal_pasarela_pagos.json';

@Component({
  selector: 'app-cards-pasarela-pagos',
  templateUrl: './cards-pasarela-pagos.component.html',
  styleUrls: ['./cards-pasarela-pagos.component.css'],
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
})
export class CardsPasarelaPagosComponent implements OnInit, OnDestroy, AfterContentInit {

  public cardsArr: any[] = ListaPasarelaPagos;

  private router = inject(Router);

  /* NOTA: CONTROLA LA VISUALIZACION DEL SPINNER */
  public isLoading: boolean = true;

  private activRoute = inject(ActivatedRoute);
  private activRouteSubs?: Subscription;
  show = false;


  constructor() { }

  ngAfterContentInit(): void {
    this.isLoading = false;
  }

  ngOnInit(): void {}
  ngOnDestroy(): void {}

  emitValCard(link: string): void {
    console.log(link);
    this.router.navigate([link]);
    return;
    //this.router.navigate(['pagos/pasarela-evo-pay'], { relativeTo: this.activRoute });
  }


}
