package com.musiclib.dto;

import java.util.List;
import java.util.Map;

public class AnalyticsDtos {

    public record GenreCount(String genre, long count) {}
    public record ArtistCount(String artist, long count) {}
    public record YearCount(int year, long count) {}
    public record RatingCount(int rating, long count) {}

    public record AnalyticsResponse(
            long totalAlbums,
            double averageRating,
            double averageTrackCount,
            List<GenreCount> byGenre,          // -> Pie/Donut chart
            List<ArtistCount> topArtists,       // -> Horizontal bar chart
            List<YearCount> releasesByYear,     // -> Line chart (albums saved per release year)
            List<RatingCount> ratingDistribution, // -> Histogram / Bar chart
            Map<String, Long> decadeBreakdown    // supplementary bar chart
    ) {}
}
