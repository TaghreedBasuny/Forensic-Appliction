import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

interface DoctorData {
  id: number;
  name: string;
  email: string;
  nationalId: string;
  joinDate: string;
  totalCases: number;
  articles: number;
  activityLevel: 'High' | 'Medium' | 'Low';
  avatarUrl?: string;
}

@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './doctor-profile.component.html',
  styleUrls: ['./doctor-profile.component.scss']
})
export class DoctorProfileComponent implements OnInit {
  doctor: DoctorData | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? +idParam : 0;

    this.doctor = this.getMockDoctorData(id);
  }

  private getMockDoctorData(id: number): DoctorData {
    return {
      id: id,
      name: 'Dr. Mohammed Sakr',
      email: 'mohammedsakr87@gmail.com',
      nationalId: '304021xxxxxxxx',
      joinDate: 'January 2020',
      totalCases: 89,
      articles: 12,
      activityLevel: 'High',
      avatarUrl: 'https://img.freepik.com/free-photo/portrait-smiling-handsome-male-doctor-man_171337-5055.jpg'  
    };
  }
}