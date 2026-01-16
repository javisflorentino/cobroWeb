import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileTransferService {

  constructor() { }

  private fileSource = new BehaviorSubject<File | null>(null);
  file$ = this.fileSource.asObservable();

  setFile(file: File) {
    this.fileSource.next(file);
  }

  getFile(): File | null {
    return this.fileSource.getValue();
  }

  clear() {
    this.fileSource.next(null);
  }
}
