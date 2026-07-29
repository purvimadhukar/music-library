package com.musiclib.dto;

public class AiGameDtos {

    public record GuessAlbumChallenge(
            Long albumId,
            String artistName,
            String genre,
            Integer releaseYear,
            Integer trackCount,
            String artworkUrl,
            String correctTitle
    ) {}

    public record EmojiChallenge(
            Long albumId,
            String emoji,
            String artistName,
            String artworkUrl,
            String correctTitle
    ) {}
}
