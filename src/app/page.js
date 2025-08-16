"use client";
import { useRef, useState } from "react";

export default function App() {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [emails, setEmails] = useState("");
  const [prompt, setPrompt] = useState("");
  const transcriptRef = useRef();

  const handleSummarize = async () => {
    const file = transcriptRef.current?.files[0];
    if (!file) {
      setMessage("Please upload a transcript file.");
      setShowMessage(true);
      return;
    }
    if (!prompt) {
      setMessage("Please enter a custom instruction/prompt.");
      setShowMessage(true);
      return;
    }
    setLoading(true);
    // Send transcript and prompt to backend API for real Groq summary
    const text = await file.text();
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text, prompt }),
      });
      const data = await res.json();
      setSummary(data.summary);
      setMessage("Summary generated! You can now edit it.");
    } catch (err) {
      setSummary("");
      setMessage("Error generating summary. Please try again.");
    }
    setLoading(false);
    setShowMessage(true);
  };

  const handleSend = async () => {
    if (!summary) {
      setMessage("Please generate and edit a summary first.");
      setShowMessage(true);
      return;
    }
    if (!emails) {
      setMessage("Please enter at least one recipient email address.");
      setShowMessage(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary, recipients: emails }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Summary is being shared via email!");
      } else {
        setMessage(`Failed to send email: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      setMessage("Error sending email. Please try again.");
    }
    setLoading(false);
    setShowMessage(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="container bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">AI Meeting Notes Summarizer</h1>

        {/* File Upload Section */}
        <div className="section mb-4">
          <label htmlFor="transcript-upload" className="block text-lg font-semibold text-gray-700 mb-2">Upload Meeting Transcript:</label>
          <input type="file" id="transcript-upload" accept=".txt" ref={transcriptRef} className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out" />
        </div>

        {/* Custom Prompt Section */}
        <div className="section mb-4">
          <label htmlFor="custom-prompt" className="block text-lg font-semibold text-gray-700 mb-2">Custom Prompt / Instruction:</label>
          <textarea id="custom-prompt" value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="e.g., 'Summarize in bullet points for executives' or 'Highlight only action items.'" className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 bg-white resize-y min-h-[150px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out" />
        </div>

        {/* Generate Summary Button */}
        <div className="section mb-6">
          <button onClick={handleSummarize} disabled={loading} className={`w-full p-4 rounded-lg font-bold text-white transition duration-300 ease-in-out ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'}`}>
            {loading ? 'Generating...' : 'Generate Summary'}
          </button>
        </div>

        {/* Generated Summary Section */}
        <div className="section mb-4">
          <label htmlFor="summary-output" className="block text-lg font-semibold text-gray-700 mb-2">Generated Summary (Editable):</label>
          <textarea id="summary-output" value={summary} onChange={e => setSummary(e.target.value)} placeholder="Your AI-generated summary will appear here..." className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 bg-white resize-y min-h-[150px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out" />
        </div>

        {/* Share Summary Section */}
        <div className="section mb-4">
          <label htmlFor="recipient-emails" className="block text-lg font-semibold text-gray-700 mb-2">Share via Email (comma-separated):</label>
          <input type="email" id="recipient-emails" value={emails} onChange={e => setEmails(e.target.value)} placeholder="e.g., john.doe@example.com, jane.smith@example.com" className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out" />
        </div>

        {/* Share Summary Button */}
        <div className="section">
          <button onClick={handleSend} disabled={loading} className={`w-full p-4 rounded-lg font-bold text-white transition duration-300 ease-in-out ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'}`}>
            {loading ? 'Sharing...' : 'Share Summary'}
          </button>
        </div>
      </div>

      {/* Message Box for user feedback */}
      {showMessage && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl z-50 text-center border-2 border-gray-200">
          <p className="text-lg font-medium text-gray-800 mb-4">{message}</p>
          <button onClick={() => setShowMessage(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out">
            OK
          </button>
        </div>
      )}
    </div>
  );
}
