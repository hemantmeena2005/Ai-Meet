
"use client";
import { useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  // Remove custom popup state
  const [emails, setEmails] = useState("");
  const [prompt, setPrompt] = useState("");
  const transcriptRef = useRef();

  const handleSummarize = async () => {
    const file = transcriptRef.current?.files[0];
    if (!file) {
  toast.error("Please upload a transcript file.");
      return;
    }
    if (!prompt) {
  toast.error("Please enter a custom instruction/prompt.");
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
  toast.success("Summary generated! You can now edit it.");
    } catch (err) {
      setSummary("");
  toast.error("Error generating summary. Please try again.");
    }
    setLoading(false);
    // setShowMessage(true);
  };

  const handleSend = async () => {
    if (!summary) {
  toast.error("Please generate and edit a summary first.");
      return;
    }
    if (!emails) {
  toast.error("Please enter at least one recipient email address.");
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
        toast.success("Summary is being shared via email!");
      } else {
        toast.error(`Failed to send email: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
  toast.error("Error sending email. Please try again.");
    }
    setLoading(false);
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
  <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
}
