package br.com.josemarcristianodasilva.artist.domain.model;

import br.com.josemarcristianodasilva.artist.domain.BaseAuditableEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "artists")
public class Artist extends BaseAuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @JsonIgnore
    @ManyToMany(mappedBy = "artists")
    private Set<Album> albums = new HashSet<>();

    protected Artist() {}

    public Artist(String name) {
        this.name = name;
    }

    public Long getId() { return id; }

    public String getName() { return name; }

    public void setName(String name) { this.name = name; }

    public Set<Album> getAlbums() { return albums; }
}
