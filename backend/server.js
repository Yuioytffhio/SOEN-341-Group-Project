// server.js
import express from "express";
import QRCode from "qrcode";

const app = express();
app.use(express.json());

// Endpoint to generate a QR ticket
app.post("/api/ticket", async (req, res) => {
  const ticketId = Date.now().toString();
  const code = "TCKT-" + ticketId;

  // Generate QR code (Base64 PNG)
  const qrBase64 = await QRCode.toDataURL(code);

  res.json({ id: ticketId, code, qrBase64 });
});

// Start server
app.listen(5000, () => {
  console.log("✅ Backend server running on http://localhost:5000");
});
