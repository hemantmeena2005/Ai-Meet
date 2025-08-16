"use client";
import { useRef, useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactMarkdown from "react-markdown";

// 🆕 Expandable History Card component
function HistoryCard({ item }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <li className="bg-white border rounded-xl shadow-sm p-4">
      {/* Summary */}
      <div className="text-sm text-gray-800 mb-2">
        <span className="font-semibold">Summary:</span>
        <div
          className={`prose prose-sm mt-2 transition-all duration-300 ${
            expanded ? "" : "line-clamp-2"
          }`}
          dangerouslySetInnerHTML={{
            __html: item.summaryHtml || item.summary,
          }}
        />
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-blue-600 text-xs mt-2 focus:outline-none"
        >
          {expanded ? "Show less ▲" : "Show more ▼"}
        </button>
      </div>

      {/* Recipients */}
      <div className="text-xs text-gray-600">
        <span className="font-semibold">Recipients:</span>{" "}
        {Array.isArray(item.recipients)
          ? item.recipients.join(", ")
          : item.recipients}
      </div>

      {/* Date */}
      <div className="text-xs text-gray-400 mt-1">
        {item.date ? new Date(item.date).toLocaleString() : ""}
      </div>
    </li>
  );
}

export default function App() {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [emails, setEmails] = useState("");
  const [prompt, setPrompt] = useState("");
  const [history, setHistory] = useState([]);
  const transcriptRef = useRef();

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch("/api/history");
        const data = await res.json();
        if (data.success) setHistory(data.history);
      } catch {
        // ignore errors for now
      }
    }
    fetchHistory();
  }, []);

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
    } catch {
      setSummary("");
      toast.error("Error generating summary. Please try again.");
    }
    setLoading(false);
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
    } catch {
      toast.error("Error sending email. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="container bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          AI Meeting Notes Summarizer
        </h1>

        {/* File Upload Section */}
        <div className="section mb-4">
          <label
            htmlFor="transcript-upload"
            className="block text-lg font-semibold text-gray-700 mb-2"
          >
            Upload Meeting Transcript:
          </label>
          <p className="text-black" >(use any txt file)</p>
          <input
            type="file"
            id="transcript-upload"
            accept=".txt"
            ref={transcriptRef}
            className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
          />
        </div>

        {/* Custom Prompt Section */}
        <div className="section mb-4">
          <label
            htmlFor="custom-prompt"
            className="block text-lg font-semibold text-gray-700 mb-2"
          >
            Custom Prompt / Instruction:
          </label>
          <textarea
            id="custom-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'Summarize in bullet points for executives' or 'Highlight only action items.'"
            className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 bg-white resize-y min-h-[150px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
          />
        </div>

        {/* Generate Summary Button */}
        <div className="section mb-6">
          <button
            onClick={handleSummarize}
            disabled={loading}
            className={`w-full p-4 rounded-lg font-bold text-white transition duration-300 ease-in-out ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            }`}
          >
            {loading ? "Generating..." : "Generate Summary"}
          </button>
        </div>

        {/* Editable Summary + Preview */}
        <div className="section mb-4">
          <label
            htmlFor="summary-output"
            className="block text-lg font-semibold text-gray-700 mb-2"
          >
            Generated Summary (Editable):
          </label>
          <textarea
            id="summary-output"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Your AI-generated summary will appear here..."
            className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 bg-white resize-y min-h-[150px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
          />

          <label className="block text-lg font-semibold text-gray-700 mt-4 mb-2">
            Preview:
          </label>
          <div className="w-full p-3 border border-gray-300 text-black rounded-lg bg-gray-50 min-h-[150px] whitespace-pre-wrap">
            <ReactMarkdown>{summary}</ReactMarkdown>
          </div>
        </div>

        {/* Share Summary Section */}
        <div className="section mb-4">
          <label
            htmlFor="recipient-emails"
            className="block text-lg font-semibold text-gray-700 mb-2"
          >
            Share via Email (comma-separated):
          </label>
          <input
            type="email"
            id="recipient-emails"
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            placeholder="e.g., john.doe@example.com, jane.smith@example.com"
            className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
          />
        </div>

        {/* Share Summary Button */}
        <div className="section">
          <button
            onClick={handleSend}
            disabled={loading}
            className={`w-full p-4 rounded-lg font-bold text-white transition duration-300 ease-in-out ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            }`}
          >
            {loading ? "Sharing..." : "Share Summary"}
          </button>
        </div>

        {/* History Section */}
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4 text-gray-700">
            Recent Summaries
          </h2>
          {history.length === 0 ? (
            <p className="text-gray-500">No history found.</p>
          ) : (
            <ul className="space-y-4">
              {history.map((item, idx) => (
                <HistoryCard key={item._id || idx} item={item} />
              ))}
            </ul>
          )}
        </div>

        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </div>
  );
}
