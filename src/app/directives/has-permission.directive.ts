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
  selector: '[appHasPermission]'
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  private resource: string = '';
  private action: string = '';
  private destroy$ = new Subject<void>();

  @Input() set appHasPermission(value: string) {
    // Expected format: "resource:action" e.g., "farmers:create"
    const parts = value.split(':');
    this.resource = parts[0];
    this.action = parts[1] || 'read';
    this.updateView();
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    // Subscribe to permission changes
    this.permissionService.permissions$
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
    if (this.permissionService.hasPermission(this.resource, this.action)) {
      // User has permission, show the element
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      // User doesn't have permission, hide the element
      this.viewContainer.clear();
    }
  }
}
