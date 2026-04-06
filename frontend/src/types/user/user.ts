export interface User {
  email: string;
  name?: string;
}

export interface AuthUser extends User {
  id: string;
  token: string;
}
