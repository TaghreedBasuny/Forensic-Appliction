import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; 

interface Doctor {
  id: number;
  name: string;
  nationalId: string;
  registerDate: string;
  status: 'Active' | 'Blocked';
}

@Component({
  selector: 'app-doctors-hub',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './doctors-hub.component.html',
  styleUrls: ['./doctors-hub.component.scss']
})
export class DoctorsHubComponent {
  
  allDoctors: Doctor[] = [
    { id: 1, name: 'Dr. Mohammed Sakr', nationalId: '12345678912345', registerDate: 'Oct 12, 2023', status: 'Active' },
    { id: 2, name: 'Dr. Julianne Davis', nationalId: '12345678912345', registerDate: 'Oct 12, 2023', status: 'Active' },
    { id: 3, name: 'Dr. Elena Lopez', nationalId: '12345678912345', registerDate: 'Oct 12, 2023', status: 'Active' },
    { id: 4, name: 'Dr. Sara Ali', nationalId: '12345678912345', registerDate: 'Oct 12, 2023', status: 'Active' },
    { id: 5, name: 'Dr. Taghreed Mohammed', nationalId: '12345678912345', registerDate: 'Oct 12, 2023', status: 'Blocked' },
    { id: 6, name: 'Dr. Basmala Mohammed', nationalId: '12345678912345', registerDate: 'Oct 12, 2023', status: 'Active' },
    { id: 7, name: 'Dr. Ahmed Hassan', nationalId: '12345678912345', registerDate: 'Nov 05, 2023', status: 'Active' },
    { id: 8, name: 'Dr. Fatima Al-Rashid', nationalId: '12345678912345', registerDate: 'Nov 10, 2023', status: 'Active' },
    { id: 9, name: 'Dr. Omar Khalil', nationalId: '12345678912345', registerDate: 'Dec 01, 2023', status: 'Blocked' },
    { id: 10, name: 'Dr. Layla Mansour', nationalId: '12345678912345', registerDate: 'Dec 15, 2023', status: 'Active' },
    { id: 11, name: 'Dr. Karim Nabil', nationalId: '12345678912345', registerDate: 'Jan 08, 2024', status: 'Active' },
    { id: 12, name: 'Dr. Hana Youssef', nationalId: '12345678912345', registerDate: 'Jan 20, 2024', status: 'Active' },
    { id: 13, name: 'Dr. Tarek Adel', nationalId: '12345678912345', registerDate: 'Feb 03, 2024', status: 'Active' },
    { id: 14, name: 'Dr. Nora Ibrahim', nationalId: '12345678912345', registerDate: 'Feb 18, 2024', status: 'Blocked' },
    { id: 15, name: 'Dr. Yassin Mostafa', nationalId: '12345678912345', registerDate: 'Mar 05, 2024', status: 'Active' },
    { id: 16, name: 'Dr. Salma Gamal', nationalId: '12345678912345', registerDate: 'Mar 22, 2024', status: 'Active' },
    { id: 17, name: 'Dr. Mahmoud Reda', nationalId: '12345678912345', registerDate: 'Apr 10, 2024', status: 'Active' },
    { id: 18, name: 'Dr. Dina Ashraf', nationalId: '12345678912345', registerDate: 'Apr 28, 2024', status: 'Active' },
    { id: 19, name: 'Dr. Wael Farouk', nationalId: '12345678912345', registerDate: 'May 12, 2024', status: 'Blocked' },
    { id: 20, name: 'Dr. Rania Salem', nationalId: '12345678912345', registerDate: 'May 30, 2024', status: 'Active' },
    { id: 21, name: 'Dr. Khaled Amin', nationalId: '12345678912345', registerDate: 'Jun 08, 2024', status: 'Active' },
    { id: 22, name: 'Dr. Menna Taha', nationalId: '12345678912345', registerDate: 'Jun 25, 2024', status: 'Active' },
    { id: 23, name: 'Dr. Amr Zaki', nationalId: '12345678912345', registerDate: 'Jul 10, 2024', status: 'Active' },
    { id: 24, name: 'Dr. Yasmin Fathy', nationalId: '12345678912345', registerDate: 'Jul 28, 2024', status: 'Blocked' },
    { id: 25, name: 'Dr. Sherif Nasser', nationalId: '12345678912345', registerDate: 'Aug 05, 2024', status: 'Active' },
    { id: 26, name: 'Dr. Heba Said', nationalId: '12345678912345', registerDate: 'Aug 20, 2024', status: 'Active' },
    { id: 27, name: 'Dr. Bassem Lotfy', nationalId: '12345678912345', registerDate: 'Sep 02, 2024', status: 'Active' },
    { id: 28, name: 'Dr. Aya Hamdy', nationalId: '12345678912345', registerDate: 'Sep 18, 2024', status: 'Active' },
    { id: 29, name: 'Dr. Mohamed Ezzat', nationalId: '12345678912345', registerDate: 'Oct 01, 2024', status: 'Blocked' },
    { id: 30, name: 'Dr. Shimaa Kamel', nationalId: '12345678912345', registerDate: 'Oct 15, 2024', status: 'Active' },
    { id: 31, name: 'Dr. Hossam Ragab', nationalId: '12345678912345', registerDate: 'Nov 02, 2024', status: 'Active' },
    { id: 32, name: 'Dr. Mai Abdallah', nationalId: '12345678912345', registerDate: 'Nov 20, 2024', status: 'Active' },
    { id: 33, name: 'Dr. Sameh Fouad', nationalId: '12345678912345', registerDate: 'Dec 05, 2024', status: 'Active' },
    { id: 34, name: 'Dr. Noha Samir', nationalId: '12345678912345', registerDate: 'Dec 22, 2024', status: 'Blocked' },
    { id: 35, name: 'Dr. Islam Magdy', nationalId: '12345678912345', registerDate: 'Jan 10, 2025', status: 'Active' },
    { id: 36, name: 'Dr. Doaa El-Sayed', nationalId: '12345678912345', registerDate: 'Jan 28, 2025', status: 'Active' },
    { id: 37, name: 'Dr. Ayman Shaker', nationalId: '12345678912345', registerDate: 'Feb 12, 2025', status: 'Active' },
    { id: 38, name: 'Dr. Samar Helmy', nationalId: '12345678912345', registerDate: 'Feb 28, 2025', status: 'Active' },
    { id: 39, name: 'Dr. Hazem Badr', nationalId: '12345678912345', registerDate: 'Mar 15, 2025', status: 'Blocked' },
    { id: 40, name: 'Dr. Ghada Maher', nationalId: '12345678912345', registerDate: 'Apr 01, 2025', status: 'Active' },
    { id: 41, name: 'Dr. Tamer Hosny', nationalId: '12345678912345', registerDate: 'Apr 18, 2025', status: 'Active' },
    { id: 42, name: 'Dr. Marwa Essam', nationalId: '12345678912345', registerDate: 'May 05, 2025', status: 'Active' },
    { id: 43, name: 'Dr. Walid Anwar', nationalId: '12345678912345', registerDate: 'May 22, 2025', status: 'Active' },
    { id: 44, name: 'Dr. Eman Tawfik', nationalId: '12345678912345', registerDate: 'Jun 08, 2025', status: 'Blocked' },
  ];

  // Pagination
  currentPage = 1;
  itemsPerPage = 6;
  totalDoctors = this.allDoctors.length;

  // Get current page doctors
  get doctors(): Doctor[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.allDoctors.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.totalDoctors / this.itemsPerPage);
  }

  get totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endIndex(): number {
    const end = this.currentPage * this.itemsPerPage;
    return end > this.totalDoctors ? this.totalDoctors : end;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  toggleStatus(doctor: Doctor): void {
    doctor.status = doctor.status === 'Active' ? 'Blocked' : 'Active';
    console.log(`${doctor.name} is now ${doctor.status}`);
  }

  exportPDF(): void {
    console.log('Exporting doctors list to PDF...');
  }
}