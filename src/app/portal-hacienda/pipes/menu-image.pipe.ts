import { Pipe, PipeTransform } from '@angular/core';
import { PortalMenu } from '../interface/portal-menu.interface';
import { MenuConceptos } from 'src/app/shared/interfaces/shared-conceptos.interface';

@Pipe({
  name: 'menuImage'
})
export class MenuImagePipe implements PipeTransform {

  transform(item:MenuConceptos, resolution:string): string {
    let path = 'assets/dependencias/';
    if(resolution == 'Small' || resolution == 'XSmall')
      path += '256x256/'
    if (!item.titulo) {
      return `${path}no-image.png`;
    }

    return `${path}${item.titulo.slice(0,-5).replace(/ /g, "").replace(/\./g,"").toLowerCase()}.png`;
  }

}
