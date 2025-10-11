package com.example.demo;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.concurrent.ExecutionException;

@RestController
@CrossOrigin(origins = "http://localhost:3000")

public class EventController {

    private final ServiceHelper serviceHelper;

    public EventController (ServiceHelper serviceHelper) {
        this.serviceHelper = serviceHelper;
    }
    @GetMapping("/events")
    public List<Event> getAllevents() throws ExecutionException, InterruptedException {
        return serviceHelper.getAllevents();
    }
}
