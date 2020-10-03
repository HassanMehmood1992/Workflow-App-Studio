import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageFormDataTasksComponent } from './manage-form-data-tasks.component';

describe('ManageFormDataTasksComponent', () => {
  let component: ManageFormDataTasksComponent;
  let fixture: ComponentFixture<ManageFormDataTasksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageFormDataTasksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageFormDataTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
