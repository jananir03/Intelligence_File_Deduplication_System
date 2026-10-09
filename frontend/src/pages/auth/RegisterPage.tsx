import {
  Alert,
  Box,
  Button,
  Card,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import { useState, type FormEvent } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthShell from "../../components/auth/AuthShell";
import { register } from "../../api/authApi";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMessage("Please complete all fields.");
      return;
    }

    if (username.trim().length < 3) {
      setErrorMessage("Username must contain at least 3 characters.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must contain at least 8 characters.");
      return;
    }

    if (password.length > 72) {
      setErrorMessage("Password cannot contain more than 72 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        username,
        email,
        password,
      });

      setSuccessMessage(
        "Your account has been created. Redirecting you to sign in...",
      );

      window.setTimeout(() => {
        navigate("/login", { replace: true });
      }, 900);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const detail = error.response?.data?.detail;

        if (typeof detail === "string") {
          setErrorMessage(detail);
        } else if (Array.isArray(detail)) {
          setErrorMessage("Please check the entered details.");
        } else {
          setErrorMessage(
            "Unable to create your account right now. Please try again.",
          );
        }
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="A simple space to organize and optimize your files."
    >
      <Card
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: 4,
          bgcolor: "rgba(255,252,250,.88)",
          backdropFilter: "blur(12px)",
        }}
      >
        <Stack spacing={1.9} component="form" onSubmit={handleSubmit}>
          {errorMessage && (
            <Alert
              severity="error"
              variant="outlined"
              sx={{
                borderRadius: 3,
                bgcolor: "#FBF2F3",
                color: "#875E64",
              }}
            >
              {errorMessage}
            </Alert>
          )}

          {successMessage && (
            <Alert
              severity="success"
              variant="outlined"
              icon={<CheckCircleOutlineRoundedIcon />}
              sx={{
                borderRadius: 3,
                bgcolor: "#F2F7F3",
                color: "#587764",
              }}
            >
              {successMessage}
            </Alert>
          )}

          <TextField
            label="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            autoFocus
            fullWidth
            helperText="At least 3 characters"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutlineRoundedIcon sx={{ color: "#9A8FA0" }} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Email address"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MailOutlineRoundedIcon sx={{ color: "#9A8FA0" }} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            fullWidth
            helperText="8–72 characters"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon sx={{ color: "#9A8FA0" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((value) => !value)}
                    edge="end"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <VisibilityOffRoundedIcon />
                    ) : (
                      <VisibilityRoundedIcon />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Confirm password"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            fullWidth
            error={Boolean(confirmPassword) && password !== confirmPassword}
            helperText={
              confirmPassword && password !== confirmPassword
                ? "Passwords do not match"
                : "Enter the password again"
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon sx={{ color: "#9A8FA0" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    edge="end"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? (
                      <VisibilityOffRoundedIcon />
                    ) : (
                      <VisibilityRoundedIcon />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            endIcon={<ArrowForwardRoundedIcon />}
            sx={{
              minHeight: 50,
              mt: 0.6,
              bgcolor: "#C88AA7",
              "&:hover": { bgcolor: "#AF7391" },
              boxShadow: "0 12px 24px rgba(200,138,167,.20)",
            }}
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>

          <Box sx={{ pt: 0.8, textAlign: "center" }}>
            <Typography variant="body2" color="#7C7580">
              Already have an account?{" "}
              <Link
                component={RouterLink}
                to="/login"
                underline="hover"
                sx={{ color: "#76689A", fontWeight: 700 }}
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </Stack>
      </Card>
    </AuthShell>
  );
}