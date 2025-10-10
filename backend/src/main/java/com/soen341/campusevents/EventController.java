package com.soen341.campusevents;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.concurrent.ExecutionException;

@RestController
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
