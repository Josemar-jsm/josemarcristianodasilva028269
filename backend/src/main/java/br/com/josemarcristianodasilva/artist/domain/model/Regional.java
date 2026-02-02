package br.com.josemarcristianodasilva.artist.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "regional")
public class Regional {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "external_id", nullable = false)
    private Long externalId;

    @Column(name = "nome", nullable = false, length = 200)
    private String nome;

    @Column(name = "ativo", nullable = false)
    private boolean ativo = true;

    protected Regional() {}

    public Regional(Long externalId, String nome) {
        this.externalId = externalId;
        this.nome = nome;
        this.ativo = true;
    }

    public Long getId() { return id; }
    public Long getExternalId() { return externalId; }
    public String getNome() { return nome; }
    public boolean isAtivo() { return ativo; }

    public void inativar() { this.ativo = false; }
}
