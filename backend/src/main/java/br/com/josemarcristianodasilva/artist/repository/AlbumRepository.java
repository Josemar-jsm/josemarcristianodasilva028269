package br.com.josemarcristianodasilva.artist.repository;

import br.com.josemarcristianodasilva.artist.domain.model.Album;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlbumRepository extends JpaRepository<Album, Long> {

    @Override
    @EntityGraph(attributePaths = "artists")
    Page<Album> findAll(Pageable pageable);

    @EntityGraph(attributePaths = "artists")
    Page<Album> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = "artists")
    java.util.Optional<Album> findById(Long id);
}
