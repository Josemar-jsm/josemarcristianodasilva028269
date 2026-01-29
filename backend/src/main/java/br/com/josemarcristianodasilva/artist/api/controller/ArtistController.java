package br.com.josemarcristianodasilva.artist.api.controller;

import br.com.josemarcristianodasilva.artist.api.dto.ArtistCreateRequest;
import br.com.josemarcristianodasilva.artist.api.dto.ArtistMapper;
import br.com.josemarcristianodasilva.artist.api.dto.ArtistResponse;
import br.com.josemarcristianodasilva.artist.api.dto.ArtistUpdateRequest;
import br.com.josemarcristianodasilva.artist.service.ArtistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

@Tag(name = "Artists", description = "Artist management endpoints")
@RestController
@RequestMapping("/v1/artists")
public class ArtistController {

    private final ArtistService service;

    public ArtistController(ArtistService service) {
        this.service = service;
    }

    @Operation(
            summary = "List artists",
            description = "Returns a paginated list of artists, optionally filtered by name."
    )
    @ApiResponse(responseCode = "200", description = "OK")
    @GetMapping
    public Page<ArtistResponse> list(
            @Parameter(description = "Filter by artist name (optional)")
            @RequestParam(required = false) String name,

            @Parameter(description = "Pagination parameters")
            @PageableDefault(size = 10) Pageable pageable
    ) {
        return service.list(name, pageable).map(ArtistMapper::toResponse);
    }

    @Operation(
            summary = "Get artist by id",
            description = "Returns a single artist by its id."
    )
    @ApiResponse(responseCode = "200", description = "Artist found",
            content = @Content(schema = @Schema(implementation = ArtistResponse.class)))
    @ApiResponse(responseCode = "404", description = "Artist not found",
            content = @Content(schema = @Schema(implementation = org.springframework.http.ProblemDetail.class)))
    @GetMapping("/{id}")
    public ArtistResponse get(
            @Parameter(description = "Artist id", example = "1")
            @PathVariable Long id
    ) {
        return ArtistMapper.toResponse(service.getById(id));
    }

    @Operation(
            summary = "Create artist",
            description = "Creates a new artist and returns it.",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    description = "Artist data",
                    content = @Content(schema = @Schema(implementation = ArtistCreateRequest.class))
            )
    )
    @ApiResponse(responseCode = "201", description = "Artist created",
            content = @Content(schema = @Schema(implementation = ArtistResponse.class)))
    @ApiResponse(responseCode = "400", description = "Validation error",
            content = @Content(schema = @Schema(implementation = org.springframework.http.ProblemDetail.class)))
    @PostMapping
    public ResponseEntity<ArtistResponse> create(
            @Valid @org.springframework.web.bind.annotation.RequestBody ArtistCreateRequest req,
            UriComponentsBuilder uri
    ) {
        var saved = service.create(req.name());
        var location = uri.path("/v1/artists/{id}")
                .buildAndExpand(saved.getId()).toUri();

        return ResponseEntity.created(location)
                .body(ArtistMapper.toResponse(saved));
    }

    @Operation(
            summary = "Update artist",
            description = "Updates an existing artist.",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    description = "Updated artist data",
                    content = @Content(schema = @Schema(implementation = ArtistUpdateRequest.class))
            )
    )
    @ApiResponse(responseCode = "200", description = "Artist updated",
            content = @Content(schema = @Schema(implementation = ArtistResponse.class)))
    @ApiResponse(responseCode = "400", description = "Validation error",
            content = @Content(schema = @Schema(implementation = org.springframework.http.ProblemDetail.class)))
    @ApiResponse(responseCode = "404", description = "Artist not found",
            content = @Content(schema = @Schema(implementation = org.springframework.http.ProblemDetail.class)))
    @PutMapping("/{id}")
    public ArtistResponse update(
            @Parameter(description = "Artist id", example = "1")
            @PathVariable Long id,

            @Valid @org.springframework.web.bind.annotation.RequestBody ArtistUpdateRequest req
    ) {
        return ArtistMapper.toResponse(service.update(id, req.name()));
    }

    @Operation(
            summary = "Delete artist",
            description = "Deletes an artist by id."
    )
    @ApiResponse(responseCode = "204", description = "Artist deleted")
    @ApiResponse(responseCode = "404", description = "Artist not found",
            content = @Content(schema = @Schema(implementation = org.springframework.http.ProblemDetail.class)))
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @Parameter(description = "Artist id", example = "1")
            @PathVariable Long id
    ) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
