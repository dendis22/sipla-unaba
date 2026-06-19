export type DeviceCategory = 'Infocus' | 'Speaker';

export interface Device {
  id: string; // unique ID
  name: string;
  category: DeviceCategory;
  condition: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perbaikan';
  isAvailable: boolean;
  imageColor: string; // Color scheme to style simulated device icon elegantly
  serialNumber: string;
}

export type LoanStatus = 'Pending' | 'Approved' | 'Rejected' | 'Returned';

export interface Loan {
  id: string;
  studentName: string;
  studentId: string; // NIM
  studyProgram: string;
  mobileNumber: string;
  borrowDate: string;
  returnDate: string;
  deviceId: string;
  deviceName: string;
  deviceCategory: DeviceCategory;
  purpose: string;
  permissionLetterName?: string;
  permissionLetterSize?: string;
  status: LoanStatus;
  createdAt: string;
  qrCodeValue: string; // verification code
  rejectionReason?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}
