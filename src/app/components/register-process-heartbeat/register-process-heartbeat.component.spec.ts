import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterProcessHeartbeatComponent } from './register-process-heartbeat.component';

describe('RegisterProcessHeartbeatComponent', () => {
  let component: RegisterProcessHeartbeatComponent;
  let fixture: ComponentFixture<RegisterProcessHeartbeatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterProcessHeartbeatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterProcessHeartbeatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
