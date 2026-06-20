import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalysisModelsComponent } from './analysis-models.component';

describe('AnalysisModels', () => {
  let component: AnalysisModelsComponent;
  let fixture: ComponentFixture<AnalysisModelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalysisModelsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalysisModelsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
