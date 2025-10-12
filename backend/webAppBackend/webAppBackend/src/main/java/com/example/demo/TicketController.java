package com.example.demo;

import org.springframework.web.bind.annotation.*;
import java.util.concurrent.ExecutionException;
import java.util.Map;

@RestController
@RequestMapping("/tickets")

public class TicketController {

    private final ServiceHelper serviceHelper;
    private final TicketService ticketService;

    public TicketController(ServiceHelper serviceHelper, TicketService ticketService) {
        this.serviceHelper = serviceHelper;
        this.ticketService = ticketService;
    }

    @PostMapping("/claim")
    public Map<String, String> claimTicket(@RequestBody TicketRequest ticketRequest)
            throws ExecutionException, InterruptedException {

        // Create a unique ticket
        Ticket ticket = ticketService.createTicket(System.currentTimeMillis());

        // Generate a QR code for that ticket
        String qrCodeBase64 = ticketService.generateQrCodeBase64(ticket.getUniqueCode());

        //  Save the ticket + QR info to Firestore
        serviceHelper.claimTicket(ticketRequest, ticket.getUniqueCode(), qrCodeBase64);

        // Return response to frontend
        return Map.of(
            "message", "Ticket claimed for event: " + ticketRequest.getEventTitle(),
            "ticketCode", ticket.getUniqueCode(),
            "qrCodeBase64", qrCodeBase64
        );
    }

}
