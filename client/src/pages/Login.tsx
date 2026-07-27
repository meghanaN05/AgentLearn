import LoginForm from "../components/auth/LoginForm";

const Login = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">

      <div className="w-full max-w-md">

        <LoginForm />

      </div>

    </div>
  );
};

export default Login;