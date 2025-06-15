const WEBHOOK_URL = "http://localhost:5678/webhook-test/3588d4a3-11a8-4a88-9e4b-5142113c5d06";

export const sendToWebhook = async (message: string, sender: "user" | "bot"): Promise<string | null> => {
  try {
    console.log("Sending to webhook:", { message, sender });
    
    // Try without no-cors first to get the response
    const response = await fetch(WEBHOOK_URL, {
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
    
    if (response.ok) {
      const contentType = response.headers.get("content-type");
      console.log("Response content type:", contentType);
      
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        console.log("Webhook JSON response:", data);
        
        // Extract the AI response from the expected format
        if (data && data.output) {
          return data.output;
        }
      } else {
        // Handle plain text response
        const textResponse = await response.text();
        console.log("Webhook text response:", textResponse);
        
        if (textResponse && textResponse.trim()) {
          return textResponse.trim();
        }
      }
    }
    
    console.log("Webhook request sent successfully but no valid response");
    return null;
  } catch (error) {
    console.error("Error sending to webhook:", error);
    
    // Fallback: try with no-cors mode for at least sending the data
    try {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          message,
          sender,
          timestamp: new Date().toISOString(),
          from: "Melsi Chatbot",
        }),
      });
      console.log("Webhook request sent with no-cors mode");
    } catch (fallbackError) {
      console.error("Fallback webhook also failed:", fallbackError);
    }
    
    return null;
  }
};

// New function specifically for voice calls that returns the response directly
export const sendVoiceMessageToWebhook = async (message: string): Promise<string | null> => {
  try {
    console.log("Sending voice message to webhook:", { message });
    
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        sender: "user",
        timestamp: new Date().toISOString(),
        from: "Melsi Voice Call",
        isVoiceCall: true,
      }),
    });
    
    if (response.ok) {
      const contentType = response.headers.get("content-type");
      console.log("Voice response content type:", contentType);
      
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        console.log("Voice webhook JSON response:", data);
        
        if (data && data.output) {
          return data.output;
        }
      } else {
        const textResponse = await response.text();
        console.log("Voice webhook text response:", textResponse);
        
        if (textResponse && textResponse.trim()) {
          return textResponse.trim();
        }
      }
    }
    
    console.log("Voice webhook request sent but no valid response");
    return null;
  } catch (error) {
    console.error("Error sending voice message to webhook:", error);
    return null;
  }
};
