import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';
import { ApiError } from '../models';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private notificationService: NotificationService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unexpected error occurred';

        if (error.error instanceof ErrorEvent) {
          errorMessage = error.error.message;
        } else {
          switch (error.status) {
            case 0:
              errorMessage = 'Unable to connect to the server. Please check your internet connection.';
              break;
            case 400:
              errorMessage = this.handleBadRequest(error);
              break;
            case 401:
              errorMessage = 'Your session has expired. Please log in again.';
              break;
            case 403:
              errorMessage = 'You do not have permission to perform this action.';
              break;
            case 404:
              errorMessage = 'The requested resource was not found.';
              break;
            case 409:
              errorMessage = error.error?.message || 'A conflict occurred. Please refresh and try again.';
              break;
            case 422:
              errorMessage = this.handleValidationError(error);
              break;
            case 500:
              errorMessage = 'An internal server error occurred. Please try again later.';
              break;
            case 503:
              errorMessage = 'The service is temporarily unavailable. Please try again later.';
              break;
            default:
              errorMessage = error.error?.message || `Error: ${error.status} - ${error.statusText}`;
          }
        }

        this.notificationService.showError(errorMessage);

        const apiError: ApiError = {
          message: errorMessage,
          errors: error.error?.errors,
          statusCode: error.status
        };

        return throwError(() => apiError);
      })
    );
  }

  private handleBadRequest(error: HttpErrorResponse): string {
    if (error.error?.errors) {
      const errors = error.error.errors;
      const messages = Object.keys(errors)
        .map(key => errors[key])
        .flat();
      return messages.join(', ');
    }
    return error.error?.message || 'Invalid request. Please check your input.';
  }

  private handleValidationError(error: HttpErrorResponse): string {
    if (error.error?.errors) {
      const errors = error.error.errors;
      const messages = Object.keys(errors)
        .map(key => `${key}: ${errors[key].join(', ')}`)
        .join('; ');
      return messages;
    }
    return error.error?.message || 'Validation failed. Please check your input.';
  }
}
