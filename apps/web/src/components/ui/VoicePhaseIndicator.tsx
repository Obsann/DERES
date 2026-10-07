import { VoiceSessionPhase } from '@voicesos/shared';
import { Icon, type IconName } from './Icon';

const phaseMeta: Record<VoiceSessionPhase, { label: string; icon: IconName; action: string }> = {
  [VoiceSessionPhase.IDLE]: { label: 'Tap to speak', icon: 'mic', action: 'Start speaking' },
  [VoiceSessionPhase.LISTENING]: {
    label: 'Listening — tap when finished',
    icon: 'signal',
    action: 'Stop listening',
  },
  [VoiceSessionPhase.PROCESSING]: { label: 'Understanding…', icon: 'pulse', action: 'Please wait' },
  [VoiceSessionPhase.SPEAKING]: {
    label: 'DERES is speaking — tap to interrupt',
    icon: 'volume',
    action: 'Interrupt and speak',
  },
  [VoiceSessionPhase.AWAITING_CONFIRMATION]: {
    label: 'Say “done” when finished',
    icon: 'mic',
    action: 'Speak to confirm',
  },
  [VoiceSessionPhase.ERROR]: { label: 'Voice unavailable — tap to retry', icon: 'mic', action: 'Try voice again' },
};

interface VoicePhaseIndicatorProps {
  phase: VoiceSessionPhase;
  /** Overrides the default label, e.g. a localized string. */
  label?: string;
  /** One short line under the label, e.g. what they can say. */
  hint?: string;
  lang?: string;
  /** Live mic loudness, 0..1. */
  level?: number;
  onMicPress?: () => void;
}

/** Mic button plus the phase in words. The phase is never conveyed by color alone. */
export function VoicePhaseIndicator({ phase, label, hint, lang, onMicPress }: VoicePhaseIndicatorProps) {
  const meta = phaseMeta[phase];
  const listening = phase === VoiceSessionPhase.LISTENING;
  const speaking = phase === VoiceSessionPhase.SPEAKING;
  const error = phase === VoiceSessionPhase.ERROR;
  const shown = label ?? meta.label;

  return (
    <div className="flex flex-col items-center gap-3 md:flex-row md:items-center md:gap-4">
      <button
        type="button"
        className={`voice-control relative grid size-20 shrink-0 place-items-center rounded-full border-2 md:size-16 xl:size-20 ${
          listening
            ? 'is-listening border-[#86e9c6] bg-[#86e9c6] text-[#07130f]'
            : speaking
              ? 'border-[#86e9c6] bg-white text-[#07130f]'
              : error
                ? 'border-[#ff866f] bg-[#361915] text-[#ffad9e]'
                : 'border-white/30 bg-white text-[#07130f]'
        }`}
        onClick={onMicPress}
        disabled={!onMicPress}
        aria-label={meta.action}
      >
        {listening ? <span className="voice-ring absolute inset-[-10px] rounded-full border-2 border-[#86e9c6]/60" /> : null}
        <Icon name={meta.icon} className="size-8 md:size-7 xl:size-8" />
      </button>
      <div className="text-center md:text-left">
        <p className="text-sm font-extrabold text-white" role="status" aria-live="polite" lang={lang}>
          {shown}
        </p>
        {hint ? (
          <p className="mt-1 max-w-[16rem] text-xs font-medium text-white/50" lang={lang}>
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}
