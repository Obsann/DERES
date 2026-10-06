import type { ReactNode } from 'react';
import { ProtocolStepKind } from '@voicesos/shared';
import { Icon, type IconName } from './Icon';

const kindMeta: Record<ProtocolStepKind, { label: string; icon: IconName }> = {
  [ProtocolStepKind.QUESTION]: { label: 'Question', icon: 'question' },
  [ProtocolStepKind.ASSESSMENT]: { label: 'Check', icon: 'question' },
  [ProtocolStepKind.ACTION]: { label: 'Do this now', icon: 'check' },
  [ProtocolStepKind.ESCALATION]: { label: 'Get help now', icon: 'alert' },
  [ProtocolStepKind.EXIT]: { label: 'Keep going', icon: 'check' },
};

const kindModifier: Record<ProtocolStepKind, string> = {
  [ProtocolStepKind.QUESTION]: 'question',
  [ProtocolStepKind.ASSESSMENT]: 'question',
  [ProtocolStepKind.ACTION]: 'action',
  [ProtocolStepKind.ESCALATION]: 'escalation',
  [ProtocolStepKind.EXIT]: 'exit',
};

interface InstructionCardProps {
  kind: ProtocolStepKind;
  /** The protocol prompt exactly as the server returned it. Never rewrite it client-side. */
  text: string;
  /** e.g. "Step 2". */
  progress?: string;
  lang?: string;
  /** Localized heading; defaults to the English label for the step kind. */
  kindLabel?: string;
  /** Replaces the kind icon, e.g. a speaker while the line is read aloud. */
  icon?: IconName;
  /** Answer or confirmation controls rendered under the text. */
  children?: ReactNode;
}

/** The single thing the bystander must know or do right now. One per screen. */
export function InstructionCard({ kind, text, progress, lang, kindLabel, icon, children }: InstructionCardProps) {
  const meta = kindMeta[kind];
  return (
    <section
      className={`d-instruction d-instruction--${kindModifier[kind]}`}
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="d-instruction__meta">
        <span className="d-instruction__kind">
          <span className="d-instruction__icon">
            <Icon name={icon ?? meta.icon} />
          </span>
          <span lang={kindLabel ? lang : undefined}>{kindLabel ?? meta.label}</span>
        </span>
        {progress ? (
          <span className="d-instruction__progress" lang={lang}>
            {progress}
          </span>
        ) : null}
      </div>
      <h2 className="d-instruction__text" lang={lang}>
        {text}
      </h2>
      {children ? (
        <>
          <hr className="d-instruction__divider" />
          {children}
        </>
      ) : null}
    </section>
  );
}
