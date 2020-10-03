import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportNewComponent } from './export-new.component';

describe('ExportNewComponent', () => {
  let component: ExportNewComponent;
  let fixture: ComponentFixture<ExportNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExportNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
