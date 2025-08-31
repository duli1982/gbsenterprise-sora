export interface Notification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: number;
}

export interface NotificationPreferences {
  email?: boolean;
  push?: boolean;
  pushToken?: string;
  emailAddress?: string;
}
