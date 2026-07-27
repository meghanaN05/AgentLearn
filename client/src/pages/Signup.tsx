import SignupForm from "../components/auth/SignupForm";

const Signup = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">

      <div className="w-full max-w-md">

        <SignupForm />

      </div>

    </div>
  );
};

export default Signup;