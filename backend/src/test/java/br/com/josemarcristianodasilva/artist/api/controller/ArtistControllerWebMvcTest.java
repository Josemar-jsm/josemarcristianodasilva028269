package br.com.josemarcristianodasilva.artist.api.controller;

import br.com.josemarcristianodasilva.artist.api.controller.ArtistController;
import br.com.josemarcristianodasilva.artist.api.exception.ResourceNotFoundException;
import br.com.josemarcristianodasilva.artist.domain.model.Artist;
import br.com.josemarcristianodasilva.artist.service.ArtistService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = ArtistController.class)
class ArtistControllerWebMvcTest {

    @Autowired
    MockMvc mvc;

    @MockBean
    ArtistService service;

    private Artist artist(Long id, String name) {
        Artist a = new Artist(name);
        try {
            var idField = Artist.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(a, id);
        } catch (Exception ignored) {}
        try {
            var createdAt = Artist.class.getSuperclass().getDeclaredField("createdAt");
            createdAt.setAccessible(true);
            createdAt.set(a, Instant.parse("2026-01-01T00:00:00Z"));
            var updatedAt = Artist.class.getSuperclass().getDeclaredField("updatedAt");
            updatedAt.setAccessible(true);
            updatedAt.set(a, Instant.parse("2026-01-01T00:00:00Z"));
        } catch (Exception ignored) {}

        return a;
    }

    @Test
    void list_shouldReturn200_paginated() throws Exception {
        var a1 = artist(1L, "Daft Punk");
        var a2 = artist(2L, "Justice");

        Mockito.when(service.list(anyString(), any()))
                .thenReturn(new PageImpl<>(List.of(a1, a2), PageRequest.of(0, 10), 2));

        mvc.perform(get("/v1/artists")
                        .param("name", "daft")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.content[0].id").value(1))
                .andExpect(jsonPath("$.content[0].name").value("Daft Punk"))
                .andExpect(jsonPath("$.content[1].id").value(2))
                .andExpect(jsonPath("$.content[1].name").value("Justice"));
    }

    @Test
    void getById_shouldReturn200() throws Exception {
        var a = artist(1L, "Daft Punk");
        Mockito.when(service.getById(1L)).thenReturn(a);

        mvc.perform(get("/v1/artists/1"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Daft Punk"));
    }

    @Test
    void getById_whenNotFound_shouldReturn404_problemJson() throws Exception {
        Mockito.when(service.getById(999L))
                .thenThrow(new ResourceNotFoundException("Artist not found: 999"))
                .thenThrow(new IllegalArgumentException("Artist not found: 999"));

        mvc.perform(get("/v1/artists/999"))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
                .andExpect(jsonPath("$.title").value("Resource not found"))
                .andExpect(jsonPath("$.detail").value("Artist not found: 999"));
    }

    @Test
    void create_shouldReturn201_andLocation() throws Exception {
        var saved = artist(10L, "Daft Punk");
        Mockito.when(service.create(eq("Daft Punk"))).thenReturn(saved);

        mvc.perform(post("/v1/artists")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Daft Punk\"}"))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "http://localhost/v1/artists/10"))
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.name").value("Daft Punk"));
    }

    @Test
    void update_shouldReturn200() throws Exception {
        var updated = artist(1L, "Daft Punk (Updated)");
        Mockito.when(service.update(eq(1L), eq("Daft Punk (Updated)"))).thenReturn(updated);

        mvc.perform(put("/v1/artists/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Daft Punk (Updated)\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Daft Punk (Updated)"));
    }

    @Test
    void delete_shouldReturn204() throws Exception {
        mvc.perform(delete("/v1/artists/1"))
                .andExpect(status().isNoContent());
    }
}
