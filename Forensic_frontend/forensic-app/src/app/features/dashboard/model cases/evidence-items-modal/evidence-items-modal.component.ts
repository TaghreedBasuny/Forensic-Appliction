import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-evidence-items-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './evidence-items-modal.component.html',
  styleUrls: ['./evidence-items-modal.component.scss']
})
export class EvidenceItemsModalComponent {
  isOpen = false;
  items: any[] = [];
  constructor(private router: Router) {}

goToCase(caseId: number) {
  this.closeModal();
  this.router.navigate(['/explore/investigative-cases', caseId]);
}

  setData(data: any[]) {
    this.items = data;
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