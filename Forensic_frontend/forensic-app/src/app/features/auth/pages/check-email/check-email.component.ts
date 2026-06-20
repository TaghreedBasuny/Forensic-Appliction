import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-check-email',
  templateUrl: './check-email.component.html',
  styleUrls: ['./check-email.component.scss'],
  standalone: true,
  imports: [RouterLink]
})
export class CheckEmailComponent implements OnInit {
  email = 'user@example.com';

  constructor(private router: Router) {}

  ngOnInit(): void {
    const saved = localStorage.getItem('resetEmail');
    if (saved) {
      this.email = saved;
    }
  }

  simulateEmailClick(): void {
    this.router.navigate(['/auth/reset-password']);
  }
}