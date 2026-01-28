package br.com.josemarcristianodasilva.artist.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "artists")
public class Artist extends BaseAuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    protected Artist() {}

    public Artist(String name) {
        this.name = name;
    }

    public Long getId() { return id; }

    public String getName() { return name; }

    public void setName(String name) { this.name = name; }
}
