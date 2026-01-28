package br.com.josemarcristianodasilva.artist.service;

import br.com.josemarcristianodasilva.artist.domain.model.Artist;
import br.com.josemarcristianodasilva.artist.repository.ArtistRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ArtistService {

    private final ArtistRepository repository;

    public ArtistService(ArtistRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public Page<Artist> list(String name, Pageable pageable) {
        if (name == null || name.isBlank()) {
            return repository.findAll(pageable);
        }
        return repository.findByNameContainingIgnoreCase(name, pageable);
    }

    @Transactional(readOnly = true)
    public Artist getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Artist not found: " + id));
    }

    @Transactional
    public Artist create(String name) {
        return repository.save(new Artist(name));
    }

    @Transactional
    public Artist update(Long id, String name) {
        var artist = getById(id);
        artist.setName(name);
        return repository.save(artist);
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new IllegalArgumentException("Artist not found: " + id);
        }
        repository.deleteById(id);
    }
}
