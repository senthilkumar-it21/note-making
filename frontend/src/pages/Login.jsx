import React ,{useState} from "react";
import { Link , useNavigate} from "react-router-dom";
import { validateEmail } from "../utils/helper";
import axiosInstance from "../utils/axiosInstance";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Invalid Email");
      return;
    }
    if (!password) {
      setError("Please enter the password");
      return;
    }

    //Login API Call
    try {
      console.log("Attempting login with:", email, password); // Check login inputs
      const response = await axiosInstance.post("/login", {
        email: email,
        password: password,
      });

      console.log("Response from server:", response); // Log the response from the server

      // Handle successful login response
      if (response.data && response.data.accessToken) {
        localStorage.setItem("token", response.data.accessToken); // Fixed the typo here
        navigate("/dashboard"); // Removed the trailing space
      }
    } catch (error) {
      console.log("Login error:", error); // Log the error object

      if (error.response && error.response.data) {
        // Check for proper error structure
        setError(error.response.data.message); // Display server error message
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };
    return (
      <div>

        <div className="flex items-center justify-center mt-28">
          <div className="w-96 border rounded bg-white px-7 py-10">
            <form onSubmit={handleLogin}>
              <h4 className="text-2xl font-semibold mb-7">Login</h4>
              <input
                type="email"
                placeholder="Email"
                className="input-box"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="password"
                className="input-box"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {error && <p className="text-red-500 text-xs pb-1">{error}</p>}
              <button type="submit" className="btn-primary">
                Login
              </button>
              <p className="text-sm text-center mt-4">
                Not registered yet?{" "}
                <Link
                  to="/SignUp"
                  className="font-medium text-primary underline"
                >
                  Create an Account
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    );
  };

  export default Login;
