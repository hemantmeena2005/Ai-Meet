import { useState } from "react";

export default function SummaryEditor({ summary, onChange, onSend }) {
  const [emails, setEmails] = useState("");

  return (
    <div>
      <textarea
        placeholder="Summary"
        value={summary}
        onChange={e => onChange(e.target.value)}
      />
      <input
        placeholder="Recipient Emails"
        value={emails}
        onChange={e => setEmails(e.target.value)}
      />
      <button onClick={() => onSend(emails)}>Send Summary</button>
    </div>
  );
}
