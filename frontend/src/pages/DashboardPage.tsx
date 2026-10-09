import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import MetricCard from "../components/dashboard/MetricCard";
import FileRow from "../components/dashboard/FileRow";
import { getDashboardSummary } from "../api/dashboardApi";
import type { DashboardSummary } from "../types/dashboard";
import { formatBytes } from "../utils/fileFormat";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await getDashboardSummary();
      setSummary(data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const detail = error.response?.data?.detail;
        setErrorMessage(
          typeof detail === "string"
            ? detail
            : "Unable to load dashboard data. Please make sure the backend is running.",
        );
      } else {
        setErrorMessage("Unable to load dashboard data. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const storagePercentage = useMemo(() => {
    if (!summary || summary.total_storage <= 0) return 0;
    return Math.min(100, (summary.duplicate_storage / summary.total_storage) * 100);
  }, [summary]);

  const savingsPercentage = useMemo(() => {
    if (!summary || summary.total_storage <= 0) return 0;
    return Math.min(100, (summary.potential_savings / summary.total_storage) * 100);
  }, [summary]);

  return (
    <AppLayout>
      <Stack spacing={3.2}>
        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            p: { xs: 2.5, sm: 3.2, lg: 3.6 },
            borderRadius: 5,
            background:
              "linear-gradient(135deg, rgba(238,229,240,.94) 0%, rgba(247,237,232,.94) 52%, rgba(232,234,243,.94) 100%)",
            border: "1px solid rgba(103,88,120,.10)",
            boxShadow: "0 18px 42px rgba(80,65,95,.08)",
          }}
        >
          <Box sx={{ position: "absolute", width: 180, height: 180, borderRadius: "50%", bgcolor: "#D9CDE1", opacity: .55, right: -55, top: -75 }} />
          <Box sx={{ position: "absolute", width: 100, height: 100, borderRadius: "50%", bgcolor: "#E7D6D5", opacity: .48, right: 130, bottom: -65 }} />

          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2.5}
            sx={{ position: "relative", zIndex: 1 }}
          >
            <Stack direction="row" spacing={1.6} alignItems="center">
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: "17px",
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "rgba(255,255,255,.68)",
                  color: "#76689A",
                  boxShadow: "0 10px 24px rgba(80,65,95,.08)",
                }}
              >
                <AutoAwesomeRoundedIcon />
              </Box>
              <Box>
                <Typography sx={{ fontSize: { xs: 27, sm: 32 }, fontWeight: 850, letterSpacing: "-0.035em", color: "#393440" }}>
                  Good to see you.
                </Typography>
                <Typography sx={{ mt: 0.35, color: "#766E7A" }}>
                  Here&apos;s a calm overview of your file storage today.
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<RefreshRoundedIcon />}
                onClick={() => void loadDashboard()}
                disabled={isLoading}
                sx={{ borderColor: "#C9BDCE", color: "#665B73", bgcolor: "rgba(255,255,255,.50)" }}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<CloudUploadRoundedIcon />}
                onClick={() => navigate("/files")}
                sx={{ bgcolor: "#76689A", "&:hover": { bgcolor: "#62577F" }, boxShadow: "0 10px 22px rgba(118,104,154,.18)" }}
              >
                Upload file
              </Button>
            </Stack>
          </Stack>
        </Box>

        {errorMessage && (
          <Alert
            severity="error"
            action={<Button color="inherit" size="small" onClick={() => void loadDashboard()}>Retry</Button>}
            sx={{ borderRadius: 3 }}
          >
            {errorMessage}
          </Alert>
        )}

        {isLoading && !summary ? (
          <Card sx={{ p: 7, borderRadius: 5, textAlign: "center", bgcolor: "rgba(255,252,250,.82)" }}>
            <CircularProgress sx={{ color: "#76689A" }} />
            <Typography sx={{ mt: 2 }} color="#817984">Loading your storage overview...</Typography>
          </Card>
        ) : summary ? (
          <>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" },
                gap: 2.2,
              }}
            >
              <MetricCard
                label="Total files"
                value={summary.total_files.toLocaleString("en-IN")}
                helper="Completed files in your space"
                icon={<FolderRoundedIcon />}
                background="linear-gradient(145deg, #F2EAF4 0%, #E9E1EC 100%)"
                iconBackground="#DDD1E4"
                iconColor="#76648A"
                accent="#8B719A"
              />
              <MetricCard
                label="Total storage"
                value={formatBytes(summary.total_storage)}
                helper="Space currently being used"
                icon={<StorageRoundedIcon />}
                background="linear-gradient(145deg, #E9EFF1 0%, #DFE8EA 100%)"
                iconBackground="#D2E0E3"
                iconColor="#66828B"
                accent="#75939A"
              />
              <MetricCard
                label="Duplicate files"
                value={summary.duplicate_files.toLocaleString("en-IN")}
                helper="Redundant copies detected"
                icon={<ContentCopyRoundedIcon />}
                background="linear-gradient(145deg, #F4E8EA 0%, #EEDCDF 100%)"
                iconBackground="#E5CCD3"
                iconColor="#9A6E7B"
                accent="#B07D8A"
              />
              <MetricCard
                label="Potential savings"
                value={formatBytes(summary.potential_savings)}
                helper="Storage you could recover"
                icon={<SavingsRoundedIcon />}
                background="linear-gradient(145deg, #EAF0E8 0%, #DFE9E0 100%)"
                iconBackground="#D4E2D6"
                iconColor="#66836F"
                accent="#7C9B83"
              />
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1.08fr .92fr" }, gap: 2.2 }}>
              <Card
                sx={{
                  p: { xs: 2.5, sm: 3.2 },
                  borderRadius: 5,
                  bgcolor: "rgba(255,252,250,.84)",
                  background: "linear-gradient(145deg, rgba(255,252,250,.95), rgba(239,232,242,.72))",
                }}
              >
                <Stack spacing={2.5}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="h6" color="#403A46">Storage overview</Typography>
                      <Typography variant="body2" color="#8B838D" sx={{ mt: 0.35 }}>
                        See how much of your used storage is duplicate content.
                      </Typography>
                    </Box>
                    <Box sx={{ width: 42, height: 42, borderRadius: "14px", display: "grid", placeItems: "center", bgcolor: "#E7DCEB", color: "#806F91" }}>
                      <StorageRoundedIcon />
                    </Box>
                  </Stack>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems="center">
                    <Box
                      sx={{
                        width: 150,
                        height: 150,
                        borderRadius: "50%",
                        display: "grid",
                        placeItems: "center",
                        background: `conic-gradient(#C88AA7 ${storagePercentage}%, #E9E2E8 ${storagePercentage}% 100%)`,
                        flexShrink: 0,
                      }}
                    >
                      <Box sx={{ width: 112, height: 112, borderRadius: "50%", bgcolor: "#FFFDFC", display: "grid", placeItems: "center", textAlign: "center", boxShadow: "0 6px 18px rgba(80,65,95,.06)" }}>
                        <Box>
                          <Typography sx={{ fontSize: 25, fontWeight: 850, color: "#4B4352", lineHeight: 1 }}>{storagePercentage.toFixed(1)}%</Typography>
                          <Typography variant="caption" color="#918892">of used storage</Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Stack spacing={1.7} sx={{ flex: 1, width: "100%" }}>
                      <StorageLegend color="#C88AA7" label="Duplicate storage" value={formatBytes(summary.duplicate_storage)} />
                      <StorageLegend color="#A8B8AA" label="Potential savings" value={formatBytes(summary.potential_savings)} />
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="caption" color="#938A95">Recoverable duplicate storage</Typography>
                        <LinearProgress
                          variant="determinate"
                          value={savingsPercentage}
                          sx={{ mt: 0.8, height: 8, borderRadius: 10, bgcolor: "#E9E2E6", "& .MuiLinearProgress-bar": { borderRadius: 10, bgcolor: "#86A08D" } }}
                        />
                        <Typography variant="caption" color="#8F8791" sx={{ display: "block", mt: 0.8 }}>
                          {summary.duplicate_storage === 0 ? "All current storage is unique." : `${formatBytes(summary.potential_savings)} could be recovered by removing redundant copies.`}
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </Stack>
              </Card>

              <Card sx={{ p: { xs: 2.5, sm: 3.2 }, borderRadius: 5, bgcolor: "rgba(255,252,250,.84)" }}>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h6" color="#403A46">Largest files</Typography>
                      <Typography variant="body2" color="#8B838D" sx={{ mt: 0.35 }}>Your five largest completed files.</Typography>
                    </Box>
                    <Button size="small" endIcon={<ArrowForwardRoundedIcon />} onClick={() => navigate("/files")} sx={{ color: "#76689A" }}>View files</Button>
                  </Stack>
                  {summary.largest_files.length === 0 ? <EmptyState text="No completed files yet." /> : (
                    <Stack divider={<Divider sx={{ borderColor: "rgba(86,70,88,.06)" }} />}>
                      {summary.largest_files.map((file) => <FileRow key={file.id} file={file} compact />)}
                    </Stack>
                  )}
                </Stack>
              </Card>
            </Box>

            <Card sx={{ p: { xs: 2.5, sm: 3.2 }, borderRadius: 5, bgcolor: "rgba(255,252,250,.84)" }}>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6" color="#403A46">Recent uploads</Typography>
                    <Typography variant="body2" color="#8B838D" sx={{ mt: 0.35 }}>Your latest completed uploads.</Typography>
                  </Box>
                  <Button size="small" endIcon={<ArrowForwardRoundedIcon />} onClick={() => navigate("/files")} sx={{ color: "#76689A" }}>View all</Button>
                </Stack>
                {summary.recent_uploads.length === 0 ? <EmptyState text="No recent uploads to show." /> : (
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, columnGap: 2, rowGap: 0.5 }}>
                    {summary.recent_uploads.map((file) => <FileRow key={file.id} file={file} compact />)}
                  </Box>
                )}
              </Stack>
            </Card>
          </>
        ) : null}
      </Stack>
    </AppLayout>
  );
}

function StorageLegend({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Stack direction="row" spacing={1} alignItems="center">
        <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: color }} />
        <Typography variant="body2" color="#69616D">{label}</Typography>
      </Stack>
      <Typography variant="body2" fontWeight={800} color="#51495A">{value}</Typography>
    </Stack>
  );
}

function EmptyState({ text }: { text: string }) {
  return <Box sx={{ py: 4, textAlign: "center" }}><Typography variant="body2" color="#9B939D">{text}</Typography></Box>;
}
