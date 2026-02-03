package br.com.josemarcristianodasilva.artist.repository;

import br.com.josemarcristianodasilva.artist.domain.model.Album;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AlbumRepository extends JpaRepository<Album, Long> {

    @Override
    @EntityGraph(attributePaths = "artists")
    Page<Album> findAll(Pageable pageable);

    @EntityGraph(attributePaths = "artists")
    Page<Album> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = "artists")
    java.util.Optional<Album> findById(Long id);

    @Query("""
           select distinct al
           from Album al
           join al.artists ar
           where ar.id = :artistId
           order by al.id desc
           """)
    List<Album> findAllByArtistId(@Param("artistId") Long artistId);
}
