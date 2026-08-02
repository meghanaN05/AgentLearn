import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Flame, Mail, User } from "lucide-react";

import Layout from "../components/common/Layout";
import Loader from "../components/common/Loader";
import useAuth from "../hooks/useAuth";
import analyticsService, {
  AnalyticsResponse,
} from "../services/analyticsService";
import authService from "../services/authService";

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [stats, setStats] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    setName(user?.name ?? "");
  }, [user?.name]);

  useEffect(() => {
    analyticsService
      .getAnalytics()
      .then(setStats)
      .catch(() => toast.error("Could not load your statistics"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setSaving(true);
      await authService.updateProfile({
        name: name.trim() !== user?.name ? name.trim() : undefined,
        password: password || undefined,
        currentPassword: password ? currentPassword : undefined,
      });
      await refreshUser();
      setCurrentPassword("");
      setPassword("");
      toast.success("Profile updated");
    } catch (error: unknown) {
      const detail =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { detail?: string } } }).response
          ?.data?.detail === "string"
          ? (error as { response: { data: { detail: string } } }).response.data
              .detail
          : "Could not update your profile";

      toast.error(detail);
    } finally {
      setSaving(false);
    }
  };

  const initial = (user?.name ?? "?").trim().charAt(0).toUpperCase();

  return (
    <Layout>

      <div className="max-w-5xl mx-auto space-y-8">

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">

          <div className="flex items-center gap-6">

            <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-4xl font-bold">
              {initial}
            </div>

            <div>

              <h2 className="text-3xl font-bold">
                {user?.name ?? "Your profile"}
              </h2>

              <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                <Mail size={18} />
                {user?.email}
              </p>

            </div>

          </div>

        </div>

        <div className="grid md:grid-cols-2 gap-6">

          <form
            onSubmit={handleSave}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4"
          >

            <h3 className="font-semibold text-xl mb-1">
              Account Settings
            </h3>

            <div>
              <label className="block text-sm font-medium mb-1">
                Display name
              </label>
              <div className="flex items-center gap-2">
                <User size={18} className="text-gray-400" />
                <input
                  className="w-full border rounded-lg p-2"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  minLength={2}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Current password
              </label>
              <input
                type="password"
                className="w-full border rounded-lg p-2"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder="Only needed to change your password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                New password
              </label>
              <input
                type="password"
                className="w-full border rounded-lg p-2"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={6}
                placeholder="Leave blank to keep your current password"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>

          </form>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">

            <h3 className="font-semibold text-xl mb-5">
              Learning Statistics
            </h3>

            {loading && <Loader />}

            {!loading && stats && (
              <div className="space-y-4">

                <div className="flex justify-between">
                  <span>Uploaded PDFs</span>
                  <span>{stats.totalPDFs}</span>
                </div>

                <div className="flex justify-between">
                  <span>Questions asked</span>
                  <span>{stats.questionsAsked}</span>
                </div>

                <div className="flex justify-between">
                  <span>Summaries generated</span>
                  <span>{stats.summariesGenerated}</span>
                </div>

                <div className="flex justify-between">
                  <span>MCQs generated</span>
                  <span>{stats.mcqsGenerated}</span>
                </div>

                <div className="flex justify-between">
                  <span>Mock tests taken</span>
                  <span>{stats.totalTests}</span>
                </div>

                <div className="flex justify-between">
                  <span>Average score</span>
                  <span className="font-bold text-green-600">
                    {stats.averageScore}%
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Learning streak</span>
                  <span className="flex items-center gap-2">
                    <Flame className="text-orange-500" size={18} />
                    {stats.learningStreak} day
                    {stats.learningStreak === 1 ? "" : "s"}
                  </span>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>

    </Layout>
  );
};

export default Profile;
