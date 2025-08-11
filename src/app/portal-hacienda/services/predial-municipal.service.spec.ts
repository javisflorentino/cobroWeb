import { TestBed } from '@angular/core/testing';

import { PredialMunicipalService } from './predial-municipal.service';

describe('PredialMunicipalService', () => {
  let service: PredialMunicipalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PredialMunicipalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
