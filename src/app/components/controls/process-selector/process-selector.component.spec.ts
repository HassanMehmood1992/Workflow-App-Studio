import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessSelectorComponent } from './process-selector.component';

describe('ProcessSelectorComponent', () => {
  let component: ProcessSelectorComponent;
  let fixture: ComponentFixture<ProcessSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
