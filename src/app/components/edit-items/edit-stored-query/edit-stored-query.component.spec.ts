import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditStoredQueryComponent } from './edit-stored-query.component';

describe('EditStoredQueryComponent', () => {
  let component: EditStoredQueryComponent;
  let fixture: ComponentFixture<EditStoredQueryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditStoredQueryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditStoredQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
