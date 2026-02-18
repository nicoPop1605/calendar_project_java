package com.calendar_backend.controller;

import com.calendar_backend.model.User;
import com.calendar_backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
public class UserController {

    private final UserRepository repo;

    public UserController(UserRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<User> getUsers() {
        return repo.findAll();
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        if (user.getFriends() == null) {
            user.setFriends(new ArrayList<>());
        }
        if (user.getPendingRequests() == null) {
            user.setPendingRequests(new ArrayList<>());
        }
        return repo.save(user);
    }

    // 1. Trimite cererea
    @PostMapping("/{userId}/request-friend")
    public ResponseEntity<?> requestFriend(@PathVariable Long userId, @RequestParam String friendName) {
        User sender = repo.findById(userId).orElseThrow();
        User receiver = repo.findByName(friendName);

        if (receiver == null) return ResponseEntity.status(404).body("User does not exist.");
        if (sender.getFriends().contains(receiver)) return ResponseEntity.badRequest().body("You are already friends.");

        if (!receiver.getPendingRequests().contains(sender)) {
            receiver.getPendingRequests().add(sender);
            repo.save(receiver);
        }
        return ResponseEntity.ok("Request sent!");
    }

    // 2. Acceptă cererea
    @PostMapping("/{userId}/accept-friend/{requesterId}")
    public ResponseEntity<?> acceptFriend(@PathVariable Long userId, @PathVariable Long requesterId) {
        User user = repo.findById(userId).orElseThrow();
        User requester = repo.findById(requesterId).orElseThrow();

        user.getPendingRequests().remove(requester); // Scoatem din cereri
        user.getFriends().add(requester);           // Adăugăm la prieteni
        requester.getFriends().add(user);           // Prietenia e reciprocă acum

        repo.save(user);
        repo.save(requester);
        return ResponseEntity.ok("Request accepted!");
    }

    // 3. Refuză cererea
    @PostMapping("/{userId}/decline-friend/{requesterId}")
    public ResponseEntity<?> declineFriend(@PathVariable Long userId, @PathVariable Long requesterId) {
        User user = repo.findById(userId).orElseThrow();
        User requester = repo.findById(requesterId).orElseThrow();

        user.getPendingRequests().remove(requester);
        repo.save(user);
        return ResponseEntity.ok("Request denied.");
    }
}