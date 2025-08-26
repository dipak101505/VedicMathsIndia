import { useState } from "react";
import { auth } from "../firebase/config";
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { theme } from "../styles/theme";
import {
  Container,
  Title,
  MessageContainer,
  FormGroup,
  Label,
  Input,
  SubmitButton,
} from "../styles/SendVerificationEmail.styles";

function SendVerificationEmail() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // First sign in the user
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Send verification email
      await sendEmailVerification(userCredential.user);

      setMessage("Verification email sent! Please check your inbox.");
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Error:", error);
      setMessage("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const isErrorMessage = message.includes("Error");

  return (
    <Container>
      <Title>Send Verification Email</Title>

      {message && (
        <MessageContainer isError={isErrorMessage}>
          {message}
        </MessageContainer>
      )}

      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>Email</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email address"
          />
        </FormGroup>

        <FormGroup marginBottom={theme.spacing.xl}>
          <Label>Password</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />
        </FormGroup>

        <SubmitButton type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Verification Email"}
        </SubmitButton>
      </form>
    </Container>
  );
}

export default SendVerificationEmail;
