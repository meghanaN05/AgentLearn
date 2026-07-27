import Layout from "../components/common/Layout";
import {
  Mail,
  User,
  GraduationCap,
  Trophy,
} from "lucide-react";

const Profile = () => {
  return (
    <Layout>

      <div className="max-w-5xl mx-auto space-y-8">

        <div className="bg-white rounded-xl shadow-lg p-8">

          <div className="flex items-center gap-6">

            <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-4xl font-bold">
              M
            </div>

            <div>

              <h2 className="text-3xl font-bold">
                Meghana
              </h2>

              <p className="text-gray-500">
                AI Study Buddy User
              </p>

            </div>

          </div>

        </div>

        <div className="grid md:grid-cols-2 gap-6">

          <div className="bg-white rounded-xl shadow-lg p-6">

            <h3 className="font-semibold text-xl mb-5">
              Personal Information
            </h3>

            <div className="space-y-4">

              <div className="flex gap-3">
                <User />
                <span>Meghana</span>
              </div>

              <div className="flex gap-3">
                <Mail />
                <span>meghana@example.com</span>
              </div>

              <div className="flex gap-3">
                <GraduationCap />
                <span>Computer Science Student</span>
              </div>

            </div>

          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">

            <h3 className="font-semibold text-xl mb-5">
              Learning Statistics
            </h3>

            <div className="space-y-4">

              <div className="flex justify-between">
                <span>Uploaded PDFs</span>
                <span>18</span>
              </div>

              <div className="flex justify-between">
                <span>AI Chats</span>
                <span>312</span>
              </div>

              <div className="flex justify-between">
                <span>Mock Tests</span>
                <span>15</span>
              </div>

              <div className="flex justify-between">
                <span>Average Score</span>
                <span className="font-bold text-green-600">
                  91%
                </span>
              </div>

              <div className="flex justify-between">
                <span>Achievements</span>
                <Trophy className="text-yellow-500" />
              </div>

            </div>

          </div>

        </div>

      </div>

    </Layout>
  );
};

export default Profile;