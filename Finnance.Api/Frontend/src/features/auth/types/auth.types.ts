export interface Session {
  token: string;
  user: number;
  fullName: string;
  email: string;
  isAdmin: boolean;
}

export interface Me {
  user: number;
  fullName: string;
  email: string;
  isAdmin: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
}
