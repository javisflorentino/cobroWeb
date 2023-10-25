import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-snack-bar',
  template: `
    <div class="card">
      <div class="flex justify-content-center flex-wrap">
        <mat-icon aria-hidden="false" aria-label="Example home icon">
          notifications
        </mat-icon>
        <p class="information">
            <strong>Notification</strong><br>
            {{ data }}
        </p>
      </div>
    </div>
  `,
  styleUrls: ['./snack-bar.component.css']
})
export class SnackBarComponent {
  constructor(
    public sbRef: MatSnackBarRef<SnackBarComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: any
  ) {}
}
