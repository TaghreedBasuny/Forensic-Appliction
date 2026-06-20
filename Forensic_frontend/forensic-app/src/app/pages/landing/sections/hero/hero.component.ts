import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule,RouterLink ],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent implements AfterViewInit, OnDestroy {
  @ViewChild('sliderContainer1', { static: false }) sliderContainer1!: ElementRef;
  @ViewChild('sliderTrack1', { static: false }) sliderTrack1!: ElementRef;
  @ViewChild('sliderContainer2', { static: false }) sliderContainer2!: ElementRef;
  @ViewChild('sliderTrack2', { static: false }) sliderTrack2!: ElementRef;

cards1 = [
  { 
    title: 'AI Detection', 
    description: 'Pattern recognition powered insights for forensic analysis',
    percentage: '+12.5%',
    icon: 'fa-brain',
    trend: 'up'
  },
  { 
    title: 'Legal Compliance', 
    description: 'Case management meets legal standards and regulations',
    percentage: '+15.3%',
    icon: 'fa-scale-balanced',
    trend: 'up'
  },
  { 
    title: 'Evidence Search', 
    description: 'Real-time evidence search capabilities with AI assistance',
    percentage: '+18.7%',
    icon: 'fa-magnifying-glass',
    trend: 'up'
  },
  { 
    title: 'DNA Analysis', 
    description: 'Advanced genomic sequencing for accurate identification',
    percentage: '+22.1%',
    icon: 'fa-dna',
    trend: 'up'
  },
  { 
    title: 'Digital Forensics', 
    description: 'Cyber evidence extraction and analysis tools',
    percentage: '-5.2%',
    icon: 'fa-laptop-code',
    trend: 'down'
  },
  { 
    title: 'Toxicology', 
    description: 'Chemical analysis for substance identification',
    percentage: '+14.2%',
    icon: 'fa-flask',
    trend: 'up'
  }
];

cards2 = [
  { 
    title: 'Crime Scene', 
    description: 'Advanced crime scene investigation and documentation',
    percentage: '+16.8%',
    icon: 'fa-location-dot',
    trend: 'up'
  },
  { 
    title: 'Ballistics', 
    description: 'Firearm and ammunition analysis for criminal cases',
    percentage: '-3.5%',
    icon: 'fa-gun',
    trend: 'down'
  },
  { 
    title: 'Fingerprint', 
    description: 'Automated fingerprint identification and matching',
    percentage: '+20.3%',
    icon: 'fa-fingerprint',
    trend: 'up'
  },
  { 
    title: 'Blood Analysis', 
    description: 'Forensic blood typing and DNA profiling',
    percentage: '+17.9%',
    icon: 'fa-vial',
    trend: 'up'
  },
  { 
    title: 'Cyber Crime', 
    description: 'Digital evidence collection and cyber forensics',
    percentage: '-8.4%',
    icon: 'fa-shield-halved',
    trend: 'down'
  },
  { 
    title: 'Forensic Psychology', 
    description: 'Behavioral analysis and criminal profiling',
    percentage: '+15.7%',
    icon: 'fa-user-secret',
    trend: 'up'
  }
];
  private currentTranslate1 = 0;
  private currentTranslate2 = 0;
  private sliderWidth1 = 0;
  private sliderWidth2 = 0;
  private autoSlideInterval1: any;
  private autoSlideInterval2: any;

  ngAfterViewInit() {
    setTimeout(() => {
      this.initSlider1();
      this.initSlider2();
      this.setupAutoSlide1();
      this.setupAutoSlide2();
      this.setupResizeListener();
    }, 0);
  }

  private initSlider1() {
    if (!this.sliderContainer1) return;
    this.sliderWidth1 = this.sliderContainer1.nativeElement.offsetWidth;
    
    this.currentTranslate1 = 0;
    this.setSliderPosition1();
  }

  private initSlider2() {
    if (!this.sliderContainer2) return;
    this.sliderWidth2 = this.sliderContainer2.nativeElement.offsetWidth;
    
    const maxScroll = -(this.cards2.length * 250 - this.sliderWidth2);
    this.currentTranslate2 = maxScroll;
    this.setSliderPosition2();
  }

  private setupAutoSlide1() {
    this.autoSlideInterval1 = setInterval(() => {
      this.autoSlide1();
    }, 3000);
  }

  private setupAutoSlide2() {
    this.autoSlideInterval2 = setInterval(() => {
      this.autoSlide2();
    }, 3500);
  }

  private setupResizeListener() {
    window.addEventListener('resize', () => {
      if (this.sliderContainer1) {
        this.sliderWidth1 = this.sliderContainer1.nativeElement.offsetWidth;
        this.initSlider1();
      }
      if (this.sliderContainer2) {
        this.sliderWidth2 = this.sliderContainer2.nativeElement.offsetWidth;
        this.initSlider2();
      }
    });
  }

  private autoSlide1() {
    if (!this.sliderTrack1 || !this.sliderContainer1) return;
    
    const maxScroll = -(this.cards1.length * 250 - this.sliderWidth1);
    
    if (this.currentTranslate1 <= maxScroll) {
      this.currentTranslate1 = 0;
      this.setSliderPosition1();
      return;
    }

    const step = 250 * Math.floor(this.sliderWidth1 / 250);
    this.currentTranslate1 = Math.max(maxScroll, this.currentTranslate1 - step);
    this.setSliderPosition1();
  }

  private autoSlide2() {
    if (!this.sliderTrack2 || !this.sliderContainer2) return;
    
    const maxScroll = -(this.cards2.length * 250 - this.sliderWidth2);
    
    if (this.currentTranslate2 >= 0) {
      this.currentTranslate2 = maxScroll;
      this.setSliderPosition2();
      return;
    }

    const step = 250 * Math.floor(this.sliderWidth2 / 250);
    this.currentTranslate2 = Math.min(0, this.currentTranslate2 + step);
    this.setSliderPosition2();
  }

  private setSliderPosition1() {
    if (!this.sliderTrack1) return;
    
    this.sliderTrack1.nativeElement.style.transform = `translateX(${this.currentTranslate1}px)`;
    this.sliderTrack1.nativeElement.style.transition = 'transform 0.6s ease-out';
  }

  private setSliderPosition2() {
    if (!this.sliderTrack2) return;
    
    this.sliderTrack2.nativeElement.style.transform = `translateX(${this.currentTranslate2}px)`;
    this.sliderTrack2.nativeElement.style.transition = 'transform 0.6s ease-out';
  }

  ngOnDestroy() {
    if (this.autoSlideInterval1) {
      clearInterval(this.autoSlideInterval1);
    }
    if (this.autoSlideInterval2) {
      clearInterval(this.autoSlideInterval2);
    }
  }
}