package com.calendar_backend.service;

import com.calendar_backend.model.Event;
import com.calendar_backend.repository.EventRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EventService {

    private final EventRepository repo;

    public EventService(EventRepository repo) {
        this.repo = repo;
    }

    public List<Event> getAll() {
        return repo.findAll();
    }

    public Event create(Event event) {

        if (event.getEndDateTime().isBefore(event.getStartDateTime())) {
            throw new RuntimeException("End date cannot be before start date");
        }

        return repo.save(event);
    }

    public boolean existsById(Long id) {
        return repo.existsById(id);
    }

    public void deleteById(Long id) {
        repo.deleteById(id);
    }

    public Event update(Long id, Event updatedEvent) {
        Event existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // Validare end > start
        if (updatedEvent.getEndDateTime().isBefore(updatedEvent.getStartDateTime())) {
            throw new RuntimeException("End date cannot be before start date");
        }

        existing.setTitle(updatedEvent.getTitle());
        existing.setDescription(updatedEvent.getDescription());
        existing.setStartDateTime(updatedEvent.getStartDateTime());
        existing.setEndDateTime(updatedEvent.getEndDateTime());
        existing.setLocation(updatedEvent.getLocation());

        return repo.save(existing);
    }


}
