import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, filter, takeUntil, timer } from 'rxjs';
import { AlbumNotificationsService } from '../../core/ws/album-notifications.service';

type Toast = {
  id: string;
  title: string;
  message: string;
  link?: string;
};

@Component({
  selector: 'app-toast-center',
  standalone: true,
  imports: [CommonModule, RouterModule], // Adicionado RouterModule
  template: `
    <div class="fixed top-4 right-4 z-50 w-[92vw] max-w-sm space-y-3">

      <div
        *ngFor="let t of toasts; trackBy: trackById"
        class="relative overflow-hidden bg-slate-900/60 backdrop-blur-md text-white rounded-2xl shadow-2xl p-4 border border-white/10 transition-all duration-500 animate-in fade-in slide-in-from-right-10"
      >
        <div class="flex items-start gap-3">
          <div class="bg-blue-500/20 p-2 rounded-lg">
            <span class="text-blue-400">💿</span>
          </div>

          <div class="flex-1">
            <div class="flex justify-between items-center">
              <span class="text-[10px] font-bold uppercase tracking-widest text-blue-400/80">
                Via WebSockets
              </span>
              <button
                (click)="removeToast(t.id)"
                class="text-white/30 hover:text-white transition-colors p-1"
              >
                ✕
              </button>
            </div>

            <div class="font-semibold mt-0.5 text-white/95">{{ t.title }}</div>
            <div class="text-sm text-white/70 leading-relaxed">{{ t.message }}</div>

            <a
              *ngIf="t.link"
              class="inline-flex items-center gap-1 mt-3 text-xs font-bold uppercase tracking-tighter text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
              [routerLink]="t.link"
            >
              Ver Detalhes
              <span class="text-[10px]">→</span>
            </a>
          </div>
        </div>

        <div class="absolute bottom-0 left-0 h-0.5 bg-blue-500/40 w-full animate-shrink"></div>
      </div>
    </div>
  `,
  styles: [`
    .animate-shrink {
      animation: shrink 5s linear forwards;
    }
    @keyframes shrink {
      from { width: 100%; }
      to { width: 0%; }
    }
  `]
})
export class ToastCenterComponent implements OnInit, OnDestroy {
  private ws = inject(AlbumNotificationsService);
  private destroy$ = new Subject<void>();

  toasts: Toast[] = [];

  ngOnInit(): void {
    this.ws.connect();

    this.ws.events$
      .pipe(
        takeUntil(this.destroy$),
        filter((e): e is NonNullable<typeof e> => !!e)
      )
      .subscribe((evt) => {
        const id = crypto.randomUUID();
        const toast: Toast = {
          id,
          title: 'Novo álbum cadastrado (Websocket)',
          message: `${evt.title}`,
          link: `/albums`,
        };

        this.toasts = [toast, ...this.toasts].slice(0, 3);

        timer(5000)
          .pipe(takeUntil(this.destroy$))
          .subscribe(() => {
            this.removeToast(id);
          });
      });
  }

  removeToast(id: string): void {
    this.toasts = this.toasts.filter((t) => t.id !== id);
  }

  trackById(index: number, item: Toast): string {
    return item.id;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
