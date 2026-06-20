import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface AnalysisModel {
  id: number;
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-analysis-models',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './analysis-models.component.html',
  styleUrls: ['./analysis-models.component.scss']
})
export class AnalysisModelsComponent {
  models: AnalysisModel[] = [
    {
      id: 1,
      title: 'Deep Fake Detection',
      description: 'Identify GAN footprints and temporal inconsistencies in digital media samples.',
      icon: 'deep-fake'
    },
    {
      id: 2,
      title: 'Face Recognition',
      description: 'Identify GAN footprints and temporal inconsistencies in digital media samples.',
      icon: 'face'
    },
    {
      id: 3,
      title: 'DNA Analysis',
      description: 'Identify GAN footprints and temporal inconsistencies in digital media samples.',
      icon: 'dna'
    },
    {
      id: 4,
      title: 'Iris Detection',
      description: 'Identify GAN footprints and temporal inconsistencies in digital media samples.',
      icon: 'iris'
    },
    {
      id: 5,
      title: 'Fingerprint',
      description: 'Identify GAN footprints and temporal inconsistencies in digital media samples.',
      icon: 'fingerprint'
    }
  ];

 
}
