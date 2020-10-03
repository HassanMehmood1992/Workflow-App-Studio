import { TestBed, inject } from '@angular/core/testing';

import { RapidflowService } from './rapidflow.service';

describe('RapidflowService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RapidflowService]
    });
  });

  it('should be created', inject([RapidflowService], (service: RapidflowService) => {
    expect(service).toBeTruthy();
  }));
});
