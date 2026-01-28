package br.com.josemarcristianodasilva.artist.service;

import br.com.josemarcristianodasilva.artist.domain.model.Album;
import br.com.josemarcristianodasilva.artist.repository.AlbumRepository;
import br.com.josemarcristianodasilva.artist.repository.ArtistRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
public class AlbumService {

    private final AlbumRepository albumRepository;
    private final ArtistRepository artistRepository;

    public AlbumService(AlbumRepository albumRepository, ArtistRepository artistRepository) {
        this.albumRepository = albumRepository;
        this.artistRepository = artistRepository;
    }

    @Transactional(readOnly = true)
    public Page<Album> list(String title, Pageable pageable) {
        if (title == null || title.isBlank()) {
            return albumRepository.findAll(pageable);
        }
        return albumRepository.findByTitleContainingIgnoreCase(title, pageable);
    }

    @Transactional(readOnly = true)
    public Album getById(Long id) {
        return albumRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Album not found: " + id));
    }

    @Transactional
    public Album create(String title, Set<Long> artistIds) {
        var album = new Album(title);
        applyArtists(album, artistIds);
        return albumRepository.save(album);
    }

    @Transactional
    public Album update(Long id, String title, Set<Long> artistIds) {
        var album = getById(id);
        album.setTitle(title);
        applyArtists(album, artistIds);
        return albumRepository.save(album);
    }

    @Transactional
    public void delete(Long id) {
        if (!albumRepository.existsById(id)) {
            throw new IllegalArgumentException("Album not found: " + id);
        }
        albumRepository.deleteById(id);
    }

    private void applyArtists(Album album, Set<Long> artistIds) {
        album.getArtists().clear();

        if (artistIds == null || artistIds.isEmpty()) {
            return;
        }

        var artists = new HashSet<>(artistRepository.findAllById(artistIds));
        if (artists.size() != artistIds.size()) {
            throw new IllegalArgumentException("One or more artistIds are invalid.");
        }
        album.getArtists().addAll(artists);
    }
}
