import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-snack-bar-whit-link',
  template: `
    <div class="snack-content">
      <span>{{ data.message }}</span>
      <a href="{{ data.linkUrl }}" target="_blank" class="link-blanco">{{ data.linkText }}</a>
    </div>
  `,
  styleUrls: ['./snack-bar-whit-link.component.css']
})
export class SnackBarWhitLinkComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) {}
}
