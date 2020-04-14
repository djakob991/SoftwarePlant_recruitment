import { TestBed } from '@angular/core/testing';

import { PlanetsStoreService } from './planets-store.service';

describe('PlanetsStoreService', () => {
  let service: PlanetsStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlanetsStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
