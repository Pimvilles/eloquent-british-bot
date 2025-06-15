
const WEBHOOK_URL = "http://localhost:5678/webhook/3588d4a3-11a8-4a88-9e4b-5142113c5d06";

export const sendToWebhook = async (message: string, sender: "user" | "bot"): Promise<string | null> => {
  // Only send user messages to webhook to get AI responses
  // Don't send bot messages back to webhook to avoid feedback loop
  if (sender === "bot") {
    console.log("Skipping webhook call for bot message to avoid feedback loop");
    return null;
  }

  try {
    console.log("Sending to webhook:", { message, sender });
    
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
        context: "You are Melsi, Mr Moloto's AI assistant. You are helpful, professional, and ready to execute tasks.",
      }),
    });
    
    if (response.ok) {
      const contentType = response.headers.get("content-type");
      console.log("Response content type:", contentType);
      console.log("Response status:", response.status);
      
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        console.log("Full webhook JSON response:", JSON.stringify(data, null, 2));
        
        // Try multiple possible response formats
        let extractedResponse = null;
        
        // Format 1: Check for data.output (n8n AI Agent output)
        if (data && data.output) {
          extractedResponse = data.output;
          console.log("Found response in data.output:", extractedResponse);
        }
        // Format 2: Check for nested output structure
        else if (data && data.data && data.data.output) {
          extractedResponse = data.data.output;
          console.log("Found response in data.data.output:", extractedResponse);
        }
        // Format 3: Check for AI Agent item format
        else if (data && data.item && data.item.json && data.item.json.output) {
          extractedResponse = data.item.json.output;
          console.log("Found response in data.item.json.output:", extractedResponse);
        }
        // Format 4: Check for direct response property
        else if (data && data.response) {
          extractedResponse = data.response;
          console.log("Found response in data.response:", extractedResponse);
        }
        // Format 5: Check for message property
        else if (data && data.message) {
          extractedResponse = data.message;
          console.log("Found response in data.message:", extractedResponse);
        }
        // Format 6: Check if data itself is a string
        else if (typeof data === "string" && data.trim()) {
          extractedResponse = data.trim();
          console.log("Response is direct string:", extractedResponse);
        }
        // Format 7: Try to find any string value in the response
        else {
          console.log("Trying to extract any meaningful text from response...");
          const findTextInObject = (obj: any): string | null => {
            if (typeof obj === "string" && obj.trim()) {
              return obj.trim();
            }
            if (typeof obj === "object" && obj !== null) {
              for (const key in obj) {
                const result = findTextInObject(obj[key]);
                if (result) return result;
              }
            }
            return null;
          };
          extractedResponse = findTextInObject(data);
          if (extractedResponse) {
            console.log("Found text in nested object:", extractedResponse);
          }
        }
        
        if (extractedResponse && typeof extractedResponse === "string" && extractedResponse.trim()) {
          return extractedResponse.trim();
        }
      } else {
        // Handle plain text response
        const textResponse = await response.text();
        console.log("Webhook text response:", textResponse);
        
        if (textResponse && textResponse.trim()) {
          return textResponse.trim();
        }
      }
    } else {
      console.error("Webhook request failed with status:", response.status);
      const errorText = await response.text();
      console.error("Error response:", errorText);
    }
    
    console.log("Webhook request sent successfully but no valid response found");
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
          context: "You are Melsi, Mr Moloto's AI assistant. You are helpful, professional, and ready to execute tasks.",
        }),
      });
      console.log("Webhook request sent with no-cors mode");
    } catch (fallbackError) {
      console.error("Fallback webhook also failed:", fallbackError);
    }
    
    return null;
  }
};

// Voice call function - only send user messages to webhook
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
        context: "You are Melsi, Mr Moloto's AI assistant. Respond in a conversational voice-friendly manner.",
      }),
    });
    
    if (response.ok) {
      const contentType = response.headers.get("content-type");
      console.log("Voice response content type:", contentType);
      
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        console.log("Voice webhook JSON response:", JSON.stringify(data, null, 2));
        
        // Use the same comprehensive parsing logic for voice responses
        let extractedResponse = null;
        
        if (data && data.output) {
          extractedResponse = data.output;
        } else if (data && data.data && data.data.output) {
          extractedResponse = data.data.output;
        } else if (data && data.item && data.item.json && data.item.json.output) {
          extractedResponse = data.item.json.output;
        } else if (data && data.response) {
          extractedResponse = data.response;
        } else if (data && data.message) {
          extractedResponse = data.message;
        } else if (typeof data === "string" && data.trim()) {
          extractedResponse = data.trim();
        }
        
        if (extractedResponse && typeof extractedResponse === "string" && extractedResponse.trim()) {
          return extractedResponse.trim();
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
