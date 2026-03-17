import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { Subject, takeUntil } from 'rxjs';
import { LoadingService } from '../../core/services/loading.service';
import { SignalRService } from '../../core/services/signalr.service';

@Component({
  selector: 'app-main-layout',
  template: `
    <div class="layout-container">
      <app-navbar (toggleMenu)="toggleSidenav()"></app-navbar>

      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav
          #sidenav
          [mode]="isMobile ? 'over' : 'side'"
          [opened]="!isMobile"
          class="sidenav">
          <app-sidebar
            [collapsed]="sidebarCollapsed"
            (toggleSidebar)="toggleSidebarCollapse()"
            (navItemClicked)="onNavItemClicked()">
          </app-sidebar>
        </mat-sidenav>

        <mat-sidenav-content class="content" [style.margin-left]="getContentMargin()">
          <mat-progress-bar
            *ngIf="isLoading"
            mode="indeterminate"
            class="loading-bar">
          </mat-progress-bar>

          <div class="page-content">
            <router-outlet></router-outlet>
          </div>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .layout-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    .sidenav-container {
      flex: 1;
      margin-top: 64px;
    }
    .sidenav {
      background: transparent;
      border: none;
    }
    .content {
      transition: margin-left 0.3s ease;
      background: #f5f5f5;
      min-height: calc(100vh - 64px);
    }
    .loading-bar {
      position: fixed;
      top: 64px;
      left: 0;
      right: 0;
      z-index: 999;
    }
    .page-content {
      padding: 24px;
    }
    @media (max-width: 768px) {
      .page-content {
        padding: 16px;
      }
    }
  `]
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  isMobile = false;
  sidebarCollapsed = false;
  isLoading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private breakpointObserver: BreakpointObserver,
    private loadingService: LoadingService,
    private signalRService: SignalRService
  ) {}

  ngOnInit(): void {
    this.breakpointObserver
      .observe([Breakpoints.Handset, Breakpoints.TabletPortrait])
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.isMobile = result.matches;
        if (this.isMobile) {
          this.sidebarCollapsed = false;
        }
      });

    this.loadingService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.isLoading = loading);

    this.signalRService.startConnection();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.signalRService.stopConnection();
  }

  toggleSidenav(): void {
    this.sidenav.toggle();
  }

  toggleSidebarCollapse(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  onNavItemClicked(): void {
    if (this.isMobile) {
      this.sidenav.close();
    }
  }

  getContentMargin(): string {
    if (this.isMobile) return '0';
    return this.sidebarCollapsed ? '64px' : '260px';
  }
}
