export interface ProfileInfo {
  user: number;
  fullName: string;
  email: string;
  isAdmin: boolean;
}

export interface UpdateProfileInput {
  fullName: string;
}

export interface UpdatePasswordInput {
  password: string;
}
