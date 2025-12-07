export interface ActionState {
  error?: string;
  fieldErrors?: {
    name?: string[];
    email?: string[];
    wishlist?: string[];
  };
}

export interface UserRoom {
  id: string;
  name: string;
  createdAt: Date;
  isAdmin: boolean;
  shuffledAt: Date | null;
  participantsCount: number;
}

export const USER_TOKEN_COOKIE = "santa_user_token";
