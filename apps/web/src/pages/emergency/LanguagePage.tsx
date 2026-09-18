import { Link } from 'react-router-dom';
import { Language } from '@voicesos/shared';
import { PlaceholderPage } from '@/components/PlaceholderPage';
import { routes } from '@/routes/paths';

/** Language selection — English, Amharic, Afaan Oromo (task.md Phase 13). */
export function LanguagePage() {
  const languages = [
    { code: Language.ENGLISH, label: 'English' },
    { code: Language.AMHARIC, label: 'Amharic' },
    { code: Language.AFAAN_OROMO, label: 'Afaan Oromo' },
  ];

  return (
    <PlaceholderPage
      title="Choose language"
      purpose="User picks a supported language before the voice session begins."
      task="Task 20 · Emergency interaction UI"
    >
      <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
        {languages.map((language) => (
          <li key={language.code}>
            {language.label} <code>({language.code})</code>
          </li>
        ))}
      </ul>
      <p style={{ marginTop: '1rem' }}>
        <Link to={routes.emergency.session}>Continue to session (placeholder)</Link>
      </p>
    </PlaceholderPage>
  );
}
