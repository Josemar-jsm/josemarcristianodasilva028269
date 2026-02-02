package br.com.josemarcristianodasilva.artist.api.controller;

import br.com.josemarcristianodasilva.artist.api.dto.RegionalResponse;
import br.com.josemarcristianodasilva.artist.service.RegionalSyncService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Regionais", description = "Sincronização das regionais externas para base local")
@RestController
@RequestMapping("/v1/regionais")
public class RegionalController {

    private final RegionalSyncService service;

    public RegionalController(RegionalSyncService service) {
        this.service = service;
    }

    @Operation(summary = "Sincronizar regionais", description = "Sincroniza do endpoint externo aplicando as seguintes regras : Novo no endpoint → inserir na tabela local;\n" +
            "2) Não disponível no endpoint → inativar na tabela local;\n" +
            "3) Qualquer atributo alterado → inativar registro anterior e criar novo com nova denominação.")
    @PostMapping("/sync")
    public ResponseEntity<Void> sync() {
        service.sync();
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Listar regionais ativas", description = "Retorna apenas registros com ativo=true.")
    @GetMapping
    public List<RegionalResponse> listAtivas() {
        return service.listAtivas().stream()
                .map(r -> new RegionalResponse(r.getId(), r.getExternalId(), r.getNome()))
                .toList();
    }
}
