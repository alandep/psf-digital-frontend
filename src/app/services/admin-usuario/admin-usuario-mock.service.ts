import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { IAdminUsuarioService } from './admin-usuario-service.interface';
import { AdminUsuariosMockService } from '../../../services/adminUsuariosMockService';
import { AdminUser, UserMetrics, UserStatus } from '../../../types/admin-usuarios';

/** Adapter exposing the legacy in-memory mock via IAdminUsuarioService. */
@Injectable({ providedIn: 'root' })
export class AdminUsuarioMockAdapter implements IAdminUsuarioService {
  private readonly mock = inject(AdminUsuariosMockService);
  getUsers(): Observable<AdminUser[]> { return this.mock.getUsers(); }
  getMetrics(): Observable<UserMetrics> { return this.mock.getMetrics(); }
  addUser(u: AdminUser): Observable<AdminUser> { return this.mock.addUser(u); }
  addUsers(u: AdminUser[]): Observable<AdminUser[]> { return this.mock.addUsers(u); }
  updateUser(u: AdminUser): Observable<AdminUser> { return this.mock.updateUser(u); }
  changeStatus(userId: string, status: string): Observable<AdminUser> {
    // Mock: load, flip status, persist.
    return new Observable<AdminUser>((sub) => {
      this.mock.getUsers().subscribe((list) => {
        const u = list.find((x) => x.id === userId);
        if (u) {
          const updated = { ...u, status: status as UserStatus };
          this.mock.updateUser(updated).subscribe((r) => { sub.next(r); sub.complete(); });
        } else {
          sub.complete();
        }
      });
    });
  }
  resetPassword(): Observable<{ ok: boolean }> { return of({ ok: true }); }
}