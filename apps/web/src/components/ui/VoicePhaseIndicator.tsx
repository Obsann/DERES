import { VoiceSessionPhase } from '@voicesos/shared';
import { Icon, type IconName } from './Icon';

const phaseMeta: Record<VoiceSessionPhase, { label: string; icon: IconName; action: string }> = {
  [VoiceSessionPhase.IDLE]: { label: 'Tap to speak', icon: 'mic', action: 'Start speaking' },
  [VoiceSessionPhase.LISTENING]: {
    label: 'Listening — speak now',
    icon: 'mic',
    action: 'Stop listening',
  },
  [VoiceSessionPhase.PROCESSING]: { label: 'Thinking…', icon: 'dots', action: 'Please wait' },
  [VoiceSessionPhase.SPEAKING]: { label: 'Speaking', icon: 'speaker', action: 'Interrupt and speak' },
  [VoiceSessionPhase.AWAITING_CONFIRMATION]: {
    label: 'Say “done” when finished',
    icon: 'mic',
    action: 'Speak to confirm',
  },
  [VoiceSessionPhase.ERROR]: { label: 'Voice unavailable', icon: 'micOff', action: 'Try voice again' },
};

interface VoicePhaseIndicatorProps {
  phase: VoiceSessionPhase;
  /** Overrides the default label, e.g. a localized string. */
  label?: string;
  onMicPress?: () => void;
}

/** Mic button plus the phase in words. The phase is never conveyed by color alone. */
export function VoicePhaseIndicator({ phase, label, onMicPress }: VoicePhaseIndicatorProps) {
  const meta = phaseMeta[phase];
  const busy = phase === VoiceSessionPhase.PROCESSING;
  return (
    <div className={`d-voice d-voice--${phase}`}>
      <button
        type="button"
        className="d-voice__mic"
        onClick={onMicPress}
        disabled={busy || !onMicPress}
        aria-label={meta.action}
      >
        <Icon name={meta.icon} />
      </button>
      <p className="d-voice__label" role="status" aria-live="polite">
        {label ?? meta.label}
      </p>
    </div>
  );
}
