import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'menuImageShared'
})
export class MenuImageSharedPipe implements PipeTransform {

  transform(item:any): string {
      let path = 'assets/metodo_pago/';
      if (!item.iconURL) {
        return `${path}no-image.png`;
      }
      //return `${path}${item.titulo.slice(0,-5).replace(/ /g, "").replace(/\./g,"").toLowerCase()}.png`;
      return `${path}${item.iconURL.replace(/ /g, "").replace(/\./g,"").toLowerCase()}.png`;
    }

}
