package br.com.josemarcristianodasilva.artist.repository;

import br.com.josemarcristianodasilva.artist.domain.model.Album;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlbumRepository extends JpaRepository<Album, Long> {
    Page<Album> findByTitleContainingIgnoreCase(String title, Pageable pageable);
}
