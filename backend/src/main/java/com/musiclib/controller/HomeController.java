package com.musiclib.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public Map<String, String> home() {
        return Map.of(
                "status", "ok",
                "message", "Music Library API is running. This is a REST API, not a webpage — " +
                        "use the frontend to interact with it.",
                "frontend", "https://music-library-chi-seven.vercel.app",
                "example", "/api/search?query=coldplay&type=album"
        );
    }
}
