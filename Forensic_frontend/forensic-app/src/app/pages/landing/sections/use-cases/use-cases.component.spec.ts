import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UseCasesComponent } from './use-cases.component';

describe('UseCases', () => {
  let component: UseCasesComponent;
  let fixture: ComponentFixture<UseCasesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UseCasesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UseCasesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
