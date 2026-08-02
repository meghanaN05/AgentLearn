import { Link } from "react-router-dom";
import { BookOpen, Brain, FileText, Sparkles } from "lucide-react";
import Button from "../components/common/Button";

const features = [
  {
    icon: <FileText className="w-8 h-8 text-blue-600" />,
    title: "Upload PDFs",
    description:
      "Upload study materials and let AI understand your documents.",
  },
  {
    icon: <Brain className="w-8 h-8 text-purple-600" />,
    title: "AI Chat",
    description:
      "Ask questions from your PDFs using Retrieval-Augmented Generation.",
  },
  {
    icon: <BookOpen className="w-8 h-8 text-green-600" />,
    title: "Mock Tests",
    description:
      "Generate quizzes and mock tests automatically.",
  },
  {
    icon: <Sparkles className="w-8 h-8 text-yellow-500" />,
    title: "Smart Recommendations",
    description:
      "Receive personalized study plans and topic recommendations.",
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">

      {/* Navbar */}

      <nav className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">

        <h1 className="text-3xl font-bold text-blue-600">
          AI Study Buddy
        </h1>

        <div className="flex gap-4">

          <Link to="/login">
            <Button variant="outline">
              Login
            </Button>
          </Link>

          <Link to="/signup">
            <Button>
              Get Started
            </Button>
          </Link>

        </div>

      </nav>

      {/* Hero */}

      <section className="max-w-6xl mx-auto px-8 py-20">

        <div className="text-center">

          <h1 className="text-6xl font-bold leading-tight">

            Learn Smarter with

            <span className="text-blue-600">
              {" "}AI
            </span>

          </h1>

          <p className="text-gray-600 dark:text-gray-300 text-xl mt-8 max-w-3xl mx-auto">

            Upload PDFs, chat with your notes, generate summaries,
            create quizzes, take mock tests and receive
            personalized study recommendations powered by AI.

          </p>

          <div className="flex justify-center gap-5 mt-10">

            <Link to="/signup">
              <Button size="lg">
                Start Learning
              </Button>
            </Link>

            <Link to="/login">
              <Button
                variant="outline"
                size="lg"
              >
                Login
              </Button>
            </Link>

          </div>

        </div>

      </section>

      {/* Features */}

      <section className="max-w-7xl mx-auto px-8 pb-20">

        <h2 className="text-4xl font-bold text-center mb-14">

          Everything You Need

        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

          {features.map((feature) => (

            <div
              key={feature.title}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
            >

              {feature.icon}

              <h3 className="font-semibold text-xl mt-5">

                {feature.title}

              </h3>

              <p className="text-gray-500 dark:text-gray-400 mt-3">

                {feature.description}

              </p>

            </div>

          ))}

        </div>

      </section>

    </div>
  );
};

export default Landing;