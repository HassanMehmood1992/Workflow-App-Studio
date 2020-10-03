import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageProcessComponent } from './manage-process.component';

describe('ManageProcessComponent', () => {
  let component: ManageProcessComponent;
  let fixture: ComponentFixture<ManageProcessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageProcessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
