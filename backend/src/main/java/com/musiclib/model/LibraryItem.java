package com.musiclib.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;

/**
 * Represents a single Album saved by a user into their personal library.
 * Sourced originally from the iTunes Search API (appleCatalogId references
 * the iTunes "collectionId" for an album).
 */
@Entity
@Table(name = "library_items", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "apple_catalog_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LibraryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "apple_catalog_id", nullable = false)
    private Long appleCatalogId;

    @Column(nullable = false)
    private String title; // collectionName

    @Column(nullable = false)
    private String artistName;

    private String genre; // primaryGenreName

    private LocalDate releaseDate;

    private Integer trackCount;

    @Column(length = 1000)
    private String artworkUrl;

    private Double collectionPrice;

    @Column(name = "user_rating")
    private Integer userRating; // 1-5, nullable

    @Column(name = "user_notes", length = 2000)
    private String userNotes;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
