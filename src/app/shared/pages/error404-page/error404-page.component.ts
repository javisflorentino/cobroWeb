import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-error404-page',
  templateUrl: './error404-page.component.html',
  styleUrls: ['./error404-page.component.css']
})
export class Error404PageComponent implements OnInit, OnDestroy {

  constructor(private router: Router, private activatedRoute: ActivatedRoute,){}

  ngOnDestroy(): void {
    this.activatedRoute.params.subscribe().unsubscribe();
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(({ id }) => {
      console.log(id)
      this.router.navigate(['/pagos/tabla-conceptos', 1]);
    });
  }

}
