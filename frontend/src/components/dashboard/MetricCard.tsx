import { Box, Card, Stack, Typography } from "@mui/material";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import type { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: string;
  helper: string;
  icon: ReactNode;
  background: string;
  iconBackground: string;
  iconColor: string;
  accent: string;
}

export default function MetricCard({
  label,
  value,
  helper,
  icon,
  background,
  iconBackground,
  iconColor,
  accent,
}: MetricCardProps) {
  return (
    <Card
      sx={{
        position: "relative",
        overflow: "hidden",
        minHeight: 170,
        p: { xs: 2.4, sm: 2.7 },
        borderRadius: 4.5,
        background,
        border: `1px solid ${accent}35`,
        boxShadow: `0 16px 34px ${accent}18`,
        transition: "transform .2s ease, box-shadow .2s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: `0 20px 40px ${accent}25`,
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          width: 125,
          height: 125,
          borderRadius: "50%",
          right: -48,
          top: -48,
          bgcolor: `${accent}18`,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 70,
          height: 70,
          borderRadius: "50%",
          right: 30,
          bottom: -42,
          bgcolor: `${accent}10`,
        }}
      />

      <Stack
        sx={{ position: "relative", zIndex: 1, height: "100%" }}
        justifyContent="space-between"
        spacing={2}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Typography
            variant="body2"
            sx={{ color: "#6F6874", fontWeight: 700, letterSpacing: "0.01em" }}
          >
            {label}
          </Typography>
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: "17px",
              display: "grid",
              placeItems: "center",
              bgcolor: iconBackground,
              color: iconColor,
              boxShadow: "0 8px 18px rgba(70,55,80,.08)",
            }}
          >
            {icon}
          </Box>
        </Stack>

        <Box>
          <Typography
            sx={{
              fontSize: { xs: 34, sm: 38 },
              lineHeight: 1,
              fontWeight: 850,
              letterSpacing: "-0.045em",
              color: "#393440",
            }}
          >
            {value}
          </Typography>
          <Stack direction="row" spacing={0.7} alignItems="center" sx={{ mt: 1.2 }}>
            <Box
              sx={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                bgcolor: `${accent}20`,
                color: iconColor,
              }}
            >
              <ArrowUpwardRoundedIcon sx={{ fontSize: 14 }} />
            </Box>
            <Typography variant="caption" sx={{ color: "#827985", fontWeight: 600 }}>
              {helper}
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}
