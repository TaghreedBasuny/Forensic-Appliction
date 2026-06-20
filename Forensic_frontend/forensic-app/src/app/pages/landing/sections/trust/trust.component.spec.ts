import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrustComponent } from './trust.component';

describe('Trust', () => {
  let component: TrustComponent;
  let fixture: ComponentFixture<TrustComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrustComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrustComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
