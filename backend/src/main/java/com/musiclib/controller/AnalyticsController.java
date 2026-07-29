package com.musiclib.controller;

import com.musiclib.dto.AnalyticsDtos.AnalyticsResponse;
import com.musiclib.security.CurrentUser;
import com.musiclib.service.AnalyticsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final CurrentUser currentUser;

    public AnalyticsController(AnalyticsService analyticsService, CurrentUser currentUser) {
        this.analyticsService = analyticsService;
        this.currentUser = currentUser;
    }

    @GetMapping
    public AnalyticsResponse getAnalytics() {
        return analyticsService.compute(currentUser.id());
    }
}
