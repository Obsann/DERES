import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ACCESS_CODE_LENGTH, normalizeAccessCode } from '@voicesos/shared';
import { isApiClientError, incidentsApi, queryKeys, toUiErrorMessage } from '@/services/api';
import { responderIncidentPath } from '@/routes/paths';
import { signOutIfUnauthorized } from './format';
import { ResponderGate } from './ResponderGate';
import { ResponderShell } from './ResponderShell';

function SceneLookup() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [code, setCode] = useState('');
  const lookup = useMutation({
    mutationFn: () => incidentsApi.lookupByCode({ code }),
    onSuccess: (incident) => {
      queryClient.setQueryData(queryKeys.incidents.detail(incident.id), incident);
      navigate(responderIncidentPath(incident.id));
    },
  });

  useEffect(() => signOutIfUnauthorized(lookup.error), [lookup.error]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    lookup.mutate();
  };

  const normalized = normalizeAccessCode(code);
  const ready = normalized.length === ACCESS_CODE_LENGTH;

  return (
    <ResponderShell>
      <div className="mx-auto grid min-h-[calc(100vh-64px)] w-full max-w-[1680px] items-center px-6 py-12 md:px-10 lg:grid-cols-2 lg:gap-20 xl:px-16">
        <section>
          <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#087a65]">907 handoff</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">Open the scene in front of you.</h1>
          <p className="mt-4 max-w-xl text-sm font-medium leading-relaxed text-[#60717e]">
            Ask the bystander for the four-character code on their phone. You will only see that patient — not every live emergency.
          </p>
        </section>
        <form
          onSubmit={submit}
          className="mt-10 rounded-2xl border border-[#cbd5dc] bg-white p-6 shadow-[0_16px_45px_rgba(29,54,72,0.08)] sm:p-8 lg:mt-0"
        >
          <label className="block text-xs font-extrabold uppercase tracking-[0.1em] text-[#3d4f5c]" htmlFor="scene-code">
            Scene code
          </label>
          <input
            id="scene-code"
            className="mt-2 h-16 w-full rounded-xl border border-[#8a9aa6] bg-white px-4 text-center text-3xl font-extrabold tracking-[0.35em] text-[#12202d] uppercase outline-none placeholder:text-lg placeholder:tracking-normal placeholder:text-[#6d7d87] focus:border-[#087a65] focus:ring-4 focus:ring-[#087a65]/10"
            inputMode="text"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={8}
            placeholder="K7M2"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
          />
          {lookup.isError ? (
            <p className="mt-4 text-sm font-bold text-[#aa281f]" role="alert">
              {isApiClientError(lookup.error) && lookup.error.status === 404
                ? 'No live scene uses that code. Check the bystander’s phone.'
                : toUiErrorMessage(lookup.error)}
            </p>
          ) : (
            <p className="mt-4 text-sm font-semibold text-[#60717e]">The bystander reads this code to you on scene.</p>
          )}
          <button
            type="submit"
            disabled={!ready || lookup.isPending}
            className="mt-6 min-h-14 w-full rounded-xl bg-[#0a5c4e] px-5 text-base font-extrabold text-white disabled:opacity-50"
          >
            {lookup.isPending ? 'Opening scene…' : 'Open this patient'}
          </button>
        </form>
      </div>
    </ResponderShell>
  );
}

/** R1 · Scene lookup by the bystander's short code. */
export function ResponderListPage() {
  return (
    <ResponderGate>
      <SceneLookup />
    </ResponderGate>
  );
}
