export type UserRole = 'student' | 'admin';

export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
}
