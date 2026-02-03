package br.com.josemarcristianodasilva.artist.repository;

import br.com.josemarcristianodasilva.artist.domain.model.Artist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ArtistRepository extends JpaRepository<Artist, Long> {

    Page<Artist> findByNameContainingIgnoreCase(String name, Pageable pageable);

    interface ArtistWithAlbumCount {
        Long getId();

        String getName();

        long getAlbumCount();
    }

    @Query(value = """
               select a.id as id,
                      a.name as name,
                      count(distinct aa.album_id) as albumCount
               from artists a
               left join artist_album aa on aa.artist_id = a.id
               where (:name is null or a.name ilike ('%' || :name || '%'))
               group by a.id, a.name
            """, nativeQuery = true)
    Page<ArtistWithAlbumCount> findWithAlbumCount(@Param("name") String name, Pageable pageable);

}
