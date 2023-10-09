import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Messages } from '../interface/portal-message.interface';

@Injectable({
  providedIn: 'root'
})
export class SmytService {

  private urlMessage = 'http://localhost:3001/messages';

  constructor( private http: HttpClient ) { }

  getMessages(): Observable<Messages[]> {
    return this.http.get<Messages[]>(this.urlMessage);
  }
  getMessages_vehicle(): Observable<Messages[]> {
    return this.http.get<Messages[]>(`${this.urlMessage}_vehicle`);
  }
}
