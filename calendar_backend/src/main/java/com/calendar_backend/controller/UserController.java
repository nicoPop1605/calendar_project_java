package com.calendar_backend.controller;

import com.calendar_backend.model.User;
import com.calendar_backend.repository.UserRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {
    private final UserRepository repo;

    public UserController(UserRepository repo) { this.repo = repo; }

    @GetMapping
    public List<User> getUsers() { return repo.findAll(); }

    @PostMapping
    public User createUser(@RequestBody User user) { return repo.save(user); }
}