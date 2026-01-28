package br.com.josemarcristianodasilva.artist.domain.model;

import br.com.josemarcristianodasilva.artist.domain.BaseAuditableEntity;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "albums")
public class Album extends BaseAuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "cover_object_key", length = 255)
    private String coverObjectKey;

    @ManyToMany
    @JoinTable(
            name = "artist_album",
            joinColumns = @JoinColumn(name = "album_id"),
            inverseJoinColumns = @JoinColumn(name = "artist_id")
    )
    private Set<Artist> artists = new HashSet<>();

    protected Album() {}

    public Album(String title) {
        this.title = title;
    }

    public Long getId() { return id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCoverObjectKey() { return coverObjectKey; }
    public void setCoverObjectKey(String coverObjectKey) { this.coverObjectKey = coverObjectKey; }

    public Set<Artist> getArtists() { return artists; }

    public void addArtist(Artist artist) { this.artists.add(artist); }
    public void removeArtist(Artist artist) { this.artists.remove(artist); }
}
