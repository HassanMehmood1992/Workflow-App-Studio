import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportProcessComponent } from './import-process.component';

describe('ImportProcessComponent', () => {
  let component: ImportProcessComponent;
  let fixture: ComponentFixture<ImportProcessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportProcessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
