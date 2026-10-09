import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#76689A",
      light: "#A69BC2",
      dark: "#5D507D",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#C88AA7",
      light: "#E0B7C8",
      dark: "#A96D8A",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#F6F2F4",
      paper: "#FFFCFA",
    },
    text: {
      primary: "#332F3B",
      secondary: "#7B7480",
    },
    success: {
      main: "#789B88",
    },
    warning: {
      main: "#C49A62",
    },
    error: {
      main: "#B9787F",
    },
    info: {
      main: "#7895AD",
    },
  },
  typography: {
    fontFamily:
      '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
    h1: { fontWeight: 750, letterSpacing: "-0.03em" },
    h2: { fontWeight: 750, letterSpacing: "-0.025em" },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    body1: { lineHeight: 1.65 },
    button: {
      textTransform: "none",
      fontWeight: 650,
    },
  },
  shape: {
    borderRadius: 18,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 44,
          borderRadius: 13,
          paddingInline: 20,
          boxShadow: "none",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: "medium",
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 13,
          backgroundColor: "#FFFEFD",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid rgba(90, 76, 102, 0.08)",
          boxShadow: "0 18px 45px rgba(86, 70, 88, 0.08)",
        },
      },
    },
  },
});

export default theme;