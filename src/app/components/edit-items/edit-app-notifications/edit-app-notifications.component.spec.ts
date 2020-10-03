import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAppNotificationsComponent } from './edit-app-notifications.component';

describe('EditAppNotificationsComponent', () => {
  let component: EditAppNotificationsComponent;
  let fixture: ComponentFixture<EditAppNotificationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditAppNotificationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditAppNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
