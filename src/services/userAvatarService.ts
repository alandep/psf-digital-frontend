import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * UserAvatarService (mock, localStorage-backed)
 *
 * Stores the logged-in user's avatar as a base64 data URL under the
 * localStorage key 'eip_user_avatar'. Consumers subscribe to `avatar$`.
 * A real upload service can later replace this implementation without
 * changing consumers.
 */
@Injectable({ providedIn: 'root' })
export class UserAvatarService {
  private static readonly STORAGE_KEY = 'eip_user_avatar';

  private readonly subject = new BehaviorSubject<string | null>(this.readInitial());

  /** Emits the current avatar data URL (or null when none is set). */
  readonly avatar$: Observable<string | null> = this.subject.asObservable();

  /** Current avatar value without subscribing. */
  get currentAvatar(): string | null {
    return this.subject.value;
  }

  /** Persist a new avatar data URL and notify subscribers. */
  setAvatar(dataUrl: string): void {
    try {
      localStorage.setItem(UserAvatarService.STORAGE_KEY, dataUrl);
    } catch {
      // Ignore quota/SSR errors; keep in-memory value in sync.
    }
    this.subject.next(dataUrl);
  }

  /** Remove the stored avatar and notify subscribers. */
  clearAvatar(): void {
    try {
      localStorage.removeItem(UserAvatarService.STORAGE_KEY);
    } catch {
      // Ignore quota/SSR errors.
    }
    this.subject.next(null);
  }

  private readInitial(): string | null {
    try {
      return localStorage.getItem(UserAvatarService.STORAGE_KEY);
    } catch {
      return null;
    }
  }
}
