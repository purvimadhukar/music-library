package com.musiclib.service;

import com.musiclib.dto.AiGameDtos.EmojiChallenge;
import com.musiclib.dto.AiGameDtos.GuessAlbumChallenge;
import com.musiclib.exception.ResourceNotFoundException;
import com.musiclib.model.LibraryItem;
import com.musiclib.repository.LibraryItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.regex.Pattern;

@Service
public class AiGameService {

    private final LibraryItemRepository repository;
    private final Random random = new Random();

    public AiGameService(LibraryItemRepository repository) {
        this.repository = repository;
    }

    public GuessAlbumChallenge generateGuessAlbumChallenge(Long userId) {
        LibraryItem item = randomItem(userId);
        Integer year = item.getReleaseDate() == null ? null : item.getReleaseDate().getYear();
        return new GuessAlbumChallenge(
                item.getId(),
                item.getArtistName(),
                item.getGenre(),
                year,
                item.getTrackCount(),
                item.getArtworkUrl(),
                item.getTitle()
        );
    }

    public EmojiChallenge generateEmojiChallenge(Long userId) {
        LibraryItem item = randomItem(userId);
        String emoji = titleToEmoji(item.getTitle());
        return new EmojiChallenge(
                item.getId(),
                emoji,
                item.getArtistName(),
                item.getArtworkUrl(),
                item.getTitle()
        );
    }

    private LibraryItem randomItem(Long userId) {
        List<LibraryItem> items = repository.findByUserIdOrderByCreatedAtDesc(userId);
        if (items.isEmpty()) {
            throw new ResourceNotFoundException("Save at least one album to your library to play.");
        }
        return items.get(random.nextInt(items.size()));
    }

    private static final Map<String, String> WORD_EMOJI = Map.ofEntries(
            Map.entry("love", "❤️"), Map.entry("heart", "❤️"), Map.entry("hate", "💢"),
            Map.entry("night", "🌙"), Map.entry("day", "☀️"), Map.entry("sun", "☀️"),
            Map.entry("moon", "🌙"), Map.entry("star", "⭐"), Map.entry("stars", "✨"),
            Map.entry("sky", "🌌"), Map.entry("rain", "🌧️"), Map.entry("fire", "🔥"),
            Map.entry("ice", "🧊"), Map.entry("cold", "🥶"), Map.entry("hot", "🔥"),
            Map.entry("gold", "🥇"), Map.entry("silver", "🥈"), Map.entry("diamond", "💎"),
            Map.entry("dream", "💭"), Map.entry("dreams", "💭"), Map.entry("sleep", "😴"),
            Map.entry("time", "⏰"), Map.entry("life", "🌱"), Map.entry("death", "💀"),
            Map.entry("world", "🌍"), Map.entry("home", "🏠"), Map.entry("house", "🏠"),
            Map.entry("dark", "🌑"), Map.entry("light", "💡"), Map.entry("blue", "🔵"),
            Map.entry("red", "🔴"), Map.entry("black", "⚫"), Map.entry("white", "⚪"),
            Map.entry("green", "🟢"), Map.entry("yellow", "🟡"), Map.entry("purple", "🟣"),
            Map.entry("king", "👑"), Map.entry("queen", "👑"), Map.entry("crown", "👑"),
            Map.entry("water", "💧"), Map.entry("ocean", "🌊"), Map.entry("sea", "🌊"),
            Map.entry("river", "🏞️"), Map.entry("mountain", "⛰️"), Map.entry("road", "🛣️"),
            Map.entry("car", "🚗"), Map.entry("train", "🚆"), Map.entry("fly", "✈️"),
            Map.entry("flying", "🛫"), Map.entry("flower", "🌸"), Map.entry("flowers", "💐"),
            Map.entry("rose", "🌹"), Map.entry("tree", "🌳"), Map.entry("garden", "🌷"),
            Map.entry("city", "🏙️"), Map.entry("town", "🏘️"), Map.entry("street", "🛣️"),
            Map.entry("party", "🎉"), Map.entry("dance", "💃"), Map.entry("dancing", "💃"),
            Map.entry("music", "🎵"), Map.entry("song", "🎶"), Map.entry("sound", "🔊"),
            Map.entry("voice", "🗣️"), Map.entry("game", "🎮"), Map.entry("games", "🎮"),
            Map.entry("war", "⚔️"), Map.entry("fight", "🥊"), Map.entry("gun", "🔫"),
            Map.entry("money", "💰"), Map.entry("rich", "🤑"), Map.entry("poor", "🪙"),
            Map.entry("baby", "👶"), Map.entry("boy", "👦"), Map.entry("girl", "👧"),
            Map.entry("man", "👨"), Map.entry("woman", "👩"), Map.entry("angel", "😇"),
            Map.entry("devil", "😈"), Map.entry("ghost", "👻"), Map.entry("monster", "👹"),
            Map.entry("magic", "✨"), Map.entry("wonder", "🤩"), Map.entry("wonderful", "🤩"),
            Map.entry("beautiful", "😍"), Map.entry("sad", "😢"), Map.entry("happy", "😊"),
            Map.entry("crazy", "🤪"), Map.entry("wild", "🐺"), Map.entry("free", "🕊️"),
            Map.entry("freedom", "🕊️"), Map.entry("rock", "🪨"), Map.entry("roll", "🎳"),
            Map.entry("summer", "☀️"), Map.entry("winter", "❄️"), Map.entry("spring", "🌷"),
            Map.entry("autumn", "🍂"), Map.entry("fall", "🍂"), Map.entry("snow", "❄️"),
            Map.entry("wind", "💨"), Map.entry("storm", "⛈️"), Map.entry("thunder", "⚡"),
            Map.entry("lightning", "⚡"), Map.entry("colour", "🎨"), Map.entry("color", "🎨"),
            Map.entry("paint", "🎨"), Map.entry("art", "🎨"), Map.entry("picture", "🖼️"),
            Map.entry("photograph", "📷"), Map.entry("photo", "📷"), Map.entry("camera", "📷"),
            Map.entry("phone", "📱"), Map.entry("call", "📞"), Map.entry("letter", "✉️"),
            Map.entry("book", "📖"), Map.entry("story", "📖")
    );

    private static final Pattern WORD_SPLIT = Pattern.compile("[^a-zA-Z0-9']+");

    private String titleToEmoji(String title) {
        if (title == null || title.isBlank()) return "🎵";

        StringBuilder sb = new StringBuilder();
        String[] words = WORD_SPLIT.split(title.toLowerCase());
        int emojiCount = 0;

        for (String word : words) {
            if (word.isBlank()) continue;
            String cleaned = word.replaceAll("'s$", "");
            String emoji = WORD_EMOJI.get(cleaned);
            if (emoji != null) {
                sb.append(emoji);
                emojiCount++;
            }
        }

        if (emojiCount == 0) {
            String[] fallback = {"🎵", "🎶", "🎤", "🎧", "💿"};
            for (int i = 0; i < Math.min(3, words.length); i++) {
                sb.append(fallback[random.nextInt(fallback.length)]);
            }
        }

        return sb.toString();
    }
}
