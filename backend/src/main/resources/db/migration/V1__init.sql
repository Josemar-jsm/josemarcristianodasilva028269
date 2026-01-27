create table artists (
  id bigserial primary key,
  name varchar(150) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table albums (
  id bigserial primary key,
  title varchar(200) not null,
  cover_object_key varchar(255),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table artist_album (
  artist_id bigint not null references artists(id) on delete cascade,
  album_id bigint not null references albums(id) on delete cascade,
  primary key (artist_id, album_id)
);

create index idx_artists_name on artists(name);
create index idx_albums_title on albums(title);

