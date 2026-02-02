import { Injectable } from '@angular/core';
import { ApiHttp } from '../api/api.http';
import { AlbumResponse, PageResponse } from './album.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AlbumApi {
  constructor(private api: ApiHttp) {}

  list(params: { title?: string; page: number; size: number; sort?: string }): Observable<PageResponse<AlbumResponse>> {
    return this.api.get<PageResponse<AlbumResponse>>('/v1/albums', params);
  }
}
