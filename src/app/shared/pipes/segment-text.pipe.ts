import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'segmentText'
})
export class SegmentTextPipe implements PipeTransform {

  private textSec: string = '';
  private indice: number = 0;
  transform(texto:string, args: number): string {
    if (texto.length > args + 5) {
      for(let i = 1; i<=Math.round(texto.length/args)+1; i++) {
        let val = (args*i);
        if(val > texto.length) {
          val = texto.length;
        }
        this.textSec += texto.slice(this.indice,val) + '<br>';
        this.indice = (args * i);
      }
      return this.textSec.slice(0,this.textSec.length-4);
    }
    return texto;
  }

}
