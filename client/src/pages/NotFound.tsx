import { Link } from "react-router-dom";
import Button from "../components/common/Button";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="text-center">

        <h1 className="text-8xl font-bold text-blue-600">
          404
        </h1>

        <p className="text-2xl mt-6 font-semibold">
          Page Not Found
        </p>

        <p className="text-gray-500 dark:text-gray-400 mt-3">
          The page you're looking for doesn't exist.
        </p>

        <Link to="/" className="inline-block mt-8">
          <Button>
            Go Back Home
          </Button>
        </Link>

      </div>

    </div>
  );
};

export default NotFound;