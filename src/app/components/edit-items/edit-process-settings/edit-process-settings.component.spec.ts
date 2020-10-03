import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditProcessSettingsComponent } from './edit-process-settings.component';

describe('EditProcessSettingsComponent', () => {
  let component: EditProcessSettingsComponent;
  let fixture: ComponentFixture<EditProcessSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditProcessSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditProcessSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
