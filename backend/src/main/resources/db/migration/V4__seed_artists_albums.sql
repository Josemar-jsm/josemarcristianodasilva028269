-- ==========================================
-- Seed: 10 artists (5 BR + 5 estrangeiros),
-- 10 albums e relacionamento artist_album
-- Cada artista -> 2 albums
-- Idempotente (não duplica)
-- ==========================================

-- 1) ARTISTS (5 BR + 5 estrangeiros)
INSERT INTO artists (name)
SELECT v.name
FROM (
  VALUES
    -- Brasileiros (5)
    ('Djavan'),
    ('Anitta'),
    ('Gilberto Gil'),
    ('Legião Urbana'),
    ('Ivete Sangalo'),

    -- Estrangeiros (5)
    ('Daft Punk'),
    ('Radiohead'),
    ('Beyoncé'),
    ('Coldplay'),
    ('Eminem')
) AS v(name)
WHERE NOT EXISTS (
  SELECT 1 FROM artists a WHERE a.name = v.name
);

INSERT INTO albums (title)
SELECT v.title
FROM (
  VALUES
    ('Discovery'),
    ('Random Access Memories'),
    ('OK Computer'),
    ('A Rush of Blood to the Head'),
    ('The Marshall Mathers LP'),
    ('Lemonade'),
    ('Dois'),
    ('Refazenda'),
    ('Coisa de Acender'),
    ('Luz')
) AS v(title)
WHERE NOT EXISTS (
  SELECT 1 FROM albums al WHERE al.title = v.title
);

-- Daft Punk -> Discovery, Random Access Memories
INSERT INTO artist_album (artist_id, album_id)
SELECT a.id, al.id
FROM artists a
JOIN albums al ON al.title IN ('Discovery','Random Access Memories')
WHERE a.name = 'Daft Punk'
  AND NOT EXISTS (
    SELECT 1 FROM artist_album x
    WHERE x.artist_id = a.id AND x.album_id = al.id
  );

-- Radiohead -> OK Computer, Discovery
INSERT INTO artist_album (artist_id, album_id)
SELECT a.id, al.id
FROM artists a
JOIN albums al ON al.title IN ('OK Computer','Discovery')
WHERE a.name = 'Radiohead'
  AND NOT EXISTS (
    SELECT 1 FROM artist_album x
    WHERE x.artist_id = a.id AND x.album_id = al.id
  );

-- Beyoncé -> Lemonade, Random Access Memories
INSERT INTO artist_album (artist_id, album_id)
SELECT a.id, al.id
FROM artists a
JOIN albums al ON al.title IN ('Lemonade','Random Access Memories')
WHERE a.name = 'Beyoncé'
  AND NOT EXISTS (
    SELECT 1 FROM artist_album x
    WHERE x.artist_id = a.id AND x.album_id = al.id
  );

-- Coldplay -> A Rush of Blood to the Head, OK Computer
INSERT INTO artist_album (artist_id, album_id)
SELECT a.id, al.id
FROM artists a
JOIN albums al ON al.title IN ('A Rush of Blood to the Head','OK Computer')
WHERE a.name = 'Coldplay'
  AND NOT EXISTS (
    SELECT 1 FROM artist_album x
    WHERE x.artist_id = a.id AND x.album_id = al.id
  );

-- Eminem -> The Marshall Mathers LP, A Rush of Blood to the Head
INSERT INTO artist_album (artist_id, album_id)
SELECT a.id, al.id
FROM artists a
JOIN albums al ON al.title IN ('The Marshall Mathers LP','A Rush of Blood to the Head')
WHERE a.name = 'Eminem'
  AND NOT EXISTS (
    SELECT 1 FROM artist_album x
    WHERE x.artist_id = a.id AND x.album_id = al.id
  );

-- Djavan -> Luz, Refazenda
INSERT INTO artist_album (artist_id, album_id)
SELECT a.id, al.id
FROM artists a
JOIN albums al ON al.title IN ('Luz','Refazenda')
WHERE a.name = 'Djavan'
  AND NOT EXISTS (
    SELECT 1 FROM artist_album x
    WHERE x.artist_id = a.id AND x.album_id = al.id
  );

-- Anitta -> Coisa de Acender, Lemonade
INSERT INTO artist_album (artist_id, album_id)
SELECT a.id, al.id
FROM artists a
JOIN albums al ON al.title IN ('Coisa de Acender','Lemonade')
WHERE a.name = 'Anitta'
  AND NOT EXISTS (
    SELECT 1 FROM artist_album x
    WHERE x.artist_id = a.id AND x.album_id = al.id
  );

-- Gilberto Gil -> Refazenda, Dois
INSERT INTO artist_album (artist_id, album_id)
SELECT a.id, al.id
FROM artists a
JOIN albums al ON al.title IN ('Refazenda','Dois')
WHERE a.name = 'Gilberto Gil'
  AND NOT EXISTS (
    SELECT 1 FROM artist_album x
    WHERE x.artist_id = a.id AND x.album_id = al.id
  );

-- Legião Urbana -> Dois, Luz
INSERT INTO artist_album (artist_id, album_id)
SELECT a.id, al.id
FROM artists a
JOIN albums al ON al.title IN ('Dois','Luz')
WHERE a.name = 'Legião Urbana'
  AND NOT EXISTS (
    SELECT 1 FROM artist_album x
    WHERE x.artist_id = a.id AND x.album_id = al.id
  );

-- Ivete Sangalo -> Coisa de Acender, A Rush of Blood to the Head
INSERT INTO artist_album (artist_id, album_id)
SELECT a.id, al.id
FROM artists a
JOIN albums al ON al.title IN ('Coisa de Acender','A Rush of Blood to the Head')
WHERE a.name = 'Ivete Sangalo'
  AND NOT EXISTS (
    SELECT 1 FROM artist_album x
    WHERE x.artist_id = a.id AND x.album_id = al.id
  );
