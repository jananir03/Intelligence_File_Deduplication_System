import { Box, Chip, Stack, Typography } from "@mui/material";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CloudDoneRoundedIcon from "@mui/icons-material/CloudDoneRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import type { ReactNode } from "react";

interface AuthShellProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthShell({
  children,
  title,
  subtitle,
}: AuthShellProps) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 3, sm: 4, md: 5 },
        bgcolor: "#F6F2F4",
        background:
          "linear-gradient(135deg, #EEE7E2 0%, #F3ECE9 38%, #E9E8F0 72%, #E5E4EE 100%)",
      }}
    >
      {/* Soft decorative background shapes. This background covers the entire page. */}
      <Box
        sx={{
          position: "absolute",
          width: { xs: 260, md: 430 },
          height: { xs: 260, md: 430 },
          borderRadius: "50%",
          background: "#D8CBD8",
          top: { xs: -100, md: -170 },
          left: { xs: -100, md: -150 },
          opacity: 0.78,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: { xs: 210, md: 320 },
          height: { xs: 210, md: 320 },
          borderRadius: "50%",
          background: "#D9D8E8",
          bottom: { xs: -90, md: -130 },
          right: { xs: -70, md: -80 },
          opacity: 0.86,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: { xs: 120, md: 180 },
          height: { xs: 120, md: 180 },
          borderRadius: "50%",
          background: "#E4D7D5",
          left: { xs: "10%", md: "24%" },
          top: { xs: "22%", md: "49%" },
          opacity: 0.72,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: { xs: 95, md: 140 },
          height: { xs: 95, md: 140 },
          borderRadius: "50%",
          background: "#DED8E7",
          right: { xs: "10%", md: "18%" },
          top: { xs: "8%", md: "14%" },
          opacity: 0.62,
        }}
      />

      {/* Centered authentication workspace */}
      <Stack
        sx={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: 520,
          alignItems: "center",
        }}
        spacing={2}
      >
        {/* Brand */}
        <Stack spacing={0.45} alignItems="center" sx={{ mb: 0.8 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: "17px",
              display: "grid",
              placeItems: "center",
              bgcolor: "#756A91",
              color: "#FFFFFF",
              boxShadow: "0 14px 30px rgba(93,80,125,.20)",
            }}
          >
            <AutoAwesomeRoundedIcon />
          </Box>

          <Typography
            sx={{
              mt: 0.35,
              fontSize: { xs: 25, sm: 28 },
              lineHeight: 1.1,
              fontWeight: 800,
              letterSpacing: "-0.025em",
              color: "#38323F",
            }}
          >
            FileNest
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "#756C78",
              fontWeight: 550,
            }}
          >
            Smart file management
          </Typography>
        </Stack>

        {/* Authentication heading */}
        <Stack spacing={0.65} alignItems="center" sx={{ mb: 0.5 }}>
          <Typography
            variant="h4"
            sx={{
              fontSize: { xs: 27, sm: 30 },
              color: "#393440",
              textAlign: "center",
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{
              color: "#7E7581",
              textAlign: "center",
              fontSize: 14.5,
            }}
          >
            {subtitle}
          </Typography>
        </Stack>

        {/* Form */}
        <Box sx={{ width: "100%" }}>{children}</Box>

        {/* Product benefits below the form */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          justifyContent="center"
          alignItems="center"
          sx={{
            width: "100%",
            pt: 0.4,
            flexWrap: "wrap",
          }}
        >
          <FeaturePill
            icon={<ContentCopyRoundedIcon />}
            text="Duplicate detection"
          />
          <FeaturePill
            icon={<SavingsRoundedIcon />}
            text="Storage insights"
          />
          <FeaturePill
            icon={<CloudDoneRoundedIcon />}
            text="Safe file management"
          />
        </Stack>
      </Stack>
    </Box>
  );
}

function FeaturePill({
  icon,
  text,
}: {
  icon: ReactNode;
  text: string;
}) {
  return (
    <Chip
      icon={<Box sx={{ display: "flex", color: "#8B7A9D" }}>{icon}</Box>}
      label={text}
      sx={{
        height: 38,
        px: 0.9,
        borderRadius: 3,
        bgcolor: "rgba(255, 252, 250, 0.74)",
        border: "1px solid rgba(95, 80, 110, 0.08)",
        color: "#665D6C",
        boxShadow: "0 7px 18px rgba(86, 70, 88, 0.05)",
        "& .MuiChip-label": {
          px: 0.8,
          fontSize: 12.5,
          fontWeight: 650,
        },
      }}
    />
  );
}
