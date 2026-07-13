import { Component, OnInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingsService } from './settings.service'; 
import { UserProfileService } from '../../core/services/user-profile.service';
import { AuthService } from '../../core/services/auth.service';


export interface UserProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  nationalId: string;
  role: string;
  lastLogin: string; 
  profilePicture: string | null;
}

interface ToastMessage {
  text: string;
  type: 'success' | 'error';
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('videoEl') videoEl!: ElementRef<HTMLVideoElement>;

  showPhotoMenu = false;
  showCameraModal = false;
  cameraStream: MediaStream | null = null;
  selectedTheme: 'light' | 'dark' | 'auto' = 'auto';
  selectedFontSize: 'small' | 'medium' | 'large' = 'medium';
  selectedImageFile: File | null = null;

  hasUnsavedChanges = false;
  isLoading = false;
  isSavingPassword = false;
  isSavingProfile = false;
  
  personalForm!: FormGroup;
  passwordForm!: FormGroup;

  userProfile: UserProfileData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    nationalId: '',
    role: 'Doctor',
    lastLogin: 'Just now',
    profilePicture: null
  };

  profilePictureUrl: string | null = null;
  originalProfilePictureUrl: string | null = null;

  showCurrentPass = false;
  showNewPass = false;
  showConfirmPass = false;

  toast: ToastMessage | null = null;
constructor(
  private fb: FormBuilder,
  private settingsService: SettingsService,
  private userProfileService: UserProfileService,
  private authService: AuthService,
  private cd: ChangeDetectorRef 
) {}

ngOnInit(): void {
  this.initForms();
  this.loadUserProfile();
  const saved = (localStorage.getItem('app-theme') as 'light'|'dark'|'auto') || 'auto';
  this.setTheme(saved);
}
  showToast(message: string, type: 'success' | 'error' = 'success') {
    this.toast = { text: message, type };
    this.cd.detectChanges(); 
    setTimeout(() => {
      this.toast = null;
      this.cd.detectChanges();
    }, 3000);
  }

  initForms(): void {
    this.personalForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      dob: ['', Validators.required],
      nationalId: ['', Validators.required]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    this.personalForm.valueChanges.subscribe(() => {
      this.checkUnsavedChanges();
    });
  }

  checkUnsavedChanges() {
    const formChanged = this.personalForm.dirty;
    const imageChanged = this.profilePictureUrl !== this.originalProfilePictureUrl;
    this.hasUnsavedChanges = formChanged || imageChanged;
  }

  passwordMatchValidator(group: FormGroup) {
    const newPass = group.get('newPassword')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return newPass === confirm ? null : { mismatch: true };
  }

  isFormValid(): boolean {
    return this.personalForm.valid && !this.isSavingProfile;
  }

  loadUserProfile(): void {
    this.isLoading = true;
    
    this.settingsService.getUserProfile().subscribe({
      next: (response) => {
        if (response.status && response.data) {
          const data = response.data;
          
          const nameParts = data.name ? data.name.split(' ') : ['', ''];
          const firstName = nameParts[0];
          const lastName = nameParts.slice(1).join(' ');

const imageUrl = data.image ? data.image : null;
          this.personalForm.patchValue({
            firstName: firstName,
            lastName: lastName,
            email: data.email,
            phone: data.phone_number,
            dob: data.date_of_birth,
            nationalId: data.national_id
          });

          this.userProfile = {
            firstName: firstName,
            lastName: lastName,
            email: data.email,
            phone: data.phone_number,
            dob: data.date_of_birth,
            nationalId: data.national_id,
            role: data.role ? (data.role.charAt(0).toUpperCase() + data.role.slice(1)) : 'Doctor',
            lastLogin: data.created_at || 'Recently',
            profilePicture: imageUrl
          };

          this.profilePictureUrl = imageUrl;
          this.originalProfilePictureUrl = imageUrl;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        this.isLoading = false;
        this.showToast('Failed to load profile data.', 'error');
      }
    });
  }

 saveChanges(): void {
  if (!this.personalForm.valid) {
    this.personalForm.markAllAsTouched();
    return;
  }

  this.isSavingProfile = true;
  this.cd.detectChanges(); 

  const fullName = `${this.personalForm.value.firstName} ${this.personalForm.value.lastName}`.trim();

  const payload = {
    first_name: this.personalForm.value.firstName,
    last_name: this.personalForm.value.lastName,
    email: this.personalForm.value.email,
    phone_number: this.personalForm.value.phone,
    date_of_birth: this.personalForm.value.dob,
    national_id: this.personalForm.value.nationalId,
  };

  this.settingsService.updateProfile(payload, this.selectedImageFile).subscribe({
    next: (response) => {
      this.isSavingProfile = false;
      this.cd.detectChanges(); 
      
      this.personalForm.markAsPristine();
      
      this.userProfile.firstName = this.personalForm.value.firstName;
      this.userProfile.lastName = this.personalForm.value.lastName;
      this.userProfile.email = this.personalForm.value.email;
      this.userProfile.role = response.user?.role || this.userProfile.role;
      this.originalProfilePictureUrl = this.profilePictureUrl;
      this.selectedImageFile = null;
      this.hasUnsavedChanges = false;

     

      this.userProfileService.updateProfile({
        name: fullName,
        email: payload.email,
        profilePicture: this.profilePictureUrl,
        role: this.userProfile.role
      });

      this.authService.updateCurrentUser({
        name: fullName,
        email: payload.email,
        avatar: this.profilePictureUrl
      });

      this.showToast('Profile updated successfully!', 'success');
    },
    error: (err) => {
      this.isSavingProfile = false;
      this.cd.detectChanges();
      this.hasUnsavedChanges = true;
      this.showToast(err.error?.message || err.error?.msg || 'Failed to update profile.', 'error');
    }
  });
}
  savePasswordChanges(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isSavingPassword = true;
    this.cd.detectChanges();

    const payload = {
      current_password: this.passwordForm.value.currentPassword,
      new_password: this.passwordForm.value.newPassword,
      new_password_confirmation: this.passwordForm.value.confirmPassword
    };

    this.settingsService.changePassword(payload).subscribe({
      next: (response) => {
        this.isSavingPassword = false;
        this.cd.detectChanges();
        this.passwordForm.reset();
        this.passwordForm.markAsPristine();
        this.showToast(response.msg || 'Password changed successfully!', 'success');
      },
      error: (err) => {
        this.isSavingPassword = false;
        this.cd.detectChanges();
        this.showToast(err.error?.msg || 'Failed to change password.', 'error');
      }
    });
  }

 onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files?.[0]) {
    const file = input.files[0];
    this.selectedImageFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.profilePictureUrl = reader.result as string;
      this.checkUnsavedChanges();
    };
    reader.readAsDataURL(file);
  }
  this.closePhotoMenu();
}
  removePhoto(): void {
    this.profilePictureUrl = null;
    this.userProfile.profilePicture = null;
    this.checkUnsavedChanges();
    this.closePhotoMenu();
  }

  resetChanges(): void {
    this.personalForm.patchValue({
      firstName: this.userProfile.firstName,
      lastName: this.userProfile.lastName,
      email: this.userProfile.email,
      phone: this.userProfile.phone,
      dob: this.userProfile.dob,
      nationalId: this.userProfile.nationalId
    });
    
    this.profilePictureUrl = this.originalProfilePictureUrl;
    this.userProfile.profilePicture = this.originalProfilePictureUrl;
    
    this.personalForm.markAsPristine();
    this.hasUnsavedChanges = false;
    this.showToast('Changes reset.', 'success');
  }

  togglePhotoMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.showPhotoMenu = !this.showPhotoMenu;
  }
  closePhotoMenu(): void { this.showPhotoMenu = false; }
  triggerUpload(): void {
    this.fileInput.nativeElement.click();
    this.closePhotoMenu();
  }
  
  togglePassword(type: 'current' | 'new' | 'confirm'): void {
    if (type === 'current') this.showCurrentPass = !this.showCurrentPass;
    if (type === 'new') this.showNewPass = !this.showNewPass;
    if (type === 'confirm') this.showConfirmPass = !this.showConfirmPass;
  }

setTheme(theme: 'light' | 'dark' | 'auto'): void {
  this.selectedTheme = theme;
  const isDark = theme === 'dark';
  document.documentElement.classList.toggle('dark-theme', isDark);
  localStorage.setItem('app-theme', theme);
}
  setFontSize(size: 'small' | 'medium' | 'large'): void { this.selectedFontSize = size; }
  
  async openCamera(): Promise<void> { alert('Camera not implemented in this demo.'); }
  capturePhoto(): void {}
  closeCamera(): void {}
  viewPhoto(): void { if (this.profilePictureUrl) window.open(this.profilePictureUrl, '_blank'); this.closePhotoMenu(); }
  incrementExperience(): void {}
  decrementExperience(): void {}
}















/*


import { Component, OnInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingsService } from './settings.service'; 
import { UserProfileService } from '../../core/services/user-profile.service';

export interface UserProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  nationalId: string;
  role: string;
  lastLogin: string; 
  profilePicture: string | null;
}

interface ToastMessage {
  text: string;
  type: 'success' | 'error';
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('videoEl') videoEl!: ElementRef<HTMLVideoElement>;

  showPhotoMenu = false;
  showCameraModal = false;
  cameraStream: MediaStream | null = null;
  selectedTheme: 'light' | 'dark' | 'auto' = 'auto';
  selectedFontSize: 'small' | 'medium' | 'large' = 'medium';
  
  hasUnsavedChanges = false;
  isLoading = false;
  isSavingPassword = false;
  isSavingProfile = false;

  personalForm!: FormGroup;
  passwordForm!: FormGroup;

  userProfile: UserProfileData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    nationalId: '',
    role: 'Doctor',
    lastLogin: 'Just now',
    profilePicture: null
  };

  profilePictureUrl: string | null = null;
  originalProfilePictureUrl: string | null = null;

  showCurrentPass = false;
  showNewPass = false;
  showConfirmPass = false;

  toast: ToastMessage | null = null;

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private userProfileService: UserProfileService,
    private cd: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadUserProfile();
  }

  showToast(message: string, type: 'success' | 'error' = 'success') {
    this.toast = { text: message, type };
    this.cd.detectChanges(); 
    setTimeout(() => {
      this.toast = null;
      this.cd.detectChanges();
    }, 3000);
  }

  initForms(): void {
    this.personalForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      dob: ['', Validators.required],
      nationalId: ['', Validators.required]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    this.personalForm.valueChanges.subscribe(() => {
      this.checkUnsavedChanges();
    });
  }

  checkUnsavedChanges() {
    const formChanged = this.personalForm.dirty;
    const imageChanged = this.profilePictureUrl !== this.originalProfilePictureUrl;
    this.hasUnsavedChanges = formChanged || imageChanged;
  }

  passwordMatchValidator(group: FormGroup) {
    const newPass = group.get('newPassword')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return newPass === confirm ? null : { mismatch: true };
  }

  isFormValid(): boolean {
    return this.personalForm.valid && !this.isSavingProfile;
  }

  loadUserProfile(): void {
    this.isLoading = true;
    
    this.settingsService.getUserProfile().subscribe({
      next: (response) => {
        if (response.status && response.data) {
          const data = response.data;
          
          const nameParts = data.name ? data.name.split(' ') : ['', ''];
          const firstName = nameParts[0];
          const lastName = nameParts.slice(1).join(' ');

          const imageUrl = data.image ? data.image : null;
          if (imageUrl) {
            localStorage.setItem('profilePicture', imageUrl);
          } else {
            localStorage.removeItem('profilePicture');
          }

          this.personalForm.patchValue({
            firstName: firstName,
            lastName: lastName,
            email: data.email,
            phone: data.phone_number,
            dob: data.date_of_birth,
            nationalId: data.national_id
          });

          this.userProfile = {
            firstName: firstName,
            lastName: lastName,
            email: data.email,
            phone: data.phone_number,
            dob: data.date_of_birth,
            nationalId: data.national_id,
            role: data.role ? (data.role.charAt(0).toUpperCase() + data.role.slice(1)) : 'Doctor',
            lastLogin: data.created_at || 'Recently',
            profilePicture: imageUrl
          };

          this.profilePictureUrl = imageUrl;
          this.originalProfilePictureUrl = imageUrl;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        this.isLoading = false;
        this.showToast('Failed to load profile data.', 'error');
      }
    });
  }

  saveChanges(): void {
    if (!this.personalForm.valid) {
      this.personalForm.markAllAsTouched();
      return;
    }

    this.isSavingProfile = true;
    this.cd.detectChanges(); 

    const fullName = `${this.personalForm.value.firstName} ${this.personalForm.value.lastName}`.trim();

    const payload = {
      name: fullName,
      email: this.personalForm.value.email,
      phone_number: this.personalForm.value.phone,
      date_of_birth: this.personalForm.value.dob,
      national_id: this.personalForm.value.nationalId,
    };

    this.settingsService.updateProfile(payload).subscribe({
      next: (response) => {
        this.isSavingProfile = false;
        this.cd.detectChanges(); 
        
        this.personalForm.markAsPristine();
        
        this.userProfile.firstName = this.personalForm.value.firstName;
        this.userProfile.lastName = this.personalForm.value.lastName;
        this.userProfile.email = this.personalForm.value.email;
        this.userProfile.role = response.user?.role || this.userProfile.role;
        this.originalProfilePictureUrl = this.profilePictureUrl;
        this.hasUnsavedChanges = false;

        this.userProfileService.updateProfile({
          name: fullName,
          email: payload.email,
          profilePicture: this.profilePictureUrl,
          role: this.userProfile.role
        });

        this.showToast('Profile updated successfully!', 'success');
      },
      error: (err) => {
        this.isSavingProfile = false;
        this.cd.detectChanges();
        this.hasUnsavedChanges = true;
        this.showToast(err.error?.msg || 'Failed to update profile.', 'error');
      }
    });
  }

  savePasswordChanges(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isSavingPassword = true;
    this.cd.detectChanges();

    const payload = {
      current_password: this.passwordForm.value.currentPassword,
      new_password: this.passwordForm.value.newPassword,
      new_password_confirmation: this.passwordForm.value.confirmPassword
    };

    this.settingsService.changePassword(payload).subscribe({
      next: (response) => {
        this.isSavingPassword = false;
        this.cd.detectChanges();
        this.passwordForm.reset();
        this.passwordForm.markAsPristine();
        this.showToast(response.msg || 'Password changed successfully!', 'success');
      },
      error: (err) => {
        this.isSavingPassword = false;
        this.cd.detectChanges();
        this.showToast(err.error?.msg || 'Failed to change password.', 'error');
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      const file = input.files[0];
      
      this.settingsService.uploadProfilePicture(file).subscribe({
        next: (response) => {
          if (response.image) {
            this.profilePictureUrl = response.image;
            localStorage.setItem('profilePicture', response.image);
            this.checkUnsavedChanges();

            const payload = {
              name: `${this.personalForm.value.firstName} ${this.personalForm.value.lastName}`.trim(),
              email: this.personalForm.value.email,
              phone_number: this.personalForm.value.phone,
              date_of_birth: this.personalForm.value.dob,
              national_id: this.personalForm.value.nationalId,
              image: response.image
            };

            this.settingsService.updateProfile(payload).subscribe({
              next: () => {
                this.originalProfilePictureUrl = this.profilePictureUrl;
                this.checkUnsavedChanges();
                this.showToast('Photo uploaded successfully!', 'success');
              },
              error: (err) => {
                console.error('Failed to save image with profile:', err);
                this.showToast('Photo uploaded but failed to save.', 'error');
              }
            });
          }
        },
        error: (err) => {
          this.showToast('Failed to upload photo.', 'error');
        }
      });
      
      this.closePhotoMenu();
    }
  }

  removePhoto(): void {
    this.profilePictureUrl = null;
    this.userProfile.profilePicture = null;
    localStorage.removeItem('profilePicture');
    this.checkUnsavedChanges();
    this.closePhotoMenu();
  }

  resetChanges(): void {
    this.personalForm.patchValue({
      firstName: this.userProfile.firstName,
      lastName: this.userProfile.lastName,
      email: this.userProfile.email,
      phone: this.userProfile.phone,
      dob: this.userProfile.dob,
      nationalId: this.userProfile.nationalId
    });
    
    this.profilePictureUrl = this.originalProfilePictureUrl;
    this.userProfile.profilePicture = this.originalProfilePictureUrl;
    
    this.personalForm.markAsPristine();
    this.hasUnsavedChanges = false;
    this.showToast('Changes reset.', 'success');
  }

  togglePhotoMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.showPhotoMenu = !this.showPhotoMenu;
  }
  closePhotoMenu(): void { this.showPhotoMenu = false; }
  triggerUpload(): void {
    this.fileInput.nativeElement.click();
    this.closePhotoMenu();
  }
  
  togglePassword(type: 'current' | 'new' | 'confirm'): void {
    if (type === 'current') this.showCurrentPass = !this.showCurrentPass;
    if (type === 'new') this.showNewPass = !this.showNewPass;
    if (type === 'confirm') this.showConfirmPass = !this.showConfirmPass;
  }

  setTheme(theme: 'light' | 'dark' | 'auto'): void { this.selectedTheme = theme; }
  setFontSize(size: 'small' | 'medium' | 'large'): void { this.selectedFontSize = size; }
  
  async openCamera(): Promise<void> { alert('Camera not implemented in this demo.'); }
  capturePhoto(): void {}
  closeCamera(): void {}
  viewPhoto(): void { if (this.profilePictureUrl) window.open(this.profilePictureUrl, '_blank'); this.closePhotoMenu(); }
  incrementExperience(): void {}
  decrementExperience(): void {}
}*/ 