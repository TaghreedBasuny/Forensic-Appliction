import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface AnalysisModel {
  id: string;
  name: string;
  description: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-analysis-models-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analysis-models-model.component.html',
  styleUrls: ['./analysis-models-model.component.scss']
})
export class AnalysisModelsModalComponent {
  isOpen = false;
  
  models: AnalysisModel[] = [
    {
      id: 'deep-fake',
      name: 'Deep Fake Detection',
      description: 'Identify GAN footprints and temporal inconsistencies in digital media samples.',
      icon: 'deep-fake',
      route: '/explore/analysis-models/deep-fake-detection'
    },
    {
      id: 'face-recognition',
      name: 'Face Recognition',
      description: 'Identify GAN footprints and temporal inconsistencies in digital media samples.',
      icon: 'face',
      route: '/explore/analysis-models/face-recognition'
    },
    {
      id: 'dna-analysis',
      name: 'DNA Analysis',
      description: 'Identify GAN footprints and temporal inconsistencies in digital media samples.',
      icon: 'dna',
      route: '/explore/analysis-models/dna-analysis'
    }
  ];

  constructor(private router: Router) {}

  openModal() {
    this.isOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.isOpen = false;
    document.body.style.overflow = 'auto';
  }

  onOverlayClick(event: Event) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeModal();
    }
  }

  launchModel(model: AnalysisModel) {
    console.log('Launching model:', model.name);
    this.closeModal();
    
    // توجيه للصفحة الخاصة بالموديل
    this.router.navigate([model.route]);
    
    // أو لو عايزة تفتحي مودال تاني للموديل ده
    // this.openModelDetail(model);
  }

  goToFullModelsPage() {
    this.closeModal();
    this.router.navigate(['/explore/analysis-models']);
  }

  getIconSvg(iconName: string): string {
    return iconName;
  }
}