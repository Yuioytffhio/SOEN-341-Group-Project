package com.example.demo;

import java.util.Map;
import java.util.concurrent.ExecutionException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.SetOptions;
import com.google.cloud.firestore.WriteResult;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin
public class AdminController {

    @Autowired
    private Firestore db;

    // Management: assign platform role (user | organizer | admin)
    @PostMapping("/setRole")
    public ResponseEntity<?> setRole(@RequestBody Map<String, String> body)
            throws ExecutionException, InterruptedException {

        String uid  = body.get("uid");
        String role = body.get("role");

        if (uid == null || role == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "uid and role are required"));
        }

        WriteResult wr = db.collection("users")
                .document(uid)
                .set(Map.of("platformRole", role), SetOptions.merge())
                .get();

        return ResponseEntity.ok(Map.of("ok", true, "updatedAt", wr.getUpdateTime().toString()));
    }
}
