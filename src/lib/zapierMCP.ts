
/**
 * Zapier MCP SSE Integration
 * Streams results from Zapier MCP endpoint (Server-Sent Events)
 */
type ToolResult = {
  message: string;
  tool?: string;
  isFinal?: boolean;
};
type OnResultCallback = (data: ToolResult) => void;

/**
 * Connects to the Zapier MCP SSE endpoint, streams results as they arrive.
 * @param {string} sseUrl Your SSE endpoint
 * @param {string} prompt  The user prompt, passed as the 'message' query param
 * @param {OnResultCallback} onResult Called whenever data arrives
 * @returns A function to disconnect/cancel the stream
 */
export function connectZapierMCP(
  sseUrl: string,
  prompt: string,
  onResult: OnResultCallback,
) {
  // Add prompt as a query param
  const url = new URL(sseUrl);
  url.searchParams.set("message", prompt);

  console.log("[MCP] Connecting to", url.toString());

  const source = new EventSource(url.toString(), { withCredentials: false });

  source.onopen = () => {
    console.log("[MCP] SSE connection open");
  };
  source.onmessage = (event) => {
    console.log("[MCP] SSE message received", event.data);
    try {
      const json: ToolResult = JSON.parse(event.data);
      onResult(json);
    } catch (err) {
      // fallback: raw text
      onResult({ message: event.data });
    }
  };
  source.onerror = (event) => {
    console.error("[MCP] SSE error", event);
    source.close();
    onResult({ message: "Sorry, there was a problem with the tool connection.", isFinal: true });
  };
  // Return a disconnect/cleanup function
  return () => {
    console.log("[MCP] SSE connection closed");
    source.close();
  };
}
