import { Certainty, type HandoffFact } from '@voicesos/shared';
import { CertaintyBadge } from './Badge';

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Responder facts. Every row carries its certainty so "not breathing" and
 * "breathing not established" can never look alike.
 */
export function FactList({ facts, emptyLabel = 'Nothing recorded yet' }: { facts: HandoffFact[]; emptyLabel?: string }) {
  if (facts.length === 0) {
    return <p style={{ margin: 0, color: 'var(--d-ink-muted)' }}>{emptyLabel}</p>;
  }
  return (
    <ul className="d-facts">
      {facts.map((fact) => (
        <li
          key={`${fact.label}-${fact.establishedAt ?? 'none'}`}
          className={`d-fact${fact.certainty === Certainty.UNKNOWN ? ' d-fact--unknown' : ''}`}
        >
          <span className="d-fact__label">{fact.label}</span>
          <span className="d-fact__value">
            {fact.value}
            {fact.establishedAt ? (
              <time className="d-fact__time" dateTime={fact.establishedAt}>
                {formatTime(fact.establishedAt)}
              </time>
            ) : null}
          </span>
          <CertaintyBadge certainty={fact.certainty} />
        </li>
      ))}
    </ul>
  );
}
