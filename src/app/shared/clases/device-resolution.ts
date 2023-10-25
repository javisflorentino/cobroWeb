import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { Subject, takeUntil, Observable } from 'rxjs';


export class DeviceResolution  {

  destroyed = new Subject<void>();
  public sizeDisplay!: string;
  private displayNameMap = new Map([
    [Breakpoints.XSmall, 'XSmall'],
    [Breakpoints.Small, 'Small'],
    [Breakpoints.Medium, 'Medium'],
    [Breakpoints.Large, 'Large'],
    [Breakpoints.XLarge, 'XLarge'],
  ]);

  constructor(private breakpointObserver: BreakpointObserver) {
    //this.mediaQuery();
  }

  getDisplayameMap() {

  }

  public mediaQuery(): Observable<any> {

    return this.breakpointObserver
      .observe([
        Breakpoints.XSmall,
        Breakpoints.Small,
        Breakpoints.Medium,
        Breakpoints.Large,
        Breakpoints.XLarge,
      ])
      .pipe(takeUntil(this.destroyed))
      /*.subscribe(result => {
        for (const query of Object.keys(result.breakpoints)) {
          if (result.breakpoints[query]) {
            this.sizeDisplay = this.displayNameMap.get(query) ?? 'Unknown';
          }
          console.log(this.sizeDisplay)
        }
      });*/


 }
}
