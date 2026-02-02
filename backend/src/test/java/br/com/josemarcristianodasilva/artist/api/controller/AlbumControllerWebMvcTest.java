package br.com.josemarcristianodasilva.artist.api.controller;

import br.com.josemarcristianodasilva.artist.api.controller.AlbumController;
import br.com.josemarcristianodasilva.artist.api.dto.AlbumCoverResponse;
import br.com.josemarcristianodasilva.artist.api.dto.AlbumResponse;
import br.com.josemarcristianodasilva.artist.api.exception.ResourceNotFoundException;
import br.com.josemarcristianodasilva.artist.service.AlbumService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.mockito.Mockito;


import java.time.Instant;
import java.util.List;
import java.util.Set;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = AlbumController.class)
class AlbumControllerWebMvcTest {

    @Autowired
    MockMvc mvc;

    @MockBean
    AlbumService service;

    @Test
    void getById_shouldReturn200_withCoverUrl() throws Exception {
        var dto = new AlbumResponse(
                1L,
                "Discovery",
                "http://minio/presigned",
                Set.of(10L),
                Instant.parse("2026-01-01T00:00:00Z"),
                Instant.parse("2026-01-01T00:00:00Z")
        );
        when(service.getById(1L)).thenReturn(dto);

        mvc.perform(get("/v1/albums/1"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Discovery"))
                .andExpect(jsonPath("$.coverUrl").value("http://minio/presigned"));
    }

    @Test
    void list_shouldReturn200_andIncludeCoverUrlField() throws Exception {
        var dto1 = new AlbumResponse(
                1L, "Discovery", null, Set.of(10L),
                Instant.parse("2026-01-01T00:00:00Z"),
                Instant.parse("2026-01-01T00:00:00Z")
        );
        var dto2 = new AlbumResponse(
                2L, "Homework", "http://minio/presigned2", Set.of(10L, 11L),
                Instant.parse("2026-01-01T00:00:00Z"),
                Instant.parse("2026-01-01T00:00:00Z")
        );

        when(service.list(anyString(), any())).thenReturn(
                new PageImpl<>(List.of(dto1, dto2), PageRequest.of(0, 10), 2)
        );

        mvc.perform(get("/v1/albums")
                        .param("title", "dis")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].coverUrl").exists())
                .andExpect(jsonPath("$.content[0].coverUrl").isEmpty())
                .andExpect(jsonPath("$.content[1].coverUrl").value("http://minio/presigned2"));
    }

    @Test
    void uploadCover_shouldReturn200() throws Exception {
        var file = new MockMultipartFile("file", "cover.jpg", "image/jpeg", "x".getBytes());
        var resp = new AlbumCoverResponse(1L, "albums/1/cover/uuid.jpg", "http://minio/presigned");

        when(service.uploadCover(eq(1L), any())).thenReturn(resp);

        mvc.perform(multipart("/v1/albums/1/cover").file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.albumId").value(1))
                .andExpect(jsonPath("$.objectKey").value("albums/1/cover/uuid.jpg"))
                .andExpect(jsonPath("$.url").value("http://minio/presigned"));
    }

    @Test
    void uploadCover_whenAlbumNotFound_shouldReturn404_problemJson() throws Exception {
        var file = new MockMultipartFile("file", "cover.jpg", "image/jpeg", "x".getBytes());

        when(service.uploadCover(eq(999L), any()))
                .thenThrow(new ResourceNotFoundException("Album not found: 999"));

        mvc.perform(multipart("/v1/albums/999/cover").file(file))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
                .andExpect(jsonPath("$.title").value("Resource not found"))
                .andExpect(jsonPath("$.detail").value("Album not found: 999"));
    }

    @Test
    void deleteCover_shouldReturn204() throws Exception {
        doNothing().when(service).deleteCover(1L);

        mvc.perform(delete("/v1/albums/1/cover"))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteCover_whenNoCover_shouldReturn404() throws Exception {
        doThrow(new ResourceNotFoundException("Album cover not found: 1"))
                .when(service).deleteCover(1L);

        mvc.perform(delete("/v1/albums/1/cover"))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
                .andExpect(jsonPath("$.detail").value("Album cover not found: 1"));
    }
}
