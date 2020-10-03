import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportUpdateComponent } from './export-update.component';

describe('ExportUpdateComponent', () => {
  let component: ExportUpdateComponent;
  let fixture: ComponentFixture<ExportUpdateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExportUpdateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
