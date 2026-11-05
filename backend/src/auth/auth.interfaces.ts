import { UserRole } from '../users/user.entity';

export interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
}

export interface RequestForUser extends Request {
  user:JwtPayload;
}