import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/auth.service';
import { Subscription, interval } from 'rxjs';
import { NotificationService } from 'src/app/shared/notification.service';

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

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  // User Information
  userName: string = 'Guest';
  userFullName: string = 'Guest User';
  userRole: string = 'User';
  userAvatar: string = 'assets/img/default-avatar.png';
  userEmail: string = '';

  // Notifications
  notifications: Notification[] = [];
  unreadNotifications: number = 0;

  // Messages
  messages: Message[] = [];
  unreadMessages: number = 0;

  // Subscriptions
  private subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadNotifications();
    this.loadMessages();

    // Poll for new notifications every 30 seconds
    const pollSubscription = interval(30000).subscribe(() => {
      this.loadNotifications();
      this.loadMessages();
    });

    this.subscriptions.add(pollSubscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Load current user data from auth service
   */
  loadUserData(): void {
    const user = this.authService.getCurrentUser();

    if (user) {
      this.userName = user.user_name || user.userName || 'User';
      this.userFullName = this.authService.getUserFullName();
      this.userRole = user.user_role || user.userRole || 'User';
      this.userEmail = user.user_email || user.userEmail || '';

      // Set avatar - you can customize this based on your backend
      if (user.avatar) {
        this.userAvatar = user.avatar;
      } else {
        // Generate initials-based avatar or use default
        this.userAvatar = this.generateAvatarUrl(this.userFullName);
      }
    } else {
      console.warn('No user data found in auth service');
      // Optionally redirect to login if no user data
      // this.router.navigate(['/login']);
    }
  }

  /**
   * Generate avatar URL based on user initials
   */
  generateAvatarUrl(name: string): string {
    if (!name || name === 'Guest User') {
      return 'assets/img/default-avatar.png';
    }

    const initials = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    // You can use a service like UI Avatars
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`;
  }

  /**
   * Load notifications from service
   */
  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe(
      (notifications: Notification[]) => {
        this.notifications = notifications;
        this.unreadNotifications = notifications.filter(n => !n.read).length;
      },
      (error) => {
        console.error('Error loading notifications:', error);
        // Load mock notifications for demo
        this.loadMockNotifications();
      }
    );
  }

  /**
   * Load mock notifications (for demo purposes)
   */
  loadMockNotifications(): void {
    this.notifications = [
      {
        id: 1,
        type: 'success',
        title: 'New Policy Created',
        message: 'Policy POL-20241217-001 has been created successfully',
        time: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        read: false
      },
      {
        id: 2,
        type: 'warning',
        title: 'Pending Approval',
        message: '3 claims are pending your approval',
        time: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false
      },
      {
        id: 3,
        type: 'info',
        title: 'System Update',
        message: 'System maintenance scheduled for tonight',
        time: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        read: false
      }
    ];
    this.unreadNotifications = this.notifications.filter(n => !n.read).length;
  }

  /**
   * Load messages from service
   */
  loadMessages(): void {
    this.notificationService.getMessages().subscribe(
      (messages: Message[]) => {
        this.messages = messages;
        this.unreadMessages = messages.filter(m => !m.read).length;
      },
      (error) => {
        console.error('Error loading messages:', error);
        // Load mock messages for demo
        this.loadMockMessages();
      }
    );
  }

  /**
   * Load mock messages (for demo purposes)
   */
  loadMockMessages(): void {
    this.messages = [
      {
        id: 1,
        from: 'John Kamau',
        avatar: 'https://ui-avatars.com/api/?name=John+Kamau&background=4154f1&color=fff',
        text: 'Can you review the claim for farmer ID 12345?',
        time: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
        read: false
      },
      {
        id: 2,
        from: 'Mary Wanjiku',
        avatar: 'https://ui-avatars.com/api/?name=Mary+Wanjiku&background=2eca6a&color=fff',
        text: 'The quarterly report is ready for your review',
        time: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
        read: false
      }
    ];
    this.unreadMessages = this.messages.filter(m => !m.read).length;
  }

  /**
   * Get notification icon based on type
   */
  getNotificationIcon(type: string): string {
    const icons: { [key: string]: string } = {
      info: 'bi bi-info-circle text-primary',
      warning: 'bi bi-exclamation-triangle text-warning',
      success: 'bi bi-check-circle text-success',
      danger: 'bi bi-x-circle text-danger'
    };
    return icons[type] || 'bi bi-info-circle text-primary';
  }

  /**
   * Toggle sidebar
   */
  sidebarToggle(): void {
    this.document.body.classList.toggle('toggle-sidebar');
  }

  /**
   * View all notifications
   */
  viewAllNotifications(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/notifications']);
  }

  /**
   * View all messages
   */
  viewAllMessages(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/messages']);
  }

  /**
   * Open specific message
   */
  openMessage(event: Event, message: Message): void {
    event.preventDefault();
    // Mark as read
    message.read = true;
    this.unreadMessages = this.messages.filter(m => !m.read).length;

    // Navigate to message detail
    this.router.navigate(['/messages', message.id]);
  }

  /**
   * Handle user logout
   */
  handleLogout(event?: Event): void {
    if (event) {
      event.preventDefault();
    }

    // Show confirmation dialog
    if (confirm('Are you sure you want to logout?')) {
      this.authService.handleLogout();
    }
  }
}
