import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  AuthContainer,
  AuthBox,
  AuthTitle,
  AuthDescription,
  AuthError,
  AuthSuccess,
  FormGroup,
  FormLabel,
  FormInput,
  SubmitButton,
  AuthLinks,
  AuthLink
} from "../styles/ForgotPasswordPage.styles";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      return setError("Please enter your email");
    }

    try {
      setError("");
      setMessage("");
      setLoading(true);
      await forgotPassword(email);
      setMessage("Password reset request has been sent to the administrator");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError("Failed to process request: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer>
      <AuthBox>
        <AuthTitle>Reset Password</AuthTitle>
        {error && <AuthError>{error}</AuthError>}
        {message && <AuthSuccess>{message}</AuthSuccess>}
        <form onSubmit={handleSubmit}>
          <AuthDescription>
            Enter your email below to request a password reset from the
            administrator.
          </AuthDescription>
          <FormGroup>
            <FormLabel>Your Email</FormLabel>
            <FormInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </FormGroup>
          <SubmitButton type="submit" disabled={loading}>
            {loading ? "Sending Request..." : "Request Password Reset"}
          </SubmitButton>
        </form>
        <AuthLinks>
          <AuthLink to="/login">Back to Login</AuthLink>
        </AuthLinks>
      </AuthBox>
    </AuthContainer>
  );
}

export default ForgotPasswordPage;
