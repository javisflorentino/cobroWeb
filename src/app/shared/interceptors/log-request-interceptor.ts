import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable()
export class LogRequestInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const horaExacta = new Date().toISOString();

    console.log(`[📡 Petición al Back] ${horaExacta} | ${request.method} a ${request.url}`);

    return next.handle(request);
  }
}
