type UserProfile = {
  country: string;
  display_name: string;
  email: string;
  explicit_content: {
    filter_enabled: boolean;
    filter_locked: boolean;
  };
  external_urls: { spotify: string };
  followers: { href: string; total: number };
  href: string;
  id: string;
  images: {
    url: string;
    height: number;
    width: number;
  }[];
  product: string;
  type: string;
  uri: string;
};

type TokenResponse = {
  access_token: string;
  refresh_token: string;
};

type Playlist = {
  name: string;
  id: string;
};

type PlaylistRequest = {
  items: Playlist[];
};

type PlaylistSong = {
  items: Song[];
};

type CategoriesRequest = {
  categories: {
    items: Category[];
  };
};

type Category = {
  id: string;
  name: string;
  icons?: Icons[];
};

type Icons = {
  url: string;
};

type TrackIdRequest = {
  album: {
    images: [{ url: string }];
    genres: string[];
  };
  artists: [name: string];
  name: string;
  duration_ms: number;
};

type TrackSearchRequest = {
  tracks: {
    items: [
      {
        album: {
          images: [
            {
              url: string;
            }
          ];
          name: string;
        };
        artists: [name: string];
      }
    ];
    duration_ms: number;
    name: string;
  };
};
