import { Pipe, PipeTransform } from '@angular/core';
import { PortalMenu } from '../interface/portal-menu.interface';

@Pipe({
  name: 'menuImage'
})
export class MenuImagePipe implements PipeTransform {

  transform(item:PortalMenu, resolution:string): string {
    let path = 'assets/dependencias/';
    if(resolution == 'Small' || resolution == 'XSmall')
      path += '256x256/'
    if (!item.dependencia) {
      return `${path}no-image.png`;
    }

    return `${path}${item.dependencia}.png`;
  }

}
