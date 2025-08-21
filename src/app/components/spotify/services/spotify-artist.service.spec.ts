import { TestBed } from '@angular/core/testing';

import { SpotifyArtistService } from './spotify-artist.service';

describe('SpotifyArtistService', () => {
  let service: SpotifyArtistService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpotifyArtistService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
