package br.com.josemarcristianodasilva.artist.service;

import br.com.josemarcristianodasilva.artist.api.dto.RegionalExternalDTO;
import br.com.josemarcristianodasilva.artist.domain.model.Regional;
import br.com.josemarcristianodasilva.artist.repository.RegionalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class RegionalSyncService {

    private final RegionalRepository repository;
    private final RestTemplate restTemplate;

    private static final String URL = "https://integrador-argus-api.geia.vip/v1/regionais";

    public RegionalSyncService(RegionalRepository repository) {
        this.repository = repository;
        this.restTemplate = new RestTemplate();
    }
    @Transactional
    public void sync() {

        RegionalExternalDTO[] externosArr = restTemplate.getForObject(URL, RegionalExternalDTO[].class);
        List<RegionalExternalDTO> externos = (externosArr == null) ? List.of() : Arrays.asList(externosArr);

        Map<Long, RegionalExternalDTO> externalMap = externos.stream()
                .filter(dto -> dto != null && dto.id() != null && dto.nome() != null)
                .collect(Collectors.toMap(
                        RegionalExternalDTO::id,
                        dto -> dto,
                        (a, b) -> a
                ));

        List<Regional> locaisAtivos = repository.findByAtivoTrue();

        Map<Long, Regional> localMap = locaisAtivos.stream()
                .filter(r -> r.getExternalId() != null)
                .collect(Collectors.toMap(
                        Regional::getExternalId,
                        r -> r,
                        (a, b) -> a
                ));

        for (RegionalExternalDTO ext : externalMap.values()) {
            Regional local = localMap.get(ext.id());

            if (local == null) {
                repository.save(new Regional(ext.id(), ext.nome()));
                continue;
            }
            if (!Objects.equals(local.getNome(), ext.nome())) {
                local.inativar();
                repository.save(local);

                repository.save(new Regional(ext.id(), ext.nome()));
            }
        }
        for (Regional local : locaisAtivos) {
            Long extId = local.getExternalId();
            if (extId == null || !externalMap.containsKey(extId)) {
                local.inativar();
                repository.save(local);
            }
        }
    }

    @Transactional(readOnly = true)
    public List<Regional> listAtivas() {
        return repository.findByAtivoTrue();
    }
}
