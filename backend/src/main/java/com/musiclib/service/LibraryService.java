package com.musiclib.service;

import com.musiclib.dto.LibraryDtos.*;
import com.musiclib.exception.DuplicateResourceException;
import com.musiclib.exception.ResourceNotFoundException;
import com.musiclib.model.LibraryItem;
import com.musiclib.repository.LibraryItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;

@Service
public class LibraryService {

    private final LibraryItemRepository repository;

    public LibraryService(LibraryItemRepository repository) {
        this.repository = repository;
    }

    public List<LibraryItemResponse> getLibrary(Long userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public LibraryItemResponse addToLibrary(Long userId, CreateLibraryItemRequest req) {
        if (repository.existsByUserIdAndAppleCatalogId(userId, req.appleCatalogId())) {
            throw new DuplicateResourceException("This album is already in your library");
        }

        LibraryItem item = LibraryItem.builder()
                .userId(userId)
                .appleCatalogId(req.appleCatalogId())
                .title(req.title())
                .artistName(req.artistName())
                .genre(req.genre())
                .releaseDate(parseDate(req.releaseDate()))
                .trackCount(req.trackCount())
                .artworkUrl(req.artworkUrl())
                .collectionPrice(req.collectionPrice())
                .userRating(req.userRating())
                .userNotes(req.userNotes())
                .build();

        return toResponse(repository.save(item));
    }

    @Transactional
    public LibraryItemResponse update(Long userId, Long id, UpdateLibraryItemRequest req) {
        LibraryItem item = repository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Library item not found"));

        if (req.userRating() != null) item.setUserRating(req.userRating());
        if (req.userNotes() != null) item.setUserNotes(req.userNotes());

        return toResponse(repository.save(item));
    }

    @Transactional
    public void delete(Long userId, Long id) {
        LibraryItem item = repository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Library item not found"));
        repository.delete(item);
    }

    private LocalDate parseDate(String isoOrIsoDateTime) {
        if (isoOrIsoDateTime == null || isoOrIsoDateTime.isBlank()) return null;
        try {
            // iTunes returns e.g. "2000-07-10T12:00:00Z"
            return LocalDate.parse(isoOrIsoDateTime.substring(0, 10), DateTimeFormatter.ISO_DATE);
        } catch (DateTimeParseException | StringIndexOutOfBoundsException e) {
            return null;
        }
    }

    private LibraryItemResponse toResponse(LibraryItem i) {
        return new LibraryItemResponse(
                i.getId(),
                i.getAppleCatalogId(),
                i.getTitle(),
                i.getArtistName(),
                i.getGenre(),
                i.getReleaseDate() == null ? null : i.getReleaseDate().toString(),
                i.getTrackCount(),
                i.getArtworkUrl(),
                i.getCollectionPrice(),
                i.getUserRating(),
                i.getUserNotes(),
                i.getCreatedAt().toString(),
                i.getUpdatedAt().toString()
        );
    }
}
