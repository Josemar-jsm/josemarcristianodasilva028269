import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject } from 'rxjs';
import { AlbumCreatedEvent } from './album-events.model';

type WsState = {
  connected: boolean;
  lastError: string | null;
};

@Injectable({ providedIn: 'root' })
export class AlbumNotificationsService {
  private client: Client | null = null;

  private readonly _state$ = new BehaviorSubject<WsState>({
    connected: false,
    lastError: null,
  });
  readonly state$ = this._state$.asObservable();

  private readonly _events$ = new BehaviorSubject<AlbumCreatedEvent | null>(null);
  readonly events$ = this._events$.asObservable();

  connect(): void {
    if (this.client && this.client.connected) return;

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (str) => console.log('STOMP Debug:', str),
    });

    client.onConnect = () => {
      this._state$.next({ connected: true, lastError: null });

      client.subscribe('/topic/albums', (msg: IMessage) => {
        try {
          const data = JSON.parse(msg.body) as AlbumCreatedEvent;

          const eventType = data?.type?.toLowerCase();

          if (eventType === 'album.created') {
            this._events$.next(data);
          }
        } catch (e) {
          console.error('Erro ao processar payload do WebSocket:', e);
        }
      });
    };

    client.onStompError = (frame) => {
      this._state$.next({
        connected: false,
        lastError: frame.headers['message'] ?? 'STOMP error'
      });
    };

    client.onWebSocketError = () => {
      this._state$.next({ connected: false, lastError: 'WebSocket connection error' });
    };

    client.onDisconnect = () => {
      this._state$.next({ connected: false, lastError: null });
    };

    this.client = client;
    client.activate();
  }

  disconnect(): void {
    if (!this.client) return;
    this.client.deactivate();
    this.client = null;
    this._state$.next({ connected: false, lastError: null });
  }
}
