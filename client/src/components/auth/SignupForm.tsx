import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import Button from "../common/Button";
import Input from "../common/Input";

interface SignupData {
  name: string;
  email: string;
  password: string;
}

const SignupForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupData>();

  const onSubmit = (data: SignupData) => {
    console.log(data);
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-xl p-8">

      <h2 className="text-3xl font-bold text-center mb-6">
        Create Account
      </h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
      >
        <Input
          label="Name"
          placeholder="Full Name"
          {...register("name", {
            required: "Name is required",
          })}
        />

        <Input
          label="Email"
          placeholder="Email"
          {...register("email", {
            required: "Email is required",
          })}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Password"
          {...register("password", {
            required: "Password is required",
          })}
        />

        <Button
          type="submit"
          className="w-full"
        >
          Register
        </Button>

      </form>

      <p className="text-center mt-5">

        Already have an account?

        <Link
          to="/login"
          className="text-blue-600 ml-2"
        >
          Login
        </Link>

      </p>

    </div>
  );
};

export default SignupForm;