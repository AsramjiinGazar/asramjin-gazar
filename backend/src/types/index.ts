export type UserRole = 'student' | 'teacher' | 'admin';

export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
}
