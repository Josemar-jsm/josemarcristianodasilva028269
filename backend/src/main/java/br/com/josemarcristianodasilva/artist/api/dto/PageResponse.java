package br.com.josemarcristianodasilva.artist.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.data.domain.Page;

import java.util.List;

@Schema(name = "PageResponse")
public record PageResponse<T>(
        @Schema(description = "Items of current page")
        List<T> content,
        @Schema(example = "0") int page,
        @Schema(example = "10") int size,
        @Schema(example = "1") long totalElements,
        @Schema(example = "1") int totalPages
) {
    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
        );
    }
}
