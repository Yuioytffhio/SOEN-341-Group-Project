package com.soen341.campusevents;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.UUID;

public class TicketService {

    // Create a Ticket object with a unique random code
    public Ticket createTicket(Long id) {
        String uniqueCode = UUID.randomUUID().toString();
        return new Ticket(id, uniqueCode);
    }

    // Generate a QR code image from text and return it as a Base64 string
    public String generateQrCodeBase64(String text) {
        try {
            BitMatrix matrix = new MultiFormatWriter().encode(
                    text,
                    BarcodeFormat.QR_CODE,
                    250, 250
            );

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(matrix, "PNG", out);

            // Convert QR code image to Base64 so it can be displayed easily
            return Base64.getEncoder().encodeToString(out.toByteArray());
        } catch (WriterException | IOException e) {
            throw new RuntimeException("Error generating QR code", e);
        }
    }
}

