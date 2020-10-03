import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageAppResourcesComponent } from './manage-app-resources.component';

describe('ManageAppResourcesComponent', () => {
  let component: ManageAppResourcesComponent;
  let fixture: ComponentFixture<ManageAppResourcesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageAppResourcesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageAppResourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
