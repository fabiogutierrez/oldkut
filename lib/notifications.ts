export interface FriendRequestNotification {
  type: 'friend_request';
  userId: string;
  username: string;
  displayName: string;
  photoUrl: string | null;
}

export interface TestimonialNotification {
  type: 'testimonial';
  id: string;
  authorUsername: string;
  authorDisplayName: string;
  authorPhotoUrl: string | null;
  message: string;
}

export type Notification = FriendRequestNotification | TestimonialNotification;
