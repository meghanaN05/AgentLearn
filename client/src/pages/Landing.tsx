import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  FileText,
  Globe,
  Sparkles,
} from "lucide-react";

import Button from "../components/common/Button";
import { Reveal, Stagger, RevealItem } from "../components/motion/Reveal";
import { APP_NAME } from "../utils/constants";
import { interactive } from "../lib/motion";

const features = [
  {
    icon: FileText,
    accent: "text-blue-600 bg-blue-50 dark:bg-blue-950",
    title: "Your documents, indexed",
    description:
      "Upload PDFs and they are split, embedded and made searchable. Every answer cites the page it came from.",
  },
  {
    icon: Brain,
    accent: "text-purple-600 bg-purple-50 dark:bg-purple-950",
    title: "Grounded answers",
    description:
      "Retrieval-augmented chat answers from your own material first, not from a model's general knowledge.",
  },
  {
    icon: Globe,
    accent: "text-teal-600 bg-teal-50 dark:bg-teal-950",
    title: "Knows when to look further",
    description:
      "An evaluator agent judges whether your documents actually cover the question, and reaches for the web only when they do not.",
  },
  {
    icon: BookOpen,
    accent: "text-green-600 bg-green-50 dark:bg-green-950",
    title: "Summaries and mock tests",
    description:
      "Generate revision notes, MCQs and timed tests drawn from across the whole document, not one arbitrary section.",
  },
  {
    icon: BarChart3,
    accent: "text-amber-600 bg-amber-50 dark:bg-amber-950",
    title: "Measured progress",
    description:
      "Per-topic accuracy computed from your actual answers, with weak areas surfaced as you go.",
  },
  {
    icon: Sparkles,
    accent: "text-rose-600 bg-rose-50 dark:bg-rose-950",
    title: "Study plans that adapt",
    description:
      "Fall below the threshold on a mock test and a targeted plan is generated for the topics you missed.",
  },
];

const steps = [
  { number: "01", title: "Upload", body: "Drop in books, lecture notes or papers." },
  { number: "02", title: "Ask", body: "Chat, summarise or generate questions." },
  { number: "03", title: "Practise", body: "Take mock tests and track weak topics." },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 dark:text-gray-100">

      <nav className="sticky top-0 z-30 backdrop-blur bg-white/80 dark:bg-gray-950/80 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">

          <span className="text-lg font-semibold tracking-tight">
            {APP_NAME}
          </span>

          <div className="flex gap-3">
            <Link to="/login">
              <Button variant="outline">Log in</Button>
            </Link>

            <Link to="/signup">
              <Button>Get started</Button>
            </Link>
          </div>

        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">

        <Reveal>
          <span className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400">
            <Sparkles size={13} />
            Retrieval-augmented, agent-orchestrated
          </span>
        </Reveal>

        <Reveal delay={0.05}>
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-[1.1] mt-8">
            Turn your study material
            <br />
            into something you can ask.
          </h1>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-6 max-w-2xl mx-auto leading-relaxed">
            Upload your PDFs and get answers grounded in them, with page
            citations. Generate summaries, MCQs and mock tests, then track which
            topics you actually need to revise.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="flex flex-wrap justify-center gap-3 mt-10">
            <Link to="/signup">
              <Button size="lg">
                <span className="inline-flex items-center gap-2">
                  Start learning
                  <ArrowRight size={18} />
                </span>
              </Button>
            </Link>

            <Link to="/login">
              <Button variant="outline" size="lg">
                Log in
              </Button>
            </Link>
          </div>
        </Reveal>

      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <Stagger onScroll className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <RevealItem key={step.number}>
              <div className="border-l-2 border-gray-200 dark:border-gray-800 pl-5">
                <span className="text-xs font-mono text-gray-400">
                  {step.number}
                </span>
                <h3 className="font-semibold mt-1">{step.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {step.body}
                </p>
              </div>
            </RevealItem>
          ))}
        </Stagger>
      </section>

      {/* Features */}
      <section className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/40">
        <div className="max-w-6xl mx-auto px-6 py-24">

          <Reveal onScroll>
            <h2 className="text-3xl font-semibold tracking-tight text-center">
              Built as a learning system, not a chatbot
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-center mt-3 max-w-xl mx-auto">
              Four agents decide what to retrieve, whether it is sufficient, and
              where to look next.
            </p>
          </Reveal>

          <Stagger
            onScroll
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-14"
          >
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <RevealItem key={feature.title}>
                  <motion.div
                    {...interactive}
                    className="h-full bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6"
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${feature.accent}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <h3 className="font-semibold mt-4">{feature.title}</h3>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                      {feature.description}
                    </p>
                  </motion.div>
                </RevealItem>
              );
            })}
          </Stagger>

        </div>
      </section>

      {/* Close */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <Reveal onScroll>
          <h2 className="text-3xl font-semibold tracking-tight">
            Start with one PDF.
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-3">
            Upload something you are studying and ask it a question.
          </p>
          <Link to="/signup" className="inline-block mt-8">
            <Button size="lg">
              <span className="inline-flex items-center gap-2">
                Create an account
                <ArrowRight size={18} />
              </span>
            </Button>
          </Link>
        </Reveal>
      </section>

      <footer className="border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-8 text-sm text-gray-500 dark:text-gray-400">
          {APP_NAME}
        </div>
      </footer>

    </div>
  );
};

export default Landing;
