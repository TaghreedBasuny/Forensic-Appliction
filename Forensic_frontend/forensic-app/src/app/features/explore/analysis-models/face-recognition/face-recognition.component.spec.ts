import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaceRecognitionComponent } from './face-recognition.component';

describe('FaceRecognition', () => {
  let component: FaceRecognitionComponent;
  let fixture: ComponentFixture<FaceRecognitionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaceRecognitionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaceRecognitionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
