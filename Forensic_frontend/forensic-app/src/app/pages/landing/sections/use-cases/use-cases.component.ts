// src/app/pages/landing/sections/use-cases/use-cases.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface UseCase {
  image: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-use-cases',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './use-cases.component.html',
  styleUrls: ['./use-cases.component.scss']
})
export class UseCasesComponent {
  useCases: UseCase[] = [
    {
      image: '/assets/images/case1.png', 
      title: 'Handle Complete Case Files Effortlessly',
      description: 'View timelines, suspects, evidence, and reports in one organized, plan-to-beepboard platform, moving forward.'
    },
    {
      image: '/assets/images/case2.png',
      title: 'Ensure Evidence Integrity',
      description: 'Capture and log evidence securely with traceable chain-of-custody to reduce errors and reduce human error.'
    },
    {
      image: '/assets/images/case3.png',
      title: 'AI Assistance for Smarter Outcomes',
      description: 'Let AI suggest links, detect patterns, and offer insights. For example: clues for false, remote decisions.'
    },
    {
      image: '/assets/images/case4.png',
      title: 'Work Together Without Delays',
      description: 'Real-time updates, annotations, and collaborative access for investigators, labs, and analysts in real time.'
    },
    {
      image: '/assets/images/case5.png',
      title: 'Learn Any Technique On Demand',
      description: 'Get step-by-step forensic protocols—your fingers the analysis to data formats available instantly inside the platform.'
    },
    {
      image: '/assets/images/case6.png',
      title: 'Understand Crime Types Better',
      description: 'Browse detailed guides on crime categories like cybercrime, arson, sexual assault, and common evidence types and legal context.'
    }
  ];
}