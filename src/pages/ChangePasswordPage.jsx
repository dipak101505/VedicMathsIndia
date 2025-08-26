import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  PageContainer,
  FormContainer,
  PageTitle,
  ErrorMessage,
  SuccessMessage,
  FormGroup,
  FormLabel,
  FormInput,
  SubmitButton,
} from "../styles/ChangePasswordPage.styles";

function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, changePassword, user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return setError("New passwords do not match");
    }

    if (newPassword.length < 6) {
      return setError("Password should be at least 6 characters");
    }

    try {
      setError("");
      setMessage("");
      setLoading(true);

      // Re-authenticate user with current password
      await login(user.email, currentPassword);

      // Change password
      await changePassword(newPassword);

      setMessage("Password changed successfully");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(
        err.message.includes("auth/wrong-password")
          ? "Current password is incorrect"
          : "Failed to change password: " + err.message,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <FormContainer>
        <PageTitle>Change Password</PageTitle>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        {message && <SuccessMessage>{message}</SuccessMessage>}

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <FormLabel>Current Password</FormLabel>
            <FormInput
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </FormGroup>

          <FormGroup>
            <FormLabel>New Password</FormLabel>
            <FormInput
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
          </FormGroup>

          <FormGroup>
            <FormLabel>Confirm New Password</FormLabel>
            <FormInput
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </FormGroup>

          <SubmitButton type="submit" disabled={loading} loading={loading}>
            {loading ? "Updating..." : "Update Password"}
          </SubmitButton>
        </form>
      </FormContainer>
    </PageContainer>
  );
}

export default ChangePasswordPage;
