import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAppResourcesComponent } from './edit-app-resources.component';

describe('EditAppResourcesComponent', () => {
  let component: EditAppResourcesComponent;
  let fixture: ComponentFixture<EditAppResourcesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditAppResourcesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditAppResourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
