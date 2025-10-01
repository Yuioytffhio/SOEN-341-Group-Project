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

    // Generate a random ticket code
    public Ticket createTicket(Long id) {
        String uniqueCode = UUID.randomUUID().toString();
        return new Ticket(id, uniqueCode);
    }

    // Convert ticket code into a QR Code image (base64 so you can view it easily)
    public String generateQrCodeBase64(String text) {
        try {
            BitMatrix matrix = new MultiFormatWriter().encode(text,
                    BarcodeFormat.QR_CODE, 250, 250);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(matrix, "PNG", out);

            return Base64.getEncoder().encodeToString(out.toByteArray());
        } catch (WriterException | IOException e) {
            throw new RuntimeException("Error generating QR code", e);
        }
    }
}
