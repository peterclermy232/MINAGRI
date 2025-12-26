import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface Notification {
  id: number;
  type: 'info' | 'warning' | 'success' | 'danger';
  title: string;
  message: string;
  time: Date;
  read: boolean;
}

export interface Message {
  id: number;
  from: string;
  avatar?: string;
  text: string;
  time: Date;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  /**
   * Get user notifications from backend
   */
  getNotifications(): Observable<Notification[]> {
    return this.http.get<any>(`${this.apiUrl}/notifications/`)
      .pipe(
        map((response: any) => {
          // Transform backend response to Notification format
          if (Array.isArray(response)) {
            return response.map(this.transformNotification);
          } else if (response?.results) {
            return response.results.map(this.transformNotification);
          }
          return [];
        }),
        catchError((error) => {
          console.error('Error fetching notifications:', error);
          return of(this.getMockNotifications());
        })
      );
  }

  /**
   * Get user messages from backend
   */
  getMessages(): Observable<Message[]> {
    return this.http.get<any>(`${this.apiUrl}/messages/`)
      .pipe(
        map((response: any) => {
          // Transform backend response to Message format
          if (Array.isArray(response)) {
            return response.map(this.transformMessage);
          } else if (response?.results) {
            return response.results.map(this.transformMessage);
          }
          return [];
        }),
        catchError((error) => {
          console.error('Error fetching messages:', error);
          return of(this.getMockMessages());
        })
      );
  }

  /**
   * Mark notification as read
   */
  markNotificationAsRead(notificationId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/notifications/${notificationId}/`, { read: true })
      .pipe(
        catchError((error) => {
          console.error('Error marking notification as read:', error);
          return of(null);
        })
      );
  }

  /**
   * Mark message as read
   */
  markMessageAsRead(messageId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/messages/${messageId}/`, { read: true })
      .pipe(
        catchError((error) => {
          console.error('Error marking message as read:', error);
          return of(null);
        })
      );
  }

  /**
   * Mark all notifications as read
   */
  markAllNotificationsAsRead(): Observable<any> {
    return this.http.post(`${this.apiUrl}/notifications/mark-all-read/`, {})
      .pipe(
        catchError((error) => {
          console.error('Error marking all notifications as read:', error);
          return of(null);
        })
      );
  }

  /**
   * Get notification count
   */
  getUnreadNotificationCount(): Observable<number> {
    return this.http.get<any>(`${this.apiUrl}/notifications/unread-count/`)
      .pipe(
        map((response: any) => response?.count || 0),
        catchError(() => of(0))
      );
  }

  /**
   * Get message count
   */
  getUnreadMessageCount(): Observable<number> {
    return this.http.get<any>(`${this.apiUrl}/messages/unread-count/`)
      .pipe(
        map((response: any) => response?.count || 0),
        catchError(() => of(0))
      );
  }

  /**
   * Transform backend notification to frontend format
   */
  private transformNotification(item: any): Notification {
    return {
      id: item.id || item.notification_id,
      type: item.type || item.notification_type || 'info',
      title: item.title || item.notification_title || 'Notification',
      message: item.message || item.notification_message || '',
      time: new Date(item.created_at || item.time || Date.now()),
      read: item.read || item.is_read || false
    };
  }

  /**
   * Transform backend message to frontend format
   */
  private transformMessage(item: any): Message {
    return {
      id: item.id || item.message_id,
      from: item.from || item.sender_name || item.sender || 'Unknown',
      avatar: item.avatar || item.sender_avatar || this.generateAvatar(item.from || 'User'),
      text: item.text || item.message || item.content || '',
      time: new Date(item.created_at || item.time || Date.now()),
      read: item.read || item.is_read || false
    };
  }

  /**
   * Generate avatar URL for a user
   */
  private generateAvatar(name: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=64`;
  }

  /**
   * Get mock notifications (fallback for demo)
   */
  private getMockNotifications(): Notification[] {
    return [
      {
        id: 1,
        type: 'success',
        title: 'New Policy Created',
        message: 'Policy POL-20241217-001 has been created successfully',
        time: new Date(Date.now() - 1000 * 60 * 5),
        read: false
      },
      {
        id: 2,
        type: 'warning',
        title: 'Pending Approval',
        message: '3 claims are pending your approval',
        time: new Date(Date.now() - 1000 * 60 * 30),
        read: false
      },
      {
        id: 3,
        type: 'info',
        title: 'System Update',
        message: 'System maintenance scheduled for tonight at 11 PM',
        time: new Date(Date.now() - 1000 * 60 * 60),
        read: false
      },
      {
        id: 4,
        type: 'danger',
        title: 'Payment Failed',
        message: 'Payment for invoice INV-2024-123 has failed',
        time: new Date(Date.now() - 1000 * 60 * 120),
        read: true
      }
    ];
  }

  /**
   * Get mock messages (fallback for demo)
   */
  private getMockMessages(): Message[] {
    return [
      {
        id: 1,
        from: 'John Kamau',
        avatar: 'https://ui-avatars.com/api/?name=John+Kamau&background=4154f1&color=fff',
        text: 'Can you review the claim for farmer ID 12345? It needs urgent attention.',
        time: new Date(Date.now() - 1000 * 60 * 10),
        read: false
      },
      {
        id: 2,
        from: 'Mary Wanjiku',
        avatar: 'https://ui-avatars.com/api/?name=Mary+Wanjiku&background=2eca6a&color=fff',
        text: 'The quarterly report is ready for your review. Please check it out.',
        time: new Date(Date.now() - 1000 * 60 * 45),
        read: false
      },
      {
        id: 3,
        from: 'Peter Omondi',
        avatar: 'https://ui-avatars.com/api/?name=Peter+Omondi&background=ff771d&color=fff',
        text: 'Meeting scheduled for tomorrow at 10 AM. See you there!',
        time: new Date(Date.now() - 1000 * 60 * 60 * 2),
        read: true
      }
    ];
  }
}
