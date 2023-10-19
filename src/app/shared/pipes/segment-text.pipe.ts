import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'segmentText'
})
export class SegmentTextPipe implements PipeTransform {

  private textSec: string = '';
  private indice: number = 0;
  transform(texto:string): string {
    console.log(texto)
    if (texto.length > 40) {
      console.log(Math.round(texto.length/35))
      for(let i = 1; i<=Math.round(texto.length/35)+1; i++) {
        let val = (35*i);
        if(val > texto.length) {
          val = texto.length;
        }
        this.textSec += texto.slice(this.indice,val) + '<br>';
        this.indice = (35 * i);
        console.log(this.indice)
        console.log(this.textSec)
      }
      console.log(this.textSec)
      return this.textSec;
    }
    return texto;
  }

}
