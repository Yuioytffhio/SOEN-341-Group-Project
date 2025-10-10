package com.soen341.campusevents;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.FirestoreOptions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirestoreConfig {

@Bean
    public Firestore firestore() throws IOException {

    //Get JSON file to connect to Firebase Account
    InputStream serviceAccount= getClass().getClassLoader()
            .getResourceAsStream("serviceAccount.json");

    if (serviceAccount == null) {
        throw new RuntimeException("JSON file not found");

    }
    // Use Google credentials from JSON file
    GoogleCredentials credentials = GoogleCredentials.fromStream(serviceAccount);
         FirestoreOptions options = FirestoreOptions.newBuilder()
                 .setCredentials(credentials)
                 .build();

         return options.getService();
}

}
