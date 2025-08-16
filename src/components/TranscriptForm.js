import { useState } from "react";

export default function TranscriptForm({ onSummarize }) {
  const [transcript, setTranscript] = useState("");
  const [prompt, setPrompt] = useState("");

  const handleSummarize = async () => {
    await onSummarize(transcript, prompt);
  };

  return (
    <div>
      <textarea
        placeholder="Transcript"
        value={transcript}
        onChange={e => setTranscript(e.target.value)}
      />
      <input
        placeholder="Prompt"
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
      />
      <button onClick={handleSummarize}>Generate Summary</button>
    </div>
  );
}
