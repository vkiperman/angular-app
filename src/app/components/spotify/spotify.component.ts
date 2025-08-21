import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable, startWith, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { SpotifyArtistService } from './services/spotify-artist.service';

interface ArtistImage {
  url: string;
  height: number;
  width: number;
}
interface Artist {
  external_urls: {
    spotify: 'string';
  };
  followers: {
    href: 'string';
    total: number;
  };
  genres: string[];
  href: string;
  id: string;
  images: ArtistImage[];
  name: string;
  popularity: number;
  type: string;
  uri: string;
}

interface ArtistsForm {
  artist: string | null;
}
interface ArtistOption {
  label: string;
  value: string;
}

@Component({
  selector: 'spotify',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './spotify.component.html',
  styleUrl: './spotify.component.scss',
})
export class SpotifyComponent implements OnInit {
  private readonly svc = inject(SpotifyArtistService);
  artists$!: Observable<ArtistOption[]>;

  private fb = inject(FormBuilder);
  public form!: FormGroup;
  public form$!: Observable<ArtistsForm>;

  private http = inject(HttpClient);

  public data$!: Observable<Artist>;

  public ngOnInit(): void {
    this.form = this.fb.group<ArtistsForm>({
      artist: '',
    });
    this.form$ = this.form.valueChanges.pipe(
      tap((d) => this.handleFormChanges(d)),
      startWith(this.form.value),
    );

    this.artists$ = this.validate().pipe(
      tap((headers) => (this.svc.headers = headers)),
      switchMap(() =>
        this.svc.searchArtistsWithUserToken([
          'Boston',
          'Cake',
          'DEVO',
          'Led Zeppelin',
          'Pink Floyd',
          'Queen',
          'Queens of the Stone Age',
          'Rage Against The Machine',
          'Rush',
          'The Ventures',
          'Van Halen',
          'Yes',
          'alan white',
          'foghat',
          'jeff porcaro',
          'kiss',
          'radiohead',
          'run dmc',
          'spider',
          'steely dan',
          'stewart copeland',
          'the black keys',
          'the who',
          'thin lizzy',
          'white stripes',
          'zz top',
        ]),
      ),
    );
  }

  private handleFormChanges({ artist }: ArtistsForm) {
    const artists = `https://api.spotify.com/v1/artists/${artist}`;

    this.data$ = this.validate().pipe(
      switchMap(({ token_type, access_token }: any) => {
        const headers = new HttpHeaders({
          Authorization: `${token_type} ${access_token}`,
        });
        return this.http.get<Artist>(artists, { headers });
      }),
    );
  }

  private validate() {
    const url = 'https://accounts.spotify.com/api/token';
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    const params = {
      grant_type: 'client_credentials',
      client_id: environment.spotifyClientId,
      client_secret: environment.spotifyClientSecret,
    };
    return this.http.post<any>(url, null, { headers, params });
  }
}
