import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecycleBinComponent } from './recycle-bin.component';

describe('RecycleBinComponent', () => {
  let component: RecycleBinComponent;
  let fixture: ComponentFixture<RecycleBinComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecycleBinComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecycleBinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
