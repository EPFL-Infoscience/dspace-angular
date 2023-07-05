import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaPlayerPlaylistComponent } from './media-player-playlist.component';

describe('MediaPlayerPlaylistComponent', () => {
  let component: MediaPlayerPlaylistComponent;
  let fixture: ComponentFixture<MediaPlayerPlaylistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MediaPlayerPlaylistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaPlayerPlaylistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
