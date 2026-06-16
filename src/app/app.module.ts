import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { CurrencyPipe } from '@angular/common';
import { LogRequestInterceptor } from './shared/interceptors/log-request-interceptor';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    CurrencyPipe
  ],
  //providers: [{ provide: HTTP_INTERCEPTORS, useClass: LogRequestInterceptor, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule { }
