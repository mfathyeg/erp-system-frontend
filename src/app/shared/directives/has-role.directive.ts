import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models';

@Directive({
  selector: '[appHasRole]'
})
export class HasRoleDirective implements OnInit {
  private roles: UserRole[] = [];

  @Input()
  set appHasRole(roles: UserRole | UserRole[]) {
    this.roles = Array.isArray(roles) ? roles : [roles];
  }

  constructor(
    private templateRef: TemplateRef<unknown>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const hasRole = this.authService.hasRole(this.roles);
    if (hasRole) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
