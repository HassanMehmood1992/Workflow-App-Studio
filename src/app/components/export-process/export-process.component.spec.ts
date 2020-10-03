import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportProcessComponent } from './export-process.component';

describe('ExportProcessComponent', () => {
  let component: ExportProcessComponent;
  let fixture: ComponentFixture<ExportProcessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExportProcessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
