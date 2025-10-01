package com.soen341.campusevents;

public class Main {
    public static void main(String[] args) {
        TicketService service = new TicketService();

        // Create a ticket
        Ticket ticket = service.createTicket(1L);
        System.out.println("Ticket created with code: " + ticket.getCode());

        // Generate QR code for the ticket
        String qrBase64 = service.generateQrCodeBase64("TCKT:" + ticket.getCode());

        System.out.println("QR Code (Base64 PNG):");
        System.out.println(qrBase64);

        // Note: To actually see the QR code, copy the Base64 string into a tool like https://codebeautify.org/base64-to-image-converter
    }
}
