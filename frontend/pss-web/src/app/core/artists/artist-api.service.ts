import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PageResponse } from '../shared/page.model';
import { ArtistResponse } from './artist.model';

@Injectable({ providedIn: 'root' })
export class ArtistApiService {
  constructor(private http: HttpClient) {}

  list(name: string | null, page: number, size: number): Observable<PageResponse<ArtistResponse>> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('size', String(size))
      .set('sort', 'id,asc');

    if (name && name.trim().length > 0) {
      params = params.set('name', name.trim());
    }

    // IMPORTANTE: URL RELATIVA pra bater no Nginx /v1/
    return this.http.get<PageResponse<ArtistResponse>>('/v1/artists', { params });
  }
}
