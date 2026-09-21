import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
];

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const current = (i18n.resolvedLanguage || i18n.language || "en").slice(0, 2);

  return (
    <div className="language-switcher" role="group" aria-label={t("languageSwitcher.changeLanguage")}>
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          className={`lang-button${code === current ? " lang-active" : ""}`}
          onClick={() => i18n.changeLanguage(code)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
