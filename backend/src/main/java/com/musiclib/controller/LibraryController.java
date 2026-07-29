package com.musiclib.controller;

import com.musiclib.dto.LibraryDtos.*;
import com.musiclib.security.CurrentUser;
import com.musiclib.service.LibraryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/library")
public class LibraryController {

    private final LibraryService libraryService;
    private final CurrentUser currentUser;

    public LibraryController(LibraryService libraryService, CurrentUser currentUser) {
        this.libraryService = libraryService;
        this.currentUser = currentUser;
    }

    @GetMapping
    public List<LibraryItemResponse> getLibrary() {
        return libraryService.getLibrary(currentUser.id());
    }

    @PostMapping
    public ResponseEntity<LibraryItemResponse> add(@Valid @RequestBody CreateLibraryItemRequest req) {
        LibraryItemResponse created = libraryService.addToLibrary(currentUser.id(), req);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public LibraryItemResponse update(@PathVariable Long id, @Valid @RequestBody UpdateLibraryItemRequest req) {
        return libraryService.update(currentUser.id(), id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        libraryService.delete(currentUser.id(), id);
        return ResponseEntity.noContent().build();
    }
}
