package com.example.demo;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/tickets")

public class TicketController {

    private final ServiceHelper serviceHelper;
    public TicketController(ServiceHelper serviceHelper) {
        this.serviceHelper = serviceHelper;
    }

    @PostMapping("/claim")
    public String claimTicket(@RequestBody TicketRequest ticketRequest) throws ExecutionException, InterruptedException {
        serviceHelper.claimTicket(ticketRequest);
        return "Ticket claimed for event: " + ticketRequest.getEventTitle();
    }

}
