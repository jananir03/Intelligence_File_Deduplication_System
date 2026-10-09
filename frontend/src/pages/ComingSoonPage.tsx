import { Box, Card, Typography } from "@mui/material";
import AppLayout from "../components/layout/AppLayout";

interface ComingSoonPageProps {
  title: string;
}

export default function ComingSoonPage({ title }: ComingSoonPageProps) {
  return (
    <AppLayout>
      <Box sx={{ maxWidth: 760, mx: "auto", py: { xs: 3, md: 7 } }}>
        <Card sx={{ p: { xs: 3, sm: 5 }, borderRadius: 4, textAlign: "center" }}>
          <Typography variant="h5" color="#403A46">
            {title}
          </Typography>
          <Typography sx={{ mt: 1, color: "#857C87" }}>
            This workspace will be implemented in the next frontend phase.
          </Typography>
        </Card>
      </Box>
    </AppLayout>
  );
}
