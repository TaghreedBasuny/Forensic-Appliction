import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeepFakeDetectionComponent } from './deep-fake-detection.component';

describe('DeepFakeDetection', () => {
  let component: DeepFakeDetectionComponent;
  let fixture: ComponentFixture<DeepFakeDetectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeepFakeDetectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeepFakeDetectionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
