import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditWorkflowsComponent } from './edit-workflows.component';

describe('EditWorkflowsComponent', () => {
  let component: EditWorkflowsComponent;
  let fixture: ComponentFixture<EditWorkflowsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditWorkflowsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditWorkflowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
