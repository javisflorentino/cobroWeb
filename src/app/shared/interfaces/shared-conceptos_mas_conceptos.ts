export interface MoreConcept {
  smyt_arrastre:      HaciendaServicio[];
  smyt_licencias:     HaciendaServicio[];
  Hacienda_servicios: HaciendaServicio[];
}

export interface HaciendaServicio {
  gestora:  number;
  concepto: number;
}
