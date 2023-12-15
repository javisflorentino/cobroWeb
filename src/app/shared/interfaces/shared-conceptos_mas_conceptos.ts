export interface MoreConcept {
  smyt_arrastre:                       HaciendaServicio[];
  smyt_licencias:                      HaciendaServicio[];
  Hacienda_servicios:                  HaciendaServicio[];
  DesarrolloS_atracciones:             HaciendaServicio[];
  DesarrolloS_atracciones_concesion:   HaciendaServicio[];
  DesarrolloS_otrosserv:               HaciendaServicio[];
  DesarrolloS_calidadaire_centroverif: HaciendaServicio[];
  DesarrolloS_calidadaire_publico:     HaciendaServicio[];
}

export interface HaciendaServicio {
  gestora:  number;
  concepto: number;
}
