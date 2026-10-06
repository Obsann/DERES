# Translation review — Amharic & Afaan Oromoo

**Task:** 35 (Multilingual UX review)
**Status:** Drafted 2026-09-30, **not yet reviewed by a native speaker.**
**Sources:** `packages/protocols/src/unconsciousAdult.ts`, `apps/server/src/ai/phrases.ts`,
`apps/server/src/voice/classify.ts`

These lines are spoken to someone doing CPR. A reviewer fluent in the language
must confirm each one before the demo. Check that it is:

1. **Correct** — same instruction as the English, nothing added or softened.
2. **Speakable** — short, natural when read aloud by a voice engine.
3. **Plain** — words an untrained bystander in Addis or Oromia would understand.

Mark `[x]` when approved; write corrections directly into the source file.

## Protocol steps

| Step | English | Amharic | Afaan Oromoo | am | om |
|---|---|---|---|---|---|
| check-response | Tap their shoulders and shout. Are they responding to you? | ትከሻቸውን መታ መታ አድርገው ጮክ ብለው ይጥሯቸው። ምላሽ እየሰጡዎት ነው? | Gateettii isaanii rurrukutii sagalee ol kaasii waami. Deebii siif kennaa jiru? | [ ] | [ ] |
| call-ems | Call emergency services now. Put the phone on speaker if you can. | አሁኑኑ ወደ ድንገተኛ አገልግሎት ይደውሉ። ከቻሉ ስልኩን በድምጽ ማጉያ ላይ ያድርጉት። | Amma tajaajila balaa tasaatiif bilbili. Yoo dandeesse, bilbilaa sagalee guddaa irra kaa'i. | [ ] | [ ] |
| open-airway | Tilt the head back and lift the chin to open the airway. | የመተንፈሻ መንገዱን ለመክፈት ጭንቅላታቸውን ወደ ኋላ ዘንበል አድርገው አገጫቸውን ቀና ያድርጉ። | Karaa hargansuu banuuf mataa isaanii gara duubaatti gad qabii, areeda isaanii ol kaasi. | [ ] | [ ] |
| check-breathing | Look, listen and feel for up to 10 seconds. Are they breathing normally? | እስከ 10 ሰከንድ ድረስ ይመልከቱ፣ ያዳምጡ እና ይሰማቸው። በመደበኛ ሁኔታ እየተነፈሱ ነው? | Hanga sekondii 10tti ilaali, dhaggeeffadhu, akkasumas miiri. Haala idileetiin hargansaa jiru? | [ ] | [ ] |
| cpr | Push hard and fast in the centre of the chest. Keep going until help takes over. Do not stop to check for a pulse. | በደረታቸው መሃል ላይ አጥብቀው እና በፍጥነት ይጫኑ። እርዳታ እስኪደርስ ድረስ ይቀጥሉ። የልብ ምት ለመፈተሽ አያቁሙ። | Walakkaa qomaa irratti jabeessii fi saffisaan dhiibi. Hanga gargaarsi dhufee si bakka bu'utti itti fufi. Rukuttaa onnee ilaaluuf hin dhaabatin. | [ ] | [ ] |
| recovery-position | Roll them onto their side. Tilt the head back so they can keep breathing. Stay with them. | ወደ ጎናቸው ያዙሯቸው። መተንፈሳቸውን እንዲቀጥሉ ጭንቅላታቸውን ወደ ኋላ ዘንበል ያድርጉ። ከአጠገባቸው አይለዩ። | Cinaacha isaaniitti garagalchi. Akka hargansuu itti fufaniif mataa isaanii gara duubaatti gad qabi. Isaan bira turi. | [ ] | [ ] |
| wait-for-help | Keep pushing in the centre of the chest until emergency services take over. | የድንገተኛ አገልግሎት ሠራተኞች እስኪረከቡ ድረስ በደረት መሃል ላይ መጫንዎን ይቀጥሉ። | Hanga hojjettoonni tajaajila balaa tasaa si bakka bu'anitti walakkaa qomaa dhiibuu itti fufi. | [ ] | [ ] |
| stay-breathing | Stay with them. If breathing stops, start pushing in the centre of the chest. | ከአጠገባቸው አይለዩ። መተንፈሳቸው ካቆመ በደረት መሃል ላይ መጫን ይጀምሩ። | Isaan bira turi. Yoo hargansuun dhaabate, walakkaa qomaa dhiibuu jalqabi. | [ ] | [ ] |
| stay-responsive | They are responding. Stay with them and keep checking while you wait for help if you have already called. | ምላሽ እየሰጡ ነው። ከአጠገባቸው ይቆዩ፤ አስቀድመው ደውለው ከሆነ እርዳታ እስኪመጣ ድረስ ሁኔታቸውን መከታተልዎን ይቀጥሉ። | Deebii kennaa jiru. Isaan bira turi; yoo duraan bilbilte, hanga gargaarsi dhufutti haala isaanii hordofuu itti fufi. | [ ] | [ ] |

## Escalation instructions

| Rule | English | Amharic | Afaan Oromoo | am | om |
|---|---|---|---|---|---|
| escalate-child | This guidance is for adults. Call emergency services and follow their instructions. | ይህ መመሪያ ለአዋቂዎች ነው። ወደ ድንገተኛ አገልግሎት ደውለው መመሪያቸውን ይከተሉ። | Qajeelfamni kun kan ga'eessotaati. Tajaajila balaa tasaatiif bilbiliitii qajeelfama isaanii hordofi. | [ ] | [ ] |
| escalate-not-breathing | Keep the emergency services on the line and start chest compressions. | የድንገተኛ አገልግሎቱን ስልክ ሳይዘጉ የደረት ግፊት ይጀምሩ። | Bilbila tajaajila balaa tasaa osoo hin cufin, qoma dhiibuu jalqabi. | [ ] | [ ] |
| escalate-unresponsive | Call emergency services now. | አሁኑኑ ወደ ድንገተኛ አገልግሎት ይደውሉ። | Amma tajaajila balaa tasaatiif bilbili. | [ ] | [ ] |

## Fixed safe phrases

| Key | English | Amharic | Afaan Oromoo | am | om |
|---|---|---|---|---|---|
| cannotInvent | I cannot tell you to do that. | ያንን እንዲያደርጉ ልነግርዎ አልችልም። | Waan sana akka gootu sitti himuu hin danda'u. | [ ] | [ ] |
| unsupportedEmergency | I cannot guide this emergency with a published first-aid protocol. Call emergency services now. Tell them what happened and where you are. | ለዚህ ድንገተኛ የታተመ የመጀመሪያ እርዳታ ፕሮቶኮል የለኝም። አሁኑኑ ወደ ድንገተኛ አገልግሎት ይደውሉ። ምን እንደሆነ እና የት እንዳሉ ይንገሩ። | Pirotokoolii gargaarsa jalqabaa maxxanfame balaa tasaa kanaaf hin qabu. Amma tajaajila balaa tasaatiif bilbili. Maaltu ta'e fi eessa akka jirtu himi. | [ ] | [ ] |
| stayWithThem | Stay with them and call emergency services if you have not already. | ከአጠገባቸው ይቆዩ፤ እስካሁን ካልደወሉ ወደ ድንገተኛ አገልግሎት ይደውሉ። | Isaan bira turi; yoo hanga ammaatti hin bilbilin, tajaajila balaa tasaatiif bilbili. | [ ] | [ ] |
| sayAgain | I need you to say that again. Call emergency services if someone is unresponsive. | እባክዎ እንደገና ይናገሩ። አንድ ሰው ምላሽ የማይሰጥ ከሆነ ወደ ድንገተኛ አገልግሎት ይደውሉ። | Maaloo irra deebi'ii dubbadhu. Namni deebii hin kennu yoo ta'e, tajaajila balaa tasaatiif bilbili. | [ ] | [ ] |
| silence | I did not hear you. Please say that again. | አልሰማሁዎትም። እባክዎ እንደገና ይናገሩ። | Si hin dhageenye. Maaloo irra deebi'ii dubbadhu. | [ ] | [ ] |
| timeout | I am still here. Tell me what you see. | አሁንም እዚህ ነኝ። የሚያዩትን ይንገሩኝ። | Ammallee asuman jira. Waan argitu natti himi. | [ ] | [ ] |
| lowConfidence | I am not sure I heard that. Please say it once more. | በትክክል መስማቴን እርግጠኛ አይደለሁም። እባክዎ አንድ ጊዜ ደግመው ይናገሩ። | Sirriitti dhaga'uu koo hin mirkaneeffanne. Maaloo al tokko irra deebi'ii dubbadhu. | [ ] | [ ] |

## Repeat words

The voice classifier treats these whole utterances as "repeat the last line":
Amharic `ድገም`, `ይድገሙ`, `ይድገሙት`, `እንደገና`, `እንደገና ይበሉ`, `ምን`;
Afaan Oromoo `irra deebi'i`, `irra deebi'ii`, `deebisi`, `maal`, `maali`.
Add anything people commonly say.

## Terms to agree on

- "Emergency services": Amharic `ድንገተኛ አገልግሎት`, Afaan Oromoo `tajaajila balaa tasaa`.
  Would bystanders rather hear "ambulance" (`አምቡላንስ` / `ambulaansii`)?
- Amharic uses the polite plural (`ይደውሉ`); Afaan Oromoo uses the direct singular
  (`bilbili`). Confirm both sound right under stress.

## Screen text

Button labels, headings and status lines on the bystander screens live in
`apps/web/src/i18n/emergencyCopy.ts` (start, language, session). They are not medical
instructions, but people read them under stress. Priority for review: `yes`, `no`,
`notSure`, `done`, `cantDo`, `repeat`, `callEmergency`, `helpArrived`, `collapsed`,
`onlyCollapse`. Edit that file directly with the editor; do not round-trip it
through PowerShell `Get-Content`/`Set-Content`, which corrupts Ge'ez text.
