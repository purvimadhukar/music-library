package com.musiclib.service;

import com.musiclib.dto.ITunesDtos.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * Thin proxy + normalizer over the public iTunes Search API.
 * We proxy (rather than call it directly from the frontend) so we can:
 *  - keep a consistent response shape for the React app
 *  - add a short in-memory cache to reduce duplicate upstream calls while typing/searching
 *  - centralize error handling for upstream failures
 */
@Service
public class ITunesService {

    private final RestTemplate restTemplate;
    private final String baseUrl;

    // very small in-memory cache: query key -> (timestamp, results). Good enough for a 3-day project;
    // a production system would use Redis or Caffeine with proper eviction.
    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();
    private static final long CACHE_TTL_MS = TimeUnit.MINUTES.toMillis(5);

    public ITunesService(RestTemplate restTemplate, @Value("${app.itunes.base-url}") String baseUrl) {
        this.restTemplate = restTemplate;
        this.baseUrl = baseUrl;
    }

    public List<SearchResultItem> search(String term, String entity, int limit) {
        String cacheKey = term.toLowerCase() + "|" + entity + "|" + limit;
        CacheEntry cached = cache.get(cacheKey);
        if (cached != null && (System.currentTimeMillis() - cached.timestamp) < CACHE_TTL_MS) {
            return cached.results;
        }

        String url = UriComponentsBuilder.fromHttpUrl(baseUrl + "/search")
                .queryParam("term", term)
                .queryParam("entity", entity)
                .queryParam("limit", limit)
                .toUriString();

        ITunesResponse response = restTemplate.getForObject(url, ITunesResponse.class);

        List<SearchResultItem> results = response == null || response.results() == null
                ? List.of()
                : response.results().stream()
                    .filter(r -> r.collectionId() != null || entity.equals("song") || entity.equals("musicArtist"))
                    .map(this::normalize)
                    .toList();

        cache.put(cacheKey, new CacheEntry(System.currentTimeMillis(), results));
        return results;
    }

    private SearchResultItem normalize(ITunesResult r) {
        return new SearchResultItem(
                r.collectionId(),
                r.collectionName(),
                r.artistName(),
                r.primaryGenreName(),
                r.releaseDate(),
                r.trackCount(),
                r.artworkUrl100(),
                r.collectionPrice()
        );
    }

    private record CacheEntry(long timestamp, List<SearchResultItem> results) {}
}
