import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Pagination,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import axios from "axios";
import AppLayout from "../components/layout/AppLayout";
import { getDuplicateGroupDetail, getDuplicateGroups } from "../api/duplicateGroupsApi";
import type { DuplicateGroupDetail, DuplicateGroupListItem } from "../types/duplicateGroups";
import { formatBytes, formatDateTime } from "../utils/fileFormat";

export default function DuplicateGroupsPage() {
  const [groups, setGroups] = useState<DuplicateGroupListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState<DuplicateGroupDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadGroups = useCallback(async (targetPage = 1) => {
    setLoading(true);
    setError("");
    try {
      const response = await getDuplicateGroups(targetPage);
      setGroups(response.items);
      setPage(response.page);
      setTotalPages(Math.max(1, response.total_pages));
      setTotal(response.total);
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? (typeof err.response?.data?.detail === "string" ? err.response.data.detail : "Unable to load duplicate groups.")
        : "Unable to load duplicate groups.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadGroups(1); }, [loadGroups]);

  const openDetail = async (groupId: number) => {
    setDetailLoading(true);
    try {
      setDetail(await getDuplicateGroupDetail(groupId));
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? (typeof err.response?.data?.detail === "string" ? err.response.data.detail : "Unable to load group details.")
        : "Unable to load group details.";
      setError(message);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <AppLayout>
      <Stack spacing={2.5}>
        <Box sx={{ position: "relative", overflow: "hidden", p: { xs: 2.5, sm: 3.2 }, borderRadius: 5, background: "linear-gradient(135deg, #EDE2F1 0%, #F4E5E7 50%, #E5E8F1 100%)", border: "1px solid rgba(103,88,120,.09)", boxShadow: "0 16px 38px rgba(80,65,95,.07)" }}>
          <Box sx={{ position: "absolute", width: 190, height: 190, borderRadius: "50%", bgcolor: "#D7C9E2", opacity: .55, right: -65, top: -95 }} />
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2} sx={{ position: "relative", zIndex: 1 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ width: 54, height: 54, borderRadius: "17px", display: "grid", placeItems: "center", bgcolor: "rgba(255,255,255,.7)", color: "#76689A" }}><ContentCopyRoundedIcon /></Box>
              <Box>
                <Typography sx={{ fontSize: { xs: 27, sm: 32 }, fontWeight: 850, letterSpacing: "-0.035em", color: "#393440" }}>Duplicate Groups</Typography>
                <Typography sx={{ mt: .35, color: "#766E7A" }}>See repeated files together and understand recoverable storage.</Typography>
              </Box>
            </Stack>
            <Button variant="outlined" startIcon={<RefreshRoundedIcon />} onClick={() => void loadGroups(page)} disabled={loading} sx={{ borderColor: "#C9BDCE", color: "#665B73", bgcolor: "rgba(255,255,255,.55)" }}>Refresh</Button>
          </Stack>
        </Box>

        {error && <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => void loadGroups(page)}>Retry</Button>} sx={{ borderRadius: 3 }}>{error}</Alert>}

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
          <SummaryPill label="Groups found" value={String(total)} icon={<ContentCopyRoundedIcon />} tone="#E8DDED" />
          <SummaryPill label="Purpose" value="Remove redundant copies" icon={<SavingsRoundedIcon />} tone="#E5EEE6" />
        </Stack>

        {loading ? (
          <Card sx={{ borderRadius: 5, minHeight: 400, display: "grid", placeItems: "center", bgcolor: "rgba(255,252,250,.88)" }}><CircularProgress sx={{ color: "#76689A" }} /></Card>
        ) : groups.length === 0 ? (
          <Card sx={{ borderRadius: 5, minHeight: 400, display: "grid", placeItems: "center", bgcolor: "rgba(255,252,250,.88)" }}>
            <Stack alignItems="center" spacing={1.2} textAlign="center" px={3}>
              <Box sx={{ width: 68, height: 68, borderRadius: "22px", display: "grid", placeItems: "center", bgcolor: "#E8E2ED", color: "#7A6D8E" }}><FolderRoundedIcon fontSize="large" /></Box>
              <Typography variant="h6" fontWeight={800} color="#49424F">No duplicate groups yet</Typography>
              <Typography variant="body2" color="#8B828E" maxWidth={440}>When two completed files have the same SHA-256 content hash, FileNest will group them here.</Typography>
            </Stack>
          </Card>
        ) : (
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }, gap: 2.2 }}>
            {groups.map((group, index) => (
              <GroupCard key={group.id} group={group} index={index} onOpen={() => void openDetail(group.id)} />
            ))}
          </Box>
        )}

        {!loading && groups.length > 0 && totalPages > 1 && <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}><Pagination count={totalPages} page={page} onChange={(_, value) => { setPage(value); void loadGroups(value); }} shape="rounded" sx={{ "& .Mui-selected": { bgcolor: "#E4DCE9 !important", color: "#5F5270", fontWeight: 800 } }} /></Box>}
      </Stack>

      <Dialog open={Boolean(detail) || detailLoading} onClose={() => !detailLoading && setDetail(null)} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 4, bgcolor: "#FFFCFA" } }}>
        {detailLoading ? <Box sx={{ minHeight: 240, display: "grid", placeItems: "center" }}><CircularProgress sx={{ color: "#76689A" }} /></Box> : detail && <GroupDetail detail={detail} onClose={() => setDetail(null)} />}
      </Dialog>
    </AppLayout>
  );
}

function SummaryPill({ label, value, icon, tone }: { label: string; value: string; icon: ReactNode; tone: string }) {
  return <Card sx={{ flex: 1, borderRadius: 4, p: 1.6, bgcolor: "rgba(255,252,250,.82)", display: "flex", alignItems: "center", gap: 1.2 }}><Box sx={{ width: 40, height: 40, borderRadius: "13px", display: "grid", placeItems: "center", bgcolor: tone, color: "#756A88" }}>{icon}</Box><Box><Typography variant="caption" color="#8B828E">{label}</Typography><Typography fontWeight={800} color="#4A4350">{value}</Typography></Box></Card>;
}

function GroupCard({ group, index, onOpen }: { group: DuplicateGroupListItem; index: number; onOpen: () => void }) {
  const tones = ["#E8DDED", "#E6EDE7", "#F0E1E3", "#E3E9EF"];
  const tone = tones[index % tones.length];
  return <Card sx={{ borderRadius: 5, p: 2.3, bgcolor: "rgba(255,252,250,.88)", position: "relative", overflow: "hidden", transition: "transform .18s ease, box-shadow .18s ease", "&:hover": { transform: "translateY(-3px)", boxShadow: "0 22px 45px rgba(86,70,88,.12)" } }}>
    <Box sx={{ position: "absolute", width: 120, height: 120, borderRadius: "50%", bgcolor: tone, right: -42, top: -48 }} />
    <Stack spacing={1.8} sx={{ position: "relative" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Stack direction="row" spacing={1.2} alignItems="center"><Box sx={{ width: 46, height: 46, borderRadius: "15px", display: "grid", placeItems: "center", bgcolor: tone, color: "#766A88" }}><ContentCopyRoundedIcon /></Box><Box><Typography fontWeight={800} color="#47404D">Duplicate group #{group.id}</Typography><Typography variant="caption" color="#8B828E">{group.total_files} matching files</Typography></Box></Stack>
        <Tooltip title="Open group details"><IconButton onClick={onOpen} sx={{ color: "#76689A", bgcolor: "#F0EAF3" }}><ArrowForwardRoundedIcon fontSize="small" /></IconButton></Tooltip>
      </Stack>
      <Box sx={{ p: 1.7, borderRadius: 3.5, bgcolor: "#F8F3F5" }}><Typography variant="caption" color="#8B828E">SHA-256</Typography><Typography sx={{ mt: .4, fontFamily: "monospace", fontSize: 12, color: "#645B68" }}>{group.sha256_hash.slice(0, 20)}…</Typography></Box>
      <Stack direction="row" spacing={1}>
        <Stat label="Copies" value={String(group.duplicate_count)} />
        <Stat label="Storage" value={formatBytes(group.total_size)} />
        <Stat label="Savings" value={formatBytes(group.potential_savings)} />
      </Stack>
      <Typography variant="caption" color="#938A95">Updated {formatDateTime(group.updated_at)}</Typography>
    </Stack>
  </Card>;
}

function Stat({ label, value }: { label: string; value: string }) { return <Box sx={{ flex: 1, p: 1.1, borderRadius: 3, bgcolor: "#FBF8F7" }}><Typography variant="caption" color="#958B96">{label}</Typography><Typography fontWeight={800} color="#504855">{value}</Typography></Box>; }

function GroupDetail({ detail, onClose }: { detail: DuplicateGroupDetail; onClose: () => void }) {
  return <><DialogTitle sx={{ px: 3, pt: 2.7 }}><Stack direction="row" justifyContent="space-between" alignItems="center"><Box><Typography variant="h5" fontWeight={850} color="#3F3945">Duplicate group #{detail.id}</Typography><Typography variant="body2" color="#8A818D">{detail.total_files} matching files · recoverable {formatBytes(detail.potential_savings)}</Typography></Box><IconButton onClick={onClose}><CloseRoundedIcon /></IconButton></Stack></DialogTitle><DialogContent sx={{ px: 3, pb: 1.5 }}><Box sx={{ p: 1.6, borderRadius: 3.5, bgcolor: "#F7F1F4", mb: 2 }}><Typography variant="caption" color="#8D8490">SHA-256</Typography><Typography sx={{ fontFamily: "monospace", fontSize: 12, color: "#5E5663", mt: .4, wordBreak: "break-all" }}>{detail.sha256_hash}</Typography></Box><Typography fontWeight={800} color="#4A4350" sx={{ mb: 1 }}>Original file</Typography>{detail.original_file ? <FileLine file={detail.original_file} tone="#E5EEE6" /> : <Typography color="#8B828E">Original file is not visible in your workspace.</Typography>}<Typography fontWeight={800} color="#4A4350" sx={{ mt: 2, mb: 1 }}>Duplicate files</Typography><Stack spacing={1}>{detail.duplicate_files.map(file => <FileLine key={file.id} file={file} tone="#F0E1E3" />)}</Stack></DialogContent><DialogActions sx={{ px: 3, pb: 2.5 }}><Button onClick={onClose} variant="contained" sx={{ bgcolor: "#76689A", "&:hover": { bgcolor: "#62577F" } }}>Close</Button></DialogActions></>;
}

function FileLine({ file, tone }: { file: NonNullable<DuplicateGroupDetail["original_file"]>; tone: string }) { return <Box sx={{ p: 1.4, borderRadius: 3, bgcolor: "#FCF9F8", border: "1px solid rgba(86,70,88,.06)" }}><Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}><Stack direction="row" spacing={1.1} alignItems="center" minWidth={0}><Box sx={{ width: 38, height: 38, borderRadius: "12px", display: "grid", placeItems: "center", bgcolor: tone, color: "#75697D" }}><FolderRoundedIcon fontSize="small" /></Box><Box minWidth={0}><Typography fontWeight={750} color="#514955" noWrap>{file.original_filename}</Typography><Typography variant="caption" color="#918793">{formatDateTime(file.uploaded_at)}</Typography></Box></Stack><Typography fontWeight={750} color="#625A67">{formatBytes(file.file_size)}</Typography></Stack></Box>; }
