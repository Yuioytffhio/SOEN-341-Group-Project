package com.example.demo;

import java.util.Map;
import java.util.concurrent.ExecutionException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;

@RestController
@RequestMapping("/api/role")
@CrossOrigin
public class UserRoleController {

    @Autowired
    private Firestore db;

    @GetMapping("/{uid}")
    public ResponseEntity<?> getRole(@PathVariable String uid)
            throws ExecutionException, InterruptedException {

        DocumentSnapshot snap = db.collection("users").document(uid).get().get();
        String role = (snap.exists() && snap.contains("platformRole"))
                ? snap.getString("platformRole")
                : "user";

        return ResponseEntity.ok(Map.of("platformRole", role));
    }
}
