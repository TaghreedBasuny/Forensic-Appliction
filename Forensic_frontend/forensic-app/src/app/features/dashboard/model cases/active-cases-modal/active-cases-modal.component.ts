import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-active-cases-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './active-cases-modal.component.html',
  styleUrls: ['./active-cases-modal.component.scss']
})
export class ActiveCasesModalComponent {
  isOpen = false;
  cases: any[] = [];
  constructor(private router: Router) {}

goToCase(id: number) {
  this.closeModal();
  this.router.navigate(['/explore/investigative-cases', id]);
}

  setData(data: any[]) {
    this.cases = data;
  }

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
}