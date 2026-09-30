import type { CSSProperties, ReactNode } from 'react';
import {
  ActionStatus,
  Certainty,
  ConnectionStatus,
  EscalationState,
  IncidentStatus,
  ProtocolStepKind,
  VoiceSessionPhase,
  type HandoffFact,
} from '@voicesos/shared';
import { emergencyCallHref } from '@/config/emergency';
import {
  ActionStatusBadge,
  Banner,
  Button,
  ButtonLink,
  CertaintyBadge,
  ConnectionBadge,
  EscalationBadge,
  FactList,
  IncidentStatusBadge,
  InstructionCard,
  Panel,
  VoicePhaseIndicator,
} from '@/components/ui';

const sampleFacts: HandoffFact[] = [
  { label: 'Responsiveness', value: 'Not responding', certainty: Certainty.KNOWN, establishedAt: '2026-09-30T08:02:10.000Z' },
  { label: 'Breathing', value: 'Not breathing normally', certainty: Certainty.UNCERTAIN, establishedAt: '2026-09-30T08:03:05.000Z' },
  { label: 'Age group', value: 'Not established', certainty: Certainty.UNKNOWN, establishedAt: null },
];

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="d-stack" style={{ '--d-stack-gap': 'var(--d-space-3)' } as CSSProperties}>
      <h2 style={{ margin: 0, fontSize: 'var(--d-text-xl)' }}>{title}</h2>
      {note ? <p style={{ margin: 0, color: 'var(--d-ink-muted)' }}>{note}</p> : null}
      {children}
    </section>
  );
}

function Frame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <figure style={{ margin: 0, flex: '1 1 20rem', maxWidth: '26rem' }}>
      <figcaption style={{ fontSize: 'var(--d-text-sm)', color: 'var(--d-ink-muted)', marginBottom: 'var(--d-space-2)' }}>
        {label}
      </figcaption>
      <div
        className="d-stack"
        style={{
          padding: 'var(--d-space-4)',
          background: 'var(--d-canvas)',
          border: '1px solid var(--d-border)',
          borderRadius: 'var(--d-radius-md)',
        }}
      >
        {children}
      </div>
    </figure>
  );
}

/** Living reference for docs/ux/design-system.md. Not part of the bystander flow. */
export function DesignSystemPage() {
  return (
    <main className="d-dashboard-layout d-stack" style={{ '--d-stack-gap': 'var(--d-space-7)' } as CSSProperties}>
      <header className="d-stack" style={{ '--d-stack-gap': 'var(--d-space-2)' } as CSSProperties}>
        <h1 style={{ margin: 0, fontSize: 'var(--d-text-display)', lineHeight: 'var(--d-leading-tight)' }}>
          DERES UI kit
        </h1>
        <p style={{ margin: 0, color: 'var(--d-ink-muted)' }}>
          Components from <code>@/components/ui</code>. Rules and rationale: <code>docs/ux/design-system.md</code>.
        </p>
      </header>

      <Section title="Buttons" note="Emergency red is reserved for starting an emergency and calling emergency services.">
        <div className="d-row">
          <Button variant="emergency" size="xl" icon="alert">Start emergency</Button>
          <ButtonLink variant="emergency" size="lg" icon="phone" href={emergencyCallHref}>Call emergency services</ButtonLink>
        </div>
        <div className="d-row">
          <Button variant="primary" size="lg" icon="check">Done</Button>
          <Button variant="secondary" size="lg" icon="x">I can't</Button>
          <Button variant="secondary" size="lg" icon="repeat">Repeat</Button>
          <Button variant="quiet">Change language</Button>
        </div>
        <div className="d-row">
          <Button>Dashboard primary</Button>
          <Button variant="secondary">Dashboard secondary</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Section>

      <Section title="Instruction cards" note="One card per screen. Text is the protocol prompt, unchanged.">
        <div className="d-row" style={{ alignItems: 'stretch' }}>
          <Frame label="Question step">
            <InstructionCard kind={ProtocolStepKind.QUESTION} text="Tap their shoulders and shout. Are they responding to you?" progress="Step 1">
              <div className="d-stack" style={{ '--d-stack-gap': 'var(--d-space-2)' } as CSSProperties}>
                <Button size="lg" block>Yes</Button>
                <Button size="lg" block>No</Button>
                <Button size="lg" variant="secondary" block icon="question">Not sure</Button>
              </div>
            </InstructionCard>
          </Frame>
          <Frame label="Action step needing confirmation">
            <InstructionCard kind={ProtocolStepKind.ACTION} text="Tilt the head back and lift the chin to open the airway." progress="Step 3">
              <div className="d-stack" style={{ '--d-stack-gap': 'var(--d-space-2)' } as CSSProperties}>
                <Button size="lg" block icon="check">Done</Button>
                <div className="d-row" style={{ '--d-row-gap': 'var(--d-space-2)' } as CSSProperties}>
                  <Button size="lg" variant="secondary" icon="x" style={{ flex: 1 }}>I can't</Button>
                  <Button size="lg" variant="secondary" icon="repeat" style={{ flex: 1 }}>Repeat</Button>
                </div>
              </div>
            </InstructionCard>
          </Frame>
          <Frame label="Escalation">
            <InstructionCard kind={ProtocolStepKind.ESCALATION} text="This guidance is for adults. Call emergency services and follow their instructions.">
              <ButtonLink variant="emergency" size="lg" icon="phone" href={emergencyCallHref} block>Call emergency services</ButtonLink>
            </InstructionCard>
          </Frame>
          <Frame label="Exit step">
            <InstructionCard kind={ProtocolStepKind.EXIT} text="Keep pushing in the centre of the chest until emergency services take over.">
              <Button size="lg" variant="secondary" block>Help has arrived</Button>
            </InstructionCard>
          </Frame>
        </div>
      </Section>

      <Section title="Voice phases" note="Always icon + words. Listening pulses unless the user prefers reduced motion.">
        <div className="d-row" style={{ alignItems: 'flex-start', '--d-row-gap': 'var(--d-space-6)' } as CSSProperties}>
          {Object.values(VoiceSessionPhase).map((phase) => (
            <VoicePhaseIndicator key={phase} phase={phase} onMicPress={() => undefined} />
          ))}
        </div>
      </Section>

      <Section title="Banners" note="Each failure banner carries exactly one recovery action.">
        <Banner tone="critical" title="Call emergency services now." action={<ButtonLink variant="emergency" icon="phone" href={emergencyCallHref}>Call</ButtonLink>}>
          They are not responding.
        </Banner>
        <Banner tone="warning" title="Connection lost — reconnecting." icon="wifiOff">
          Keep following the last instruction.
        </Banner>
        <Banner tone="warning" title="We can't hear you." icon="micOff" action={<Button variant="secondary">Allow microphone</Button>}>
          You can still use the buttons.
        </Banner>
        <Banner tone="info" title="Sorry, I didn't catch that.">Say it again, or use the buttons.</Banner>
        <Banner tone="success" title="Help has arrived.">Show this summary to the responder.</Banner>
      </Section>

      <Section title="Badges" note="Certainty labels are mandatory on every responder fact.">
        <div className="d-row">
          {Object.values(Certainty).map((value) => <CertaintyBadge key={value} certainty={value} />)}
        </div>
        <div className="d-row">
          {Object.values(EscalationState).map((value) => <EscalationBadge key={value} state={value} />)}
        </div>
        <div className="d-row">
          {Object.values(IncidentStatus).map((value) => <IncidentStatusBadge key={value} status={value} />)}
        </div>
        <div className="d-row">
          {Object.values(ActionStatus).map((value) => <ActionStatusBadge key={value} status={value} />)}
        </div>
        <div className="d-row">
          {Object.values(ConnectionStatus).map((value) => <ConnectionBadge key={value} status={value} />)}
        </div>
      </Section>

      <Section title="Responder panels">
        <div className="d-stack">
          <Panel title="Warnings" emphasis="critical">
            <Banner tone="critical" title="Unresponsive and not breathing normally." />
          </Panel>
          <Panel title="Critical facts" aside={<EscalationBadge state={EscalationState.ESCALATED} />}>
            <FactList facts={sampleFacts} />
          </Panel>
          <Panel title="Unknown or uncertain" emphasis="uncertain">
            <ul style={{ margin: 0, paddingLeft: 'var(--d-space-5)' }}>
              <li>Breathing — user gave two different answers</li>
              <li>Age group — never asked</li>
            </ul>
          </Panel>
        </div>
      </Section>

      <Section title="Type" note="Amharic uses Ge'ez fonts and taller line height via :lang(am).">
        <p style={{ margin: 0, fontSize: 'var(--d-text-instruction)', fontWeight: 700, lineHeight: 'var(--d-leading-tight)' }}>
          Push hard and fast in the centre of the chest.
        </p>
        <p lang="am" style={{ margin: 0, fontSize: 'var(--d-text-xl)' }}>አማርኛ — የድንገተኛ ጊዜ እርዳታ</p>
        <p lang="om" style={{ margin: 0, fontSize: 'var(--d-text-xl)' }}>Afaan Oromoo — gargaarsa ariifachiisaa</p>
      </Section>
    </main>
  );
}
