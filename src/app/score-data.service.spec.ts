import { TestBed } from '@angular/core/testing';

import { ScoreDataService } from './score-data.service';

describe('ScoreDataService', () => {
  let service: ScoreDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScoreDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
