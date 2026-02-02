package br.com.josemarcristianodasilva.artist.repository;

import br.com.josemarcristianodasilva.artist.domain.model.Regional;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RegionalRepository extends JpaRepository<Regional, Long> {

    List<Regional> findByAtivoTrue();

    Optional<Regional> findByExternalIdAndAtivoTrue(Long externalId);
}
