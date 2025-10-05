package com.example.demo;

import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;


@Service
public class ServiceHelper {

    private final Firestore firestore;

    public ServiceHelper(Firestore firestore) {

        this.firestore = firestore;

    }

    // Get all events from Database
    public List<Event> getAllevents() throws ExecutionException, InterruptedException {
        List<Event> events = new ArrayList<>();
        for (QueryDocumentSnapshot doc : firestore.collection("events").get().get().getDocuments()) {
            Event event = doc.toObject(Event.class);
            event.setEventId((doc.getId()));
            events.add(event);
        }

        return events;

        //Get event by id (to be added later)


    }
}

