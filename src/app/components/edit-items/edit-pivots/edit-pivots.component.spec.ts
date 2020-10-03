import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPivotsComponent } from './edit-pivots.component';

describe('EditPivotsComponent', () => {
  let component: EditPivotsComponent;
  let fixture: ComponentFixture<EditPivotsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditPivotsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditPivotsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
