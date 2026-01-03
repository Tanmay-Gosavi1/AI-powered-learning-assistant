import { LayoutDashboard , FileText ,Plus , User, BookOpen} from "lucide-react";

import { BarChart2, Mail, Sparkles  } from "lucide-react";

export const FEATURES = [
  {
    icon: Sparkles,
    title: "AI Explanations",
    description:
      "Get clear, personalized answers and step-by-step breakdowns.",
    path: "/documents",
  },
  {
    icon: BookOpen,
    title: "Notes → Flashcards",
    description:
      "Instantly turn notes, lectures, and PDFs into study cards.",
    path: "/flashcards",
  },
  {
    icon: BarChart2,
    title: "Smart Progress",
    description:
      "Track mastery, weak spots, and study streaks automatically.",
    path: "/dashboard",
  },
  {
    icon: FileText,
    title: "Quiz Generator",
    description:
      "Create practice quizzes with hints in one click.",
    path: "/documents",
  },
];

export const TESTIMONIALS = [
  {
    quote: "I study in half the time and remember more.",
    author: "Ayesha K.",
    title: "Gate Aspirant",
    avatar: "https://placehold.co/100x100/000000/ffffff?text=AK"
  },
  {
    quote: "It turns my messy notes into perfect flashcards.",
    author: "Amisha G.",
    title: "MBA Candidate",
    avatar: "https://placehold.co/100x100/000000/ffffff?text=AG"
  },
  {
    quote: "The AI explanations saved me before exams—so good!",
    author: "Priya M.",
    title: "Engineering Student",
    avatar: "https://placehold.co/100x100/000000/ffffff?text=PM"
  },
];

export const FAQS = [
  {
    id: 1,
    question: "What is an AI learning assistant?",
    answer:
      "A tool that turns your content into flashcards, quizzes, and simple explanations so you learn faster."
  },
  {
    id: 2,
    question: "How does it help me study?",
    answer:
      "It summarizes, explains, quizzes you, and adapts to your progress."
  },
  {
    id: 3,
    question: "Can it generate flashcards and quizzes?",
    answer:
      "Yes—create high-quality flashcards and practice quizzes from notes, PDFs, or topics."
  },
  {
    id: 4,
    question: "Is my data secure?",
    answer:
      "Yes—your data is encrypted in transit and protected with authentication. We never sell your study data."
  },
  {
    id: 5,
    question: "Does it support PDFs and videos?",
    answer:
      "Yes—upload PDFs or paste transcripts to generate study materials."
  },
  {
    id: 6,
    question: "Can it explain complex topics?",
    answer:
      "Absolutely—get step-by-step answers tailored to your level."
  },
  {
    id: 7,
    question: "Does it track my progress?",
    answer:
      "Yes—view insights on mastery, weak areas, and streaks."
  },
  {
    id: 8,
    question: "Is it useful for exams?",
    answer:
      "Perfect for exam prep, interviews, and rapid revision."
  }
];

export const NAVIGATION_MENU = [
  { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
  { id: "documents", name: "Documents", icon: FileText },
  { id: "flashcards", name: "Flashcards", icon: BookOpen },
  { id: "profile", name: "Profile", icon: User },
];