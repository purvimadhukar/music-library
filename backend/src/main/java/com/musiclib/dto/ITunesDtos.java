package com.musiclib.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

public class ITunesDtos {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ITunesResponse(
            int resultCount,
            List<ITunesResult> results
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ITunesResult(
            Long collectionId,
            String artistName,
            String collectionName,
            Double collectionPrice,
            String releaseDate,
            Integer trackCount,
            String primaryGenreName,
            String artworkUrl100
    ) {}

    /** Normalized shape sent to the frontend for search results. */
    public record SearchResultItem(
            Long appleCatalogId,
            String title,
            String artistName,
            String genre,
            String releaseDate,
            Integer trackCount,
            String artworkUrl,
            Double collectionPrice
    ) {}
}
