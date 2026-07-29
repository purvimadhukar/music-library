package com.musiclib.controller;

import com.musiclib.dto.ITunesDtos.SearchResultItem;
import com.musiclib.service.ITunesService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final ITunesService iTunesService;

    public SearchController(ITunesService iTunesService) {
        this.iTunesService = iTunesService;
    }

    /**
     * GET /api/search?query=coldplay&type=album&limit=25
     * type is fixed to "album" for this project's chosen focus entity, but the
     * parameter is kept generic (song/musicArtist/album) to mirror the iTunes API shape.
     */
    @GetMapping
    public List<SearchResultItem> search(
            @RequestParam("query") String query,
            @RequestParam(value = "type", defaultValue = "album") String type,
            @RequestParam(value = "limit", defaultValue = "25") int limit
    ) {
        if (query == null || query.isBlank()) {
            throw new IllegalArgumentException("query parameter must not be empty");
        }
        String entity = switch (type) {
            case "song" -> "song";
            case "artist", "musicArtist" -> "musicArtist";
            default -> "album";
        };
        int safeLimit = Math.max(1, Math.min(limit, 100));
        return iTunesService.search(query, entity, safeLimit);
    }
}
