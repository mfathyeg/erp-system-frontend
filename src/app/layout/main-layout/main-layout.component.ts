import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { Subject, takeUntil } from 'rxjs';
import { LoadingService } from '../../core/services/loading.service';
import { SignalRService } from '../../core/services/signalr.service';

@Component({
  selector: 'app-main-layout',
  template: `
    <div class="layout-wrapper">
      <app-navbar (toggleMenu)="toggleSidenav()"></app-navbar>

      <div class="layout-container">
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

          <mat-sidenav-content class="main-content" [style.margin-right]="getContentMargin()">
            <!-- Loading Bar -->
            <div class="loading-bar" *ngIf="isLoading">
              <div class="loading-progress"></div>
            </div>

            <div class="page-wrapper">
              <router-outlet></router-outlet>
            </div>
          </mat-sidenav-content>
        </mat-sidenav-container>
      </div>
    </div>
  `,
  styles: [`
    .layout-wrapper {
      min-height: 100vh;
      background: var(--primary-bg);
    }

    .layout-container {
      padding-top: 70px;
      min-height: calc(100vh - 70px);
    }

    .sidenav-container {
      min-height: calc(100vh - 70px);
      background: transparent;
    }

    .sidenav {
      background: transparent;
      border: none;
    }

    .main-content {
      background: var(--primary-bg);
      min-height: calc(100vh - 70px);
      transition: margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .page-wrapper {
      padding: 24px;
      max-width: 1600px;
      margin: 0 auto;
    }

    .loading-bar {
      position: fixed;
      top: 70px;
      left: 0;
      right: 0;
      height: 3px;
      background: var(--border-color);
      z-index: 999;
      overflow: hidden;
    }

    .loading-progress {
      height: 100%;
      width: 30%;
      background: var(--gradient-primary);
      animation: loading 1.5s ease-in-out infinite;
    }

    @keyframes loading {
      0% {
        transform: translateX(-100%);
      }
      50% {
        transform: translateX(200%);
      }
      100% {
        transform: translateX(-100%);
      }
    }

    @media (max-width: 768px) {
      .page-wrapper {
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
    return this.sidebarCollapsed ? '80px' : '280px';
  }
}
