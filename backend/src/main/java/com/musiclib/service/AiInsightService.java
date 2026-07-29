package com.musiclib.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.musiclib.dto.AnalyticsDtos.AnalyticsResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * AI Feature: "Trend & Taste Summary".
 *
 * Given the user's computed library analytics, produce a short natural-language
 * summary of their listening taste, standout patterns, and a couple of light
 * recommendations for what to explore next.
 *
 * Two modes:
 *  - heuristic (default, no API key needed): template-based summary built from
 *    the analytics numbers. Deterministic, free, works offline.
 *  - anthropic: if ANTHROPIC_API_KEY is configured, sends the same analytics
 *    payload to Claude for a richer, more natural summary.
 *
 * This keeps the feature demoable out-of-the-box while showing how a real
 * LLM integration would be wired in.
 */
@Service
public class AiInsightService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String provider;
    private final String anthropicApiKey;
    private final String anthropicModel;

    public AiInsightService(
            RestTemplate restTemplate,
            @Value("${app.ai.provider}") String provider,
            @Value("${app.ai.anthropic-api-key}") String anthropicApiKey,
            @Value("${app.ai.anthropic-model:claude-sonnet-4-5}") String anthropicModel
    ) {
        this.restTemplate = restTemplate;
        this.provider = provider;
        this.anthropicApiKey = anthropicApiKey;
        this.anthropicModel = anthropicModel;
    }

    public String generateSummary(AnalyticsResponse a) {
        if ("anthropic".equalsIgnoreCase(provider) && anthropicApiKey != null && !anthropicApiKey.isBlank()) {
            try {
                return generateWithAnthropic(a);
            } catch (Exception e) {
                // Fall back gracefully rather than failing the request if the upstream call errors.
                return heuristicSummary(a) + "\n\n(Note: AI provider call failed, showing heuristic summary.)";
            }
        }
        return heuristicSummary(a);
    }

    private String generateWithAnthropic(AnalyticsResponse a) throws Exception {
        String prompt = """
                Here is a JSON summary of a user's saved album library on a music app:
                %s

                In 3-4 short sentences, written warmly and specifically (not generic),
                describe their taste, one standout pattern, and suggest one genre or era
                they might enjoy exploring next based on gaps in their library. Do not use
                bullet points, just prose.
                """.formatted(objectMapper.writeValueAsString(a));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", anthropicApiKey);
        headers.set("anthropic-version", "2023-06-01");

        Map<String, Object> body = Map.of(
                "model", anthropicModel,
                "max_tokens", 300,
                "messages", List.of(Map.of("role", "user", "content", prompt))
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        JsonNode response = restTemplate.postForObject(
                "https://api.anthropic.com/v1/messages", entity, JsonNode.class);

        if (response != null && response.has("content") && response.get("content").isArray()
                && response.get("content").size() > 0) {
            return response.get("content").get(0).get("text").asText();
        }
        throw new IllegalStateException("Unexpected Anthropic response shape");
    }

    private String heuristicSummary(AnalyticsResponse a) {
        if (a.totalAlbums() == 0) {
            return "Your library is empty right now — search for some albums and save a few to unlock personalized taste insights.";
        }

        StringBuilder sb = new StringBuilder();

        String topGenre = a.byGenre().isEmpty() ? null : a.byGenre().get(0).genre();
        String topArtist = a.topArtists().isEmpty() ? null : a.topArtists().get(0).artist();

        sb.append("You've saved ").append(a.totalAlbums()).append(" album")
          .append(a.totalAlbums() == 1 ? "" : "s").append(" so far");

        if (topGenre != null) {
            long topGenreCount = a.byGenre().get(0).count();
            double pct = (topGenreCount * 100.0) / a.totalAlbums();
            sb.append(", and your taste leans heavily ").append(pct >= 40 ? "toward" : "somewhat toward")
              .append(" ").append(topGenre)
              .append(String.format(" (%.0f%% of your library)", pct));
        }
        sb.append(". ");

        if (topArtist != null && a.topArtists().get(0).count() > 1) {
            sb.append(topArtist).append(" is your most-saved artist with ")
              .append(a.topArtists().get(0).count()).append(" albums — a clear favorite. ");
        }

        if (!a.releasesByYear().isEmpty()) {
            int earliest = a.releasesByYear().get(0).year();
            int latest = a.releasesByYear().get(a.releasesByYear().size() - 1).year();
            if (latest - earliest > 20) {
                sb.append("Your collection spans a wide range, from ").append(earliest)
                  .append(" to ").append(latest).append(", showing an appetite for both classic and recent releases. ");
            } else {
                sb.append("Most of what you've saved falls between ").append(earliest)
                  .append(" and ").append(latest).append(". ");
            }
        }

        if (a.averageRating() > 0) {
            sb.append("You rate your saved albums ").append(a.averageRating()).append("/5 on average. ");
        }

        // simple gap-based suggestion
        List<String> commonGenres = List.of("Pop", "Rock", "Hip-Hop/Rap", "Alternative", "Jazz", "Electronic", "R&B/Soul", "Country");
        String missingGenre = commonGenres.stream()
                .filter(g -> a.byGenre().stream().noneMatch(gc -> gc.genre().equalsIgnoreCase(g)))
                .findFirst().orElse(null);
        if (missingGenre != null) {
            sb.append("You haven't saved any ").append(missingGenre)
              .append(" yet — could be worth a search if you want to branch out.");
        }

        return sb.toString().trim();
    }
}
