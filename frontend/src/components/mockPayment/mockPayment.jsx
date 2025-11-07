import React, { useState } from "react";
import "./mockPayment.css";

export default function MockPayment({ event, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePayment = (e) => {
    e.preventDefault();

    // Basic checks
    if (!formData.name || !formData.address) {
      setMessage("❌ Please fill out all required fields.");
      return;
    }
    if (formData.cardNumber.length !== 16 || isNaN(formData.cardNumber)) {
      setMessage("❌ Card number must be 16 digits.");
      return;
    }
    if (formData.cvv.length !== 3 || isNaN(formData.cvv)) {
      setMessage("❌ CVV must be 3 digits.");
      return;
    }
    if (formData.expiry.length !== 4 || isNaN(formData.expiry)) {
      setMessage("❌ Expiration must be 4 digits (MMYY).");
      return;
    }

    // Mock payment success
    setMessage("✅ Payment successful!");
    setTimeout(() => {
      onSuccess(event);
    }, 800);
  };

  return (
    <div className="payment-modal">
      <div className="payment-content">
        <h3>Buy Ticket for {event.eventTitle}</h3>
        <p>Amount: ${event.price ?? event.ticketPrice ?? 0}</p>

        <form onSubmit={handlePayment}>
          <input
            type="text"
            name="name"
            placeholder="Name on Card"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="address"
            placeholder="Billing Address"
            value={formData.address}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="cardNumber"
            placeholder="Card Number (16 digits)"
            maxLength="16"
            value={formData.cardNumber}
            onChange={handleChange}
            required
          />

          <div className="payment-row">
            <input
              type="text"
              name="expiry"
              placeholder="MMYY"
              maxLength="4"
              value={formData.expiry}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="cvv"
              placeholder="CVV"
              maxLength="3"
              value={formData.cvv}
              onChange={handleChange}
              required
            />
          </div>

          <div className="buttons">
            <button type="submit">Pay Now</button>
            <button type="button" onClick={onCancel}>Cancel</button>
          </div>
        </form>

        {message && <p>{message}</p>}
      </div>
    </div>
  );
}
