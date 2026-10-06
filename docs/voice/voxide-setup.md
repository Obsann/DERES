# Voxide setup (English, Amharic, Afaan Oromoo)

Voxide is a browser SDK (`@voxide/react`) that runs a Gemini Live voice agent.
It hears the user and speaks, but DERES decides every word: the agent calls the
`reportToDeres` capability with what the user said, and reads back the
protocol line the server returns. Code: `apps/web/src/services/voice/voxide.ts`
and `apps/web/src/hooks/useDeresVoice.ts`.

## 1. Key

1. In the Voxide dashboard, open the project → **Integration** and copy the
   publishable key (`vox_pub_…`).
2. Create `apps/web/.env` (gitignored):

   ```bash
   VITE_VOXIDE_PUBLIC_KEY=vox_pub_...
   ```

3. Restart `npm run dev:web`.

The publishable key is meant to be public, but only whitelisted domains can use
it. `localhost` works automatically; add the deployed web domain under
**Domain whitelist** before the demo.

## 2. Agent prompt (paste into the dashboard)

Set the agent's prompt in the Voxide dashboard to:

```text
You are DERES. Your name is DERES. You are not a doctor and you never give medical advice of your own.

One turn is one decision. The app decides it. You do not.

For every thing the person says, call reportToDeres with their exact words,
in the language they spoke. Do not speak before the tool returns.
The app says it is thinking while you wait. Do not add your own progress line.

Then say the returned sayExactly text word for word, in that language, and stop.
Do not add, remove, summarise, translate, or describe the tool.
If the tool fails, say only: "Call emergency services now." in the person's language.

If they ask to call for help, call callEmergencyServices. Do not claim the call
happened unless the tool returns dialer_opened.
Speak only in the session language. Keep your own words to zero.
```

Greeting (dashboard): leave empty. The page speaks a short greeting itself
before the microphone opens, so a dead speaker is obvious before they ask.

## 3. Languages

| DERES | Voxide / Gemini Live tag |
|---|---|
| English | `en-US` |
| Amharic | `am-ET` |
| Afaan Oromoo | `om-ET` |

`bindDeresSession` locks the agent to the incident language
(`enableMultilingual({ mode: 'strict' })`). The protocol and all fixed phrases
exist in all three languages; see `docs/ux/translation-review.md` for review
status.

## 4. Verify

1. Start the server with `LLM_API_KEY` set, and the web app with the Voxide key.
2. Open an incident in Amharic, connect voice, say "ጓደኛዬ ወደቀ፣ አይመልስም".
3. Expect to hear exactly: "አሁኑኑ ወደ ድንገተኛ አገልግሎት ይደውሉ። ከቻሉ ስልኩን በድምጽ ማጉያ ላይ ያድርጉት።"
4. Repeat in Afaan Oromoo: "Hiriyaan koo kufe, deebii hin kennu" →
   "Amma tajaajila balaa tasaatiif bilbili. Yoo dandeesse, bilbilaa sagalee guddaa irra kaa'i."

If the agent paraphrases instead of reading verbatim, tighten the dashboard
prompt first; the on-screen instruction card always shows the exact protocol text.

## Known limits

- Gemini Live may still rephrase slightly. The screen text is authoritative.
- Voxide stores transcripts in its dashboard. Mark nothing as `sensitive` yet;
  revisit if names or addresses are spoken (Task 12 review).
- `VOXIDE_API_KEY` / `HttpVoxideProvider` on the server call a `/transcribe`
  endpoint that the public Voxide SDK does not document. The browser path above
  does not depend on it.
