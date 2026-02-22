import { useState } from 'react';

const QUESTIONS = [
  {
    id: 'purpose',
    question: 'What will you use the van for?',
    options: [
      { value: 'moving', label: 'Moving / Relocation', icon: '📦' },
      { value: 'trip', label: 'Road Trip / Vacation', icon: '🏖️' },
      { value: 'camping', label: 'Camping Adventure', icon: '⛺' },
      { value: 'delivery', label: 'Delivery / Transport', icon: '🚚' },
      { value: 'group', label: 'Group Travel / Event', icon: '👥' },
      { value: 'other', label: 'Something Else', icon: '✨' },
    ],
  },
  {
    id: 'people',
    question: 'How many people will be traveling?',
    options: [
      { value: '1-2', label: '1-2 people', icon: '👤' },
      { value: '3-5', label: '3-5 people', icon: '👥' },
      { value: '6-10', label: '6-10 people', icon: '👨‍👩‍👧‍👦' },
      { value: '10+', label: 'More than 10', icon: '🚌' },
    ],
  },
  {
    id: 'duration',
    question: 'How long do you need the van?',
    options: [
      { value: 'day', label: 'Just a day', icon: '☀️' },
      { value: 'weekend', label: 'A weekend', icon: '📅' },
      { value: 'week', label: 'About a week', icon: '🗓️' },
      { value: 'longer', label: 'More than a week', icon: '📆' },
    ],
  },
];

const COLORS = {
  primary: '#0f172a',
  accent: '#3b82f6',
  accentLight: '#60a5fa',
  light: '#f8fafc',
  white: '#ffffff',
  muted: '#64748b',
  border: '#e2e8f0',
};

export default function Questionnaire({ onComplete, onSkip }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const currentQuestion = QUESTIONS[step];
  const isLastStep = step === QUESTIONS.length - 1;

  function handleSelect(value) {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    if (isLastStep) {
      const needText = buildNeedText(newAnswers);
      onComplete(needText, newAnswers);
    } else {
      setStep(step + 1);
    }
  }

  function buildNeedText(ans) {
    const parts = [];
    if (ans.purpose === 'moving') parts.push('moving house');
    else if (ans.purpose === 'trip') parts.push('road trip');
    else if (ans.purpose === 'camping') parts.push('camping');
    else if (ans.purpose === 'delivery') parts.push('delivery');
    else if (ans.purpose === 'group') parts.push('group travel');
    else parts.push('general use');

    if (ans.people === '1-2') parts.push('for 2 people');
    else if (ans.people === '3-5') parts.push('for a small group');
    else if (ans.people === '6-10') parts.push('for a large group');
    else if (ans.people === '10+') parts.push('for many passengers');

    return parts.join(' ');
  }

  const s = {
    container: {
      background: COLORS.white,
      borderRadius: 24,
      padding: '2.5rem',
      boxShadow: '0 4px 30px rgba(0,0,0,0.08)',
      maxWidth: 600,
      margin: '0 auto',
    },
    progress: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '2rem',
      justifyContent: 'center',
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: '50%',
      background: COLORS.border,
      transition: 'all 0.3s',
    },
    dotActive: {
      background: COLORS.accent,
      width: 24,
      borderRadius: 5,
    },
    dotCompleted: {
      background: COLORS.accentLight,
    },
    question: {
      fontSize: '1.5rem',
      fontWeight: 700,
      color: COLORS.primary,
      textAlign: 'center',
      marginBottom: '2rem',
    },
    options: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: '1rem',
    },
    option: {
      padding: '1.5rem 1rem',
      background: COLORS.light,
      border: `2px solid ${COLORS.border}`,
      borderRadius: 16,
      cursor: 'pointer',
      textAlign: 'center',
      transition: 'all 0.2s',
    },
    optionHover: {
      borderColor: COLORS.accent,
      background: '#f0f7ff',
      transform: 'translateY(-2px)',
    },
    optionIcon: {
      fontSize: '2rem',
      marginBottom: '0.5rem',
      display: 'block',
    },
    optionLabel: {
      fontSize: '0.95rem',
      fontWeight: 600,
      color: COLORS.primary,
    },
    footer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '2rem',
      paddingTop: '1.5rem',
      borderTop: `1px solid ${COLORS.border}`,
    },
    backBtn: {
      background: 'transparent',
      border: 'none',
      color: COLORS.muted,
      fontSize: '0.9rem',
      cursor: 'pointer',
      padding: '0.5rem 1rem',
    },
    skipBtn: {
      background: 'transparent',
      border: 'none',
      color: COLORS.accent,
      fontSize: '0.9rem',
      cursor: 'pointer',
      padding: '0.5rem 1rem',
    },
  };

  return (
    <div style={s.container}>
      <div style={s.progress}>
        {QUESTIONS.map((_, i) => (
          <div
            key={i}
            style={{
              ...s.dot,
              ...(i === step ? s.dotActive : {}),
              ...(i < step ? s.dotCompleted : {}),
            }}
          />
        ))}
      </div>

      <h2 style={s.question}>{currentQuestion.question}</h2>

      <div style={s.options}>
        {currentQuestion.options.map(opt => (
          <OptionCard key={opt.value} option={opt} s={s} onClick={() => handleSelect(opt.value)} />
        ))}
      </div>

      <div style={s.footer}>
        {step > 0 ? (
          <button style={s.backBtn} onClick={() => setStep(step - 1)}>
            ← Back
          </button>
        ) : (
          <div />
        )}
        <button style={s.skipBtn} onClick={onSkip}>
          Skip, I'll browse myself
        </button>
      </div>
    </div>
  );
}

function OptionCard({ option, s, onClick }) {
  const [hovered, setHovered] = useState(false);

  const optionStyle = {
    padding: '1.5rem 1rem',
    background: hovered ? '#f0f7ff' : s.option.background,
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: hovered ? '#3b82f6' : '#e2e8f0',
    borderRadius: 16,
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.2s',
    transform: hovered ? 'translateY(-2px)' : 'none',
  };

  return (
    <div
      style={optionStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
    >
      <span style={s.optionIcon}>{option.icon}</span>
      <span style={s.optionLabel}>{option.label}</span>
    </div>
  );
}
