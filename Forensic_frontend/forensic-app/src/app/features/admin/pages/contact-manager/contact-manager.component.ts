import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService, ContactItem } from '../../services/contact.service'; 

@Component({
  selector: 'app-contact-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact-manager.component.html',
  styleUrls: ['./contact-manager.component.scss']
})
export class ContactManagerComponent implements OnInit {
  
  searchTerm: string = '';
  allContacts: ContactItem[] = [];
  filteredContacts: ContactItem[] = [];
  
  isDeleteModalOpen: boolean = false;
  itemToDeleteId: number | null = null;
  isLoading = false;

  currentPage = 1;
  itemsPerPage = 5;

  constructor(
    private contactService: ContactService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchContacts();
  }

  fetchContacts(): void {
    this.isLoading = true;
    this.contactService.getContacts().subscribe({
      next: (response) => {
        this.allContacts = response.data;
        this.filteredContacts = [...this.allContacts];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching contacts:', err);
        this.isLoading = false;
      }
    });
  }

  // Getters for Pagination & Display
  get totalContacts(): number { return this.filteredContacts.length; }
  
  get paginatedContacts(): ContactItem[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredContacts.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number { return Math.ceil(this.totalContacts / this.itemsPerPage); }
  get totalPagesArray(): number[] { return Array.from({ length: this.totalPages || 1 }, (_, i) => i + 1); }
  get startIndex(): number { return this.totalContacts === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1; }
  get endIndex(): number { 
    const end = this.currentPage * this.itemsPerPage; 
    return end > this.totalContacts ? this.totalContacts : end; 
  }

  filterContacts(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredContacts = this.allContacts.filter(c => 
      c.name.toLowerCase().includes(term) || 
      c.email.toLowerCase().includes(term) ||
      c.message.toLowerCase().includes(term)
    );
    this.currentPage = 1; 
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  openDeleteModal(id: number): void {
    this.itemToDeleteId = id;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.itemToDeleteId = null;
  }

  confirmDelete(): void {
    if (this.itemToDeleteId !== null) {
      this.isLoading = true;
      this.contactService.deleteContact(this.itemToDeleteId).subscribe({
        next: () => {
          this.allContacts = this.allContacts.filter(c => c.id !== this.itemToDeleteId);
          this.filterContacts(); 
          this.closeDeleteModal();
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error deleting contact:', err);
          this.isLoading = false;
        }
      });
    }
  }
}