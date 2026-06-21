export interface ProfileInfo {
  user: number;
  fullName: string;
  email: string;
  isAdmin: boolean;
}

export interface UpdateProfileInput {
  user: number;
  email: string;
  fullName: string;
  isAdmin: boolean;
}

export interface UpdatePasswordInput {
  user: number;
  password: string;
}
