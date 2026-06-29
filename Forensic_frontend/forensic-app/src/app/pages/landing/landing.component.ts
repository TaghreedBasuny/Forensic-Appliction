import { Component } from '@angular/core';
import { NavbarComponent } from '../../layout/navbar/navbar.component';
import { HeroComponent } from '../landing/sections/hero/hero.component';
import { FeaturesComponent } from "./sections/features/features.component"; 
import { UseCasesComponent } from './sections/use-cases/use-cases.component';
import { CommonModule } from '@angular/common';
import { TrustComponent } from "./sections/trust/trust.component";
import { ContactPageComponent } from './sections/contact-page/contact-page.component';
import { FooterComponent } from '../../layout/footer/footer.component';
@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    NavbarComponent,
    HeroComponent,
    FeaturesComponent,
    UseCasesComponent,
    CommonModule,
    TrustComponent,
    ContactPageComponent,
    FooterComponent
    
],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {}






