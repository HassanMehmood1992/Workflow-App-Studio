import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLookupsComponent } from './edit-lookups.component';

describe('EditLookupsComponent', () => {
  let component: EditLookupsComponent;
  let fixture: ComponentFixture<EditLookupsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditLookupsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditLookupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
