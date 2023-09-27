import { Pipe, PipeTransform } from '@angular/core';
import { PortalMenu } from '../interface/portal-menu.interface';

@Pipe({
  name: 'menuImage'
})
export class MenuImagePipe implements PipeTransform {

  transform(item:PortalMenu): string {
    if (!item.dependencia) {
      return 'assets/dependencias/no-image.png';
    }

    return `assets/dependencias/${item.dependencia}.png`;
  }

}
