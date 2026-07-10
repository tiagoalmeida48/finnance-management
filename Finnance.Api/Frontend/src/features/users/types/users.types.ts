export interface ManagedUser {
  user: number;
  email: string;
  fullName: string;
  isAdmin: boolean;
  active: boolean;
  subscriptionBlocked: boolean;
  created: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  fullName: string;
  isAdmin: boolean;
}

export interface UpdateUserInput {
  user: number;
  email: string;
  fullName: string;
  isAdmin: boolean;
}

export interface UpdateUserPasswordInput {
  user: number;
  password: string;
}
