// src/app/services/spotify-artist.service.ts
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, of } from 'rxjs';

export interface ArtistOption {
  label: string; // artist name
  value: string; // spotify artist id
}

@Injectable({ providedIn: 'root' })
export class SpotifyArtistService {
  private readonly http = inject(HttpClient);

  private _headers!: HttpHeaders;
  public set headers({ token_type, access_token }: any) {
    this._headers = new HttpHeaders({
      Authorization: `${token_type} ${access_token}`,
    });
  }
  public get headers() {
    return this._headers;
  }

  /**
   * Base URL of your backend route that proxies Spotify.
   * Example (Next.js route from earlier): /api/spotify-artists
   * You can also inject this via an Angular environment token if you prefer.
   */
  private readonly apiUrl = '/api/spotify-artists';

  public searchArtistsWithUserToken(
    queries: string[],
  ): Observable<ArtistOption[]> {
    if (!queries?.length) return of([]);

    const requests = queries.map((q) => {
      const params = new HttpParams()
        .set('q', q)
        .set('type', 'artist')
        .set('limit', '1');
      return this.http.get<any>('https://api.spotify.com/v1/search', {
        params,
        headers: this.headers,
      });
    });

    // Merge and normalize client-side
    return forkJoin(requests).pipe(
      map((res: any | any[]) => {
        const mapById = new Map<string, string>();
        (Array.isArray(res)
          ? res.flatMap((r) => r?.artists?.items ?? [])
          : (res?.artists?.items ?? [])
        ).forEach((a: any) => {
          if (a?.id && a?.name) mapById.set(a.id, a.name);
        });
        return [...mapById.entries()]
          .map(([value, label]) => ({ value, label }))
          .sort((a, b) => a.label.localeCompare(b.label));
      }),
    );
  }
}
