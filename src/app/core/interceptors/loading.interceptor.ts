import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private activeRequests = 0;

  constructor(private loadingService: LoadingService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (this.shouldSkipLoading(request)) {
      return next.handle(request);
    }

    if (this.activeRequests === 0) {
      this.loadingService.show('http');
    }
    this.activeRequests++;

    return next.handle(request).pipe(
      finalize(() => {
        this.activeRequests--;
        if (this.activeRequests === 0) {
          this.loadingService.hide('http');
        }
      })
    );
  }

  private shouldSkipLoading(request: HttpRequest<unknown>): boolean {
    const skipUrls = [
      '/notifications/unread-count',
      '/signalr'
    ];
    return skipUrls.some(url => request.url.includes(url));
  }
}
