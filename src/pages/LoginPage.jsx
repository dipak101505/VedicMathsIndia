import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  LoginContainer,
  FormContainer,
  LogoSection,
  Logo,
  PageTitle,
  ErrorMessage,
  SuccessMessage,
  Form,
  FormGroup,
  FormLabel,
  FormInput,
  SubmitButton,
  LinksSection,
  LinkRow,
  StyledLink,
  ImageContainer,
  LoginImage
} from "../styles/loginPage.styles";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      await login(email, password);
      navigate("/");
    } catch (err) {
      if (err.message === "Please verify your email before logging in") {
        setError("Please verify your email before logging in");
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <FormContainer>
        <LogoSection>
          <Logo
            src="https://vedicmathsindia.org/wp-content/uploads/2018/06/cropped-C_Users_Riju-Pramanik_AppData_Local_Packages_Microsoft.SkypeApp_kzf8qxf38zg5c_LocalState_8c3fc180-bbe9-41d7-ac56-a944a5fc4067-32x32.png"
            alt="Logo"
          />
          <PageTitle>Hello There!</PageTitle>
        </LogoSection>
        
        {error && (
          <ErrorMessage>
            {error}
          </ErrorMessage>
        )}        
        {resetSent && (
          <SuccessMessage>
            Password reset link has been sent to your email!
          </SuccessMessage>
        )}
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <FormLabel>Email</FormLabel>
            <FormInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>Password</FormLabel>
            <FormInput
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </FormGroup>
          <SubmitButton
            type="submit"
            disabled={loading}
            loading={loading}
            isHovered={isHovered}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {loading ? "Logging in..." : "Login"}
          </SubmitButton>
        </Form>
        
        <LinksSection>
          <LinkRow>
            <StyledLink to="/forgot-password">
              Forgot Password?
            </StyledLink>
          </LinkRow>
          <LinkRow>
            Don't have an account?{" "}
            <StyledLink to="/signup">
              Sign Up
            </StyledLink>
          </LinkRow>
        </LinksSection>
      </FormContainer>

      <ImageContainer>
        <LoginImage
          src="VedMat.png"
          alt="Login"
          referrerPolicy="origin"
        />
      </ImageContainer>
    </LoginContainer>
  );
}

export default LoginPage;
