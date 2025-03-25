import React, { useState, useEffect } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";

const UPIPayment = () => {
  const [upiId, setUpiId] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [upiLink, setUpiLink] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Function to speak the amount credited
  const speakAmount = (amount) => {
    if ('speechSynthesis' in window) {
      const message = new SpeechSynthesisUtterance(`${amount} rupees has been credited to your account`);
      message.lang = 'en-IN';
      
      // Optional: Adjust voice properties
      message.rate = 0.9; // Slightly slower rate
      message.pitch = 1;
      message.volume = 1;
      
      window.speechSynthesis.speak(message);
    }
  };

  const handlePayment = async () => {
    try {
      if (!upiId) {
        alert("Please enter UPI ID");
        return;
      }
      
      if (!amount || parseFloat(amount) <= 0) {
        alert("Please enter a valid amount");
        return;
      }
      
      setIsProcessing(true);
      
      const response = await axios.post("http://localhost:3000/payment/initiate", {
        upiId,
        amount: parseFloat(amount),
      });

      if (response.data.success) {
        setTransactionId(response.data.transactionId);
        setUpiLink(response.data.upiLink);

        if (/Mobi|Android/i.test(navigator.userAgent)) {
          window.location.href = response.data.upiLink;
        }

        // Poll for payment status
        setTimeout(checkPaymentStatus, 5000);
      } else {
        setIsProcessing(false);
        alert("Payment initiation failed");
      }
    } catch (error) {
      setIsProcessing(false);
      console.error("Error:", error);
      alert("Something went wrong!");
    }
  };

  const checkPaymentStatus = async () => {
    try {
      if (!transactionId) return;
      
      const response = await axios.get(`http://localhost:3000/payment/status/${transactionId}`);

      if (response.data.status === "completed") {
        setPaymentSuccess(true);
        setUpiLink(""); // Hide QR code
        setIsProcessing(false);
        
        // Speak the amount that was credited
        speakAmount(amount);
        
        alert("Payment Successful!"); // Show popup
      } else if (response.data.status === "failed") {
        setIsProcessing(false);
        alert("Payment failed. Please try again.");
      } else {
        // Still pending, check again
        setTimeout(checkPaymentStatus, 3000); // Check again after 3s
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
      setTimeout(checkPaymentStatus, 5000); // Try again even after error
    }
  };

  // Function to manually update payment status (for testing)
  const simulateSuccessfulPayment = async () => {
    try {
      if (!transactionId) return;
      
      await axios.post("http://localhost:3000/payment/complete", {
        transactionId,
        status: "success"
      });
      
      // Force check status immediately
      checkPaymentStatus();
    } catch (error) {
      console.error("Error simulating payment:", error);
    }
  };

  return (
    <div className="container mt-5">
      <h2>UPI Payment</h2>
      <div className="mb-3">
        <label>UPI ID</label>
        <input
          type="text"
          className="form-control"
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
          placeholder="example@upi"
          disabled={isProcessing}
        />
      </div>
      <div className="mb-3">
        <label>Amount</label>
        <input
          type="number"
          className="form-control"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={isProcessing}
          min="1"
          step="any"
        />
      </div>
      <button 
        className="btn btn-primary" 
        onClick={handlePayment}
        disabled={isProcessing}
      >
        {isProcessing ? "Processing..." : "Pay with UPI"}
      </button>

      {upiLink && !paymentSuccess && (
        <div className="mt-3">
          <h4>Transaction ID: {transactionId}</h4>
          <p>Scan this QR code to pay:</p>
          <QRCodeCanvas value={upiLink} size={200} />
          
          {/* For development/testing only */}
          <div className="mt-3">
            <button 
              className="btn btn-outline-secondary btn-sm" 
              onClick={simulateSuccessfulPayment}
            >
              Simulate Payment (Dev Only)
            </button>
          </div>
        </div>
      )}

      {paymentSuccess && (
        <div className="alert alert-success mt-3">
          ✅ Payment Successfully Completed!
          <p>Transaction ID: {transactionId}</p>
          <p>{amount} rupees has been credited to your account</p>
        </div>
      )}
    </div>
  );
};

export default UPIPayment;