import { Observable } from 'rxjs';
import { AdminUser, UserMetrics } from '../../../types/admin-usuarios';

/** User management (current org) for the admin "Gestao de Usuarios" screen. */
export interface IAdminUsuarioService {
  getUsers(): Observable<AdminUser[]>;
  getMetrics(): Observable<UserMetrics>;
  addUser(user: AdminUser): Observable<AdminUser>;
  addUsers(users: AdminUser[]): Observable<AdminUser[]>;
  updateUser(user: AdminUser): Observable<AdminUser>;
  changeStatus(userId: string, status: string): Observable<AdminUser>;
  resetPassword(userId: string): Observable<{ ok: boolean }>;
}