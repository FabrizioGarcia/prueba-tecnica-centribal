import { useEffect, useState } from "react";
import { listAgents } from "../api/agents";

export default function AgentAutocomplete({
  selected,
  onSelect,
  onRemove,
  multiple = false,
  placeholder = "Search agent by username...",
  excludeIds = [],
}) {
  const [allAgents, setAllAgents] = useState([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    listAgents()
      .then(setAllAgents)
      .catch(() => setAllAgents([]));
  }, []);

  const selectedList = multiple ? selected : selected ? [selected] : [];
  const excludedIds = new Set([...selectedList.map((agent) => agent.id), ...excludeIds]);

  const results = query.trim()
    ? allAgents.filter(
        (agent) =>
          !excludedIds.has(agent.id) &&
          (agent.username.toLowerCase().includes(query.trim().toLowerCase()) ||
            agent.email.toLowerCase().includes(query.trim().toLowerCase()))
      )
    : allAgents.filter((agent) => !excludedIds.has(agent.id));

  function handlePick(agent) {
    onSelect(agent);
    setQuery("");
    setOpen(false);
  }

  return (
    <div className="agent-autocomplete">
      {multiple && selectedList.length > 0 && (
        <div className="agent-chips">
          {selectedList.map((agent) => (
            <span key={agent.id} className="chip">
              @{agent.username}
              <button
                type="button"
                onClick={() => onRemove(agent)}
                aria-label={`Remove ${agent.username}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {!multiple && selected && (
        <div className="selected-agent-detail">
          <div>
            <strong>{selected.username}</strong>
            <span className="meta">{selected.email}</span>
          </div>
          <button
            type="button"
            onClick={() => onRemove(selected)}
            aria-label={`Remove ${selected.username}`}
          >
            ×
          </button>
        </div>
      )}

      {(multiple || !selected) && (
        <div className="agent-autocomplete-input">
          <input
            type="text"
            value={query}
            placeholder={placeholder}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
          />
          {open && results.length > 0 && (
            <ul className="agent-suggestions">
              {results.map((agent) => (
                <li key={agent.id} onMouseDown={() => handlePick(agent)}>
                  {agent.username} <span className="meta">{agent.email}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
