package br.com.josemarcristianodasilva.artist.api.controller;

import br.com.josemarcristianodasilva.artist.api.dto.*;
import br.com.josemarcristianodasilva.artist.service.AlbumService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Albums", description = "Album management endpoints")
@RestController
@RequestMapping("/v1/albums")
public class AlbumController {

    private final AlbumService service;

    public AlbumController(AlbumService service) {
        this.service = service;
    }
    @Operation(
            summary = "List albums",
            description = "Returns a paginated list of albums, optionally filtered by title."
    )
    @ApiResponse(responseCode = "200", description = "OK")
    @GetMapping
    public Page<AlbumResponse> list(
            @Parameter(description = "Filter by title (optional)")
            @RequestParam(required = false) String title,

            @Parameter(description = "Pagination parameters")
            @PageableDefault(size = 10) Pageable pageable
    ) {
        return service.list(title, pageable);
    }
    @Operation(
            summary = "Get album by id",
            description = "Returns a single album by its id."
    )
    @ApiResponse(responseCode = "200", description = "Album found",
            content = @Content(schema = @Schema(implementation = AlbumResponse.class)))
    @ApiResponse(responseCode = "404", description = "Album not found",
            content = @Content(schema = @Schema(implementation = org.springframework.http.ProblemDetail.class)))
    @GetMapping("/{id}")
    public AlbumResponse get(
            @Parameter(description = "Album id", example = "1")
            @PathVariable Long id
    ) {
        return service.getById(id);
    }
    @Operation(
            summary = "Create album",
            description = "Creates a new album and returns it.",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    description = "Album data",
                    content = @Content(schema = @Schema(implementation = AlbumCreateRequest.class))
            )
    )
    @ApiResponse(responseCode = "201", description = "Album created",
            content = @Content(schema = @Schema(implementation = AlbumResponse.class)))
    @ApiResponse(responseCode = "400", description = "Validation error",
            content = @Content(schema = @Schema(implementation = org.springframework.http.ProblemDetail.class)))
    @PostMapping
    public ResponseEntity<AlbumResponse> create(
            @Valid @org.springframework.web.bind.annotation.RequestBody AlbumCreateRequest req,
            UriComponentsBuilder uri
    ) {
        var saved = service.create(req.title(), req.artistIds());
        var location = uri.path("/v1/albums/{id}")
                .buildAndExpand(saved.getId()).toUri();

        return ResponseEntity.created(location)
                .body(service.getById(saved.getId()));
    }
    @Operation(
            summary = "Update album",
            description = "Updates an existing album.",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    description = "Updated album data",
                    content = @Content(schema = @Schema(implementation = AlbumUpdateRequest.class))
            )
    )
    @ApiResponse(responseCode = "200", description = "Album updated",
            content = @Content(schema = @Schema(implementation = AlbumResponse.class)))
    @ApiResponse(responseCode = "404", description = "Album not found",
            content = @Content(schema = @Schema(implementation = org.springframework.http.ProblemDetail.class)))
    @PutMapping("/{id}")
    public AlbumResponse update(
            @Parameter(description = "Album id", example = "1")
            @PathVariable Long id,

            @Valid @org.springframework.web.bind.annotation.RequestBody AlbumUpdateRequest req
    ) {
        service.update(id, req.title(), req.artistIds());
        return service.getById(id);
    }
    @Operation(
            summary = "Delete album",
            description = "Deletes an album by id."
    )
    @ApiResponse(responseCode = "204", description = "Album deleted")
    @ApiResponse(responseCode = "404", description = "Album not found",
            content = @Content(schema = @Schema(implementation = org.springframework.http.ProblemDetail.class)))
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @Parameter(description = "Album id", example = "1")
            @PathVariable Long id
    ) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
    @Operation(
            summary = "Upload album cover",
            description = "Uploads a cover image (jpeg/png/webp) to MinIO and returns a presigned URL."
    )
    @ApiResponse(responseCode = "200", description = "Cover uploaded",
            content = @Content(schema = @Schema(implementation = AlbumCoverResponse.class)))
    @ApiResponse(responseCode = "400", description = "Invalid file",
            content = @Content(schema = @Schema(implementation = org.springframework.http.ProblemDetail.class)))
    @ApiResponse(responseCode = "404", description = "Album not found",
            content = @Content(schema = @Schema(implementation = org.springframework.http.ProblemDetail.class)))
    @PostMapping(
            value = "/{id}/cover",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<AlbumCoverResponse> uploadCover(
            @Parameter(description = "Album id", example = "1")
            @PathVariable Long id,

            @Parameter(
                    description = "Cover image file",
                    required = true,
                    schema = @Schema(type = "string", format = "binary")
            )
            @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.ok(service.uploadCover(id, file));
    }
    @Operation(
            summary = "Get album cover URL",
            description = "Returns a presigned URL for the album cover."
    )
    @ApiResponse(responseCode = "200", description = "OK",
            content = @Content(schema = @Schema(implementation = String.class)))
    @ApiResponse(responseCode = "404", description = "Album or cover not found",
            content = @Content(schema = @Schema(implementation = org.springframework.http.ProblemDetail.class)))
    @GetMapping("/{id}/cover-url")
    public ResponseEntity<String> getCoverUrl(
            @Parameter(description = "Album id", example = "1")
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(service.getCoverUrl(id));
    }
    @Operation(
            summary = "Delete album cover",
            description = "Deletes the album cover from storage."
    )
    @ApiResponse(responseCode = "204", description = "Cover deleted")
    @ApiResponse(responseCode = "404", description = "Album or cover not found",
            content = @Content(schema = @Schema(implementation = org.springframework.http.ProblemDetail.class)))
    @DeleteMapping("/{id}/cover")
    public ResponseEntity<Void> deleteCover(
            @Parameter(description = "Album id", example = "1")
            @PathVariable Long id
    ) {
        service.deleteCover(id);
        return ResponseEntity.noContent().build();
    }
}
