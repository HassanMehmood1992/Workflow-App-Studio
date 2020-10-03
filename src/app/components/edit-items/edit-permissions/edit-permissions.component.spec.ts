import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPermissionsComponent } from './edit-permissions.component';

describe('EditPermissionsComponent', () => {
  let component: EditPermissionsComponent;
  let fixture: ComponentFixture<EditPermissionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditPermissionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditPermissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
