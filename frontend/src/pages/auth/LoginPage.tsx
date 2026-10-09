import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import { useState, type FormEvent } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthShell from "../../components/auth/AuthShell";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (!username.trim() || !password) {
      setErrorMessage("Please enter your username/email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      await login({ username, password });

      if (!rememberMe) {
        sessionStorage.setItem("session_only", "true");
      }

      navigate("/dashboard", { replace: true });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const detail = error.response?.data?.detail;

        if (typeof detail === "string") {
          setErrorMessage(detail);
        } else {
          setErrorMessage(
            "Unable to sign in right now. Please check your details and try again.",
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
      title="Welcome back"
      subtitle="Sign in to continue managing your files."
    >
      <Card
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: 4,
          bgcolor: "rgba(255,252,250,.88)",
          backdropFilter: "blur(12px)",
        }}
      >
        <Stack spacing={2.2} component="form" onSubmit={handleSubmit}>
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

          <TextField
            label="Username or email"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            autoFocus
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon sx={{ color: "#9A8FA0" }} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <ShieldOutlinedIcon sx={{ color: "#9A8FA0" }} />
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

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  sx={{
                    color: "#B7AFC0",
                    "&.Mui-checked": { color: "#76689A" },
                  }}
                />
              }
              label={
                <Typography variant="body2" color="#756E79">
                  Keep me signed in
                </Typography>
              }
            />

            <Typography variant="body2" color="#9A929D">
              Secure access
            </Typography>
          </Stack>

          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            endIcon={<ArrowForwardRoundedIcon />}
            sx={{
              minHeight: 50,
              mt: 0.5,
              bgcolor: "#76689A",
              "&:hover": { bgcolor: "#62577F" },
              boxShadow: "0 12px 24px rgba(118,104,154,.20)",
            }}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>

          <Box sx={{ pt: 0.8, textAlign: "center" }}>
            <Typography variant="body2" color="#7C7580">
              Don't have an account?{" "}
              <Link
                component={RouterLink}
                to="/register"
                underline="hover"
                sx={{ color: "#76689A", fontWeight: 700 }}
              >
                Create one
              </Link>
            </Typography>
          </Box>
        </Stack>
      </Card>

    </AuthShell>
  );
}