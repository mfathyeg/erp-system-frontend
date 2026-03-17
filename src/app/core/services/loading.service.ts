import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private loadingMap = new Map<string, boolean>();

  public loading$: Observable<boolean> = this.loadingSubject.asObservable();

  show(key: string = 'global'): void {
    this.loadingMap.set(key, true);
    this.updateLoadingState();
  }

  hide(key: string = 'global'): void {
    this.loadingMap.delete(key);
    this.updateLoadingState();
  }

  isLoading(key: string = 'global'): boolean {
    return this.loadingMap.get(key) ?? false;
  }

  private updateLoadingState(): void {
    this.loadingSubject.next(this.loadingMap.size > 0);
  }
}
