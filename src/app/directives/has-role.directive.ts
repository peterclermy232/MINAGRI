import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  OnInit,
  OnDestroy
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { PermissionService } from '../shared/permission.service';


@Directive({
  selector: '[appHasRole]'
})
export class HasRoleDirective implements OnInit, OnDestroy {
  private allowedRoles: string[] = [];
  private destroy$ = new Subject<void>();

  @Input() set appHasRole(roles: string | string[]) {
    // Accept either a single role or array of roles
    this.allowedRoles = Array.isArray(roles) ? roles : [roles];
    this.updateView();
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    // Subscribe to role changes
    this.permissionService.userRole$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateView();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateView(): void {
    if (this.permissionService.hasRole(...this.allowedRoles)) {
      // User has one of the allowed roles, show the element
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      // User doesn't have the role, hide the element
      this.viewContainer.clear();
    }
  }
}
