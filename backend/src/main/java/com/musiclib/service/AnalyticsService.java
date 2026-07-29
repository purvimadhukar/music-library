package com.musiclib.service;

import com.musiclib.dto.AnalyticsDtos.*;
import com.musiclib.model.LibraryItem;
import com.musiclib.repository.LibraryItemRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final LibraryItemRepository repository;

    public AnalyticsService(LibraryItemRepository repository) {
        this.repository = repository;
    }

    public AnalyticsResponse compute(Long userId) {
        List<LibraryItem> items = repository.findByUserIdOrderByCreatedAtDesc(userId);

        long total = items.size();

        double avgRating = items.stream()
                .filter(i -> i.getUserRating() != null)
                .mapToInt(LibraryItem::getUserRating)
                .average().orElse(0.0);

        double avgTrackCount = items.stream()
                .filter(i -> i.getTrackCount() != null)
                .mapToInt(LibraryItem::getTrackCount)
                .average().orElse(0.0);

        List<GenreCount> byGenre = items.stream()
                .map(i -> i.getGenre() == null || i.getGenre().isBlank() ? "Unknown" : i.getGenre())
                .collect(Collectors.groupingBy(g -> g, Collectors.counting()))
                .entrySet().stream()
                .map(e -> new GenreCount(e.getKey(), e.getValue()))
                .sorted(Comparator.comparingLong(GenreCount::count).reversed())
                .toList();

        List<ArtistCount> topArtists = items.stream()
                .collect(Collectors.groupingBy(LibraryItem::getArtistName, Collectors.counting()))
                .entrySet().stream()
                .map(e -> new ArtistCount(e.getKey(), e.getValue()))
                .sorted(Comparator.comparingLong(ArtistCount::count).reversed())
                .limit(10)
                .toList();

        List<YearCount> releasesByYear = items.stream()
                .filter(i -> i.getReleaseDate() != null)
                .collect(Collectors.groupingBy(i -> i.getReleaseDate().getYear(), Collectors.counting()))
                .entrySet().stream()
                .map(e -> new YearCount(e.getKey(), e.getValue()))
                .sorted(Comparator.comparingInt(YearCount::year))
                .toList();

        List<RatingCount> ratingDistribution = new ArrayList<>();
        Map<Integer, Long> ratingMap = items.stream()
                .filter(i -> i.getUserRating() != null)
                .collect(Collectors.groupingBy(LibraryItem::getUserRating, Collectors.counting()));
        for (int r = 1; r <= 5; r++) {
            ratingDistribution.add(new RatingCount(r, ratingMap.getOrDefault(r, 0L)));
        }

        Map<String, Long> decadeBreakdown = items.stream()
                .filter(i -> i.getReleaseDate() != null)
                .collect(Collectors.groupingBy(
                        i -> ((i.getReleaseDate().getYear() / 10) * 10) + "s",
                        Collectors.counting()
                ));

        return new AnalyticsResponse(total, round(avgRating), round(avgTrackCount),
                byGenre, topArtists, releasesByYear, ratingDistribution, decadeBreakdown);
    }

    private double round(double d) {
        return Math.round(d * 100.0) / 100.0;
    }
}
