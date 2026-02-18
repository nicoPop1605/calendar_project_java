package com.calendar_backend.controller;

import com.calendar_backend.model.Group;
import com.calendar_backend.model.User;
import com.calendar_backend.repository.GroupRepository;
import com.calendar_backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/groups")
@CrossOrigin(origins = "http://localhost:3000")
public class GroupController {

    private final GroupRepository groupRepository;
    private final UserRepository userRepository;

    public GroupController(GroupRepository groupRepository, UserRepository userRepository) {
        this.groupRepository = groupRepository;
        this.userRepository = userRepository;
    }

    // 1. Obține toate grupurile
    @GetMapping
    public List<Group> getAllGroups() {
        return groupRepository.findAll();
    }

    // 2. Creează un grup nou
    @PostMapping
    public Group createGroup(@RequestBody Group group) {
        return groupRepository.save(group);
    }

    // 3. Obține un grup specific după ID
    @GetMapping("/{id}")
    public ResponseEntity<Group> getGroupById(@PathVariable Long id) {
        return groupRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 4. Adaugă un membru într-un grup
    @PostMapping("/{groupId}/members/{userId}")
    public ResponseEntity<Group> addMemberToGroup(@PathVariable Long groupId, @PathVariable Long userId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!group.getMembers().contains(user)) {
            group.getMembers().add(user); // Adaugă userul în lista de membri
            groupRepository.save(group);
        }

        return ResponseEntity.ok(group);
    }

    // 5. Șterge un grup
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGroup(@PathVariable Long id) {
        if (!groupRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        groupRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }


}