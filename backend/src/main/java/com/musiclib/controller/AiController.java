package com.musiclib.controller;

import com.musiclib.dto.AiGameDtos.EmojiChallenge;
import com.musiclib.dto.AiGameDtos.GuessAlbumChallenge;
import com.musiclib.security.CurrentUser;
import com.musiclib.service.AiGameService;
import com.musiclib.service.AiInsightService;
import com.musiclib.service.AnalyticsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AnalyticsService analyticsService;
    private final AiInsightService aiInsightService;
    private final AiGameService aiGameService;
    private final CurrentUser currentUser;

    public AiController(AnalyticsService analyticsService, AiInsightService aiInsightService,
                         AiGameService aiGameService, CurrentUser currentUser) {
        this.analyticsService = analyticsService;
        this.aiInsightService = aiInsightService;
        this.aiGameService = aiGameService;
        this.currentUser = currentUser;
    }

    @GetMapping("/insights")
    public Map<String, String> insights() {
        var analytics = analyticsService.compute(currentUser.id());
        String summary = aiInsightService.generateSummary(analytics);
        return Map.of("summary", summary);
    }

    @GetMapping("/games/guess-album")
    public GuessAlbumChallenge guessAlbum() {
        return aiGameService.generateGuessAlbumChallenge(currentUser.id());
    }

    @GetMapping("/games/emoji-challenge")
    public EmojiChallenge emojiChallenge() {
        return aiGameService.generateEmojiChallenge(currentUser.id());
    }
}
