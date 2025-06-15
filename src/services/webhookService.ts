
const WEBHOOK_URL = "http://localhost:5678/webhook-test/3588d4a3-11a8-4a88-9e4b-5142113c5d06";

export const sendToWebhook = async (message: string, sender: "user" | "bot") => {
  try {
    console.log("Sending to webhook:", { message, sender });
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        sender,
        timestamp: new Date().toISOString(),
        from: "Melsi Chatbot",
      }),
    });
  } catch (error) {
    console.error("Error sending to webhook:", error);
  }
};
