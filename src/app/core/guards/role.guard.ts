import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const requiredRoles = route.data['roles'] as UserRole[];

    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (!user) {
          this.router.navigate(['/auth/login']);
          return false;
        }

        if (!requiredRoles || requiredRoles.length === 0) {
          return true;
        }

        const hasRole = requiredRoles.includes(user.role);
        if (!hasRole) {
          this.router.navigate(['/dashboard']);
          return false;
        }

        return true;
      })
    );
  }
}
