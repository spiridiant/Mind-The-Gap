import { TestBed } from '@angular/core/testing';

import { RecordRepoService } from './record-repo.service';

describe('RecordRepoService', () => {
  let service: RecordRepoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecordRepoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
