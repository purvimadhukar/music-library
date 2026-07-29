package com.musiclib.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class LibraryDtos {

    /** Body for POST /api/library — saving an album found via search into the user's library. */
    public record CreateLibraryItemRequest(
            @NotNull Long appleCatalogId,
            @NotBlank String title,
            @NotBlank String artistName,
            String genre,
            String releaseDate, // ISO date string, e.g. 2000-07-10
            Integer trackCount,
            String artworkUrl,
            Double collectionPrice,
            @Min(1) @Max(5) Integer userRating,
            String userNotes
    ) {}

    /** Body for PUT /api/library/{id} — only rating/notes are editable by design. */
    public record UpdateLibraryItemRequest(
            @Min(1) @Max(5) Integer userRating,
            String userNotes
    ) {}

    public record LibraryItemResponse(
            Long id,
            Long appleCatalogId,
            String title,
            String artistName,
            String genre,
            String releaseDate,
            Integer trackCount,
            String artworkUrl,
            Double collectionPrice,
            Integer userRating,
            String userNotes,
            String createdAt,
            String updatedAt
    ) {}
}
