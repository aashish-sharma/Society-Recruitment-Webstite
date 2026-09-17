"use client";

import { useState } from "react";

/* ── Quiz data ─────────────────────────────────────────────────── */

interface Question {
  prompt: string;
  options: { label: string; category: string }[];
}

const QUESTIONS: Question[] = [
  {
    prompt: "What sounds most like your weekend?",
    options: [
      { label: "Hacking on a side project", category: "Technical" },
      { label: "Rehearsing or performing", category: "Cultural" },
      { label: "Playing a sport or working out", category: "Sports" },
      { label: "Reading or writing something new", category: "Literary" },
    ],
  },
  {
    prompt: "In a group project you usually…",
    options: [
      { label: "Build the thing", category: "Technical" },
      { label: "Handle the creative direction", category: "Cultural" },
      { label: "Keep everyone energised and on track", category: "Sports" },
      { label: "Write the report or documentation", category: "Literary" },
    ],
  },
  {
    prompt: "Which of these would you binge-watch?",
    options: [
      { label: "A documentary on how things are made", category: "Technical" },
      { label: "A behind-the-scenes of a stage show", category: "Cultural" },
      { label: "A sports tournament", category: "Sports" },
      { label: "A literary debate or book review", category: "Literary" },
    ],
  },
];

/* ── Component ─────────────────────────────────────────────────── */

interface SocietyQuizProps {
  onResult: (category: string) => void;
}

export function SocietyQuiz({ onResult }: SocietyQuizProps) {
  const [step, setStep] = useState(0); // 0‥2 = questions, 3 = result
  const [scores, setScores] = useState<Record<string, number>>({});
  const [open, setOpen] = useState(false);

  const handleAnswer = (category: string) => {
    setScores((prev) => ({
      ...prev,
      [category]: (prev[category] ?? 0) + 1,
    }));
    setStep((s) => s + 1);
  };

  const reset = () => {
    setStep(0);
    setScores({});
  };

  /* Determine the winning category */
  const getResult = (): string => {
    let best = "Technical";
    let max = 0;
    for (const [cat, count] of Object.entries(scores)) {
      if (count > max) {
        max = count;
        best = cat;
      }
    }
    return best;
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 text-sm font-medium text-primary transition-colors duration-150 hover:text-accent"
      >
        Not sure where to start? Take the quiz →
      </button>
    );
  }

  /* ── Result screen ──────────────────────────────────────────── */
  if (step >= QUESTIONS.length) {
    const result = getResult();
    return (
      <div className="mt-4 rounded-[4px] border border-line bg-surface px-5 py-5">
        <p className="text-sm font-semibold text-ink">
          You might enjoy: <span className="text-accent">{result}</span> societies
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => onResult(result)}
            className="text-sm font-medium text-primary transition-colors duration-150 hover:text-accent"
          >
            Show {result} societies →
          </button>
          <button
            type="button"
            onClick={reset}
            className="text-sm text-ink-muted transition-colors duration-150 hover:text-ink"
          >
            Retake quiz
          </button>
        </div>
      </div>
    );
  }

  /* ── Question screen ────────────────────────────────────────── */
  const q = QUESTIONS[step];
  return (
    <div className="mt-4 rounded-[4px] border border-line bg-surface px-5 py-5">
      <p className="text-xs font-medium text-ink-muted">
        Question {step + 1} of {QUESTIONS.length}
      </p>
      <p className="mt-2 text-sm font-semibold text-ink">{q.prompt}</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {q.options.map((opt) => (
          <button
            key={opt.label}
            type="button"
            onClick={() => handleAnswer(opt.category)}
            className="rounded-[4px] border border-line px-3 py-2 text-left text-sm text-ink transition-colors duration-150 hover:border-primary hover:text-primary"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
