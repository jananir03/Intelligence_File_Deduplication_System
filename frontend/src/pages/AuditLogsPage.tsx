import { useCallback, useEffect, useState } from "react";
import {
  Alert, Box, Button, Card, CircularProgress, MenuItem, Pagination, Select, Stack, TextField, Typography,
} from "@mui/material";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import axios from "axios";
import AppLayout from "../components/layout/AppLayout";
import { getAuditLogs } from "../api/auditLogsApi";
import type { AuditLogItem } from "../types/auditLogs";
import { formatDateTime } from "../utils/fileFormat";

const actions = ["", "LOGIN", "REGISTER", "UPLOAD", "DOWNLOAD", "HASH_QUEUE_FAILED", "DELETE"];
const entities = ["", "USER", "FILE"];

export default function AuditLogsPage() {
  const [items, setItems] = useState<AuditLogItem[]>([]);
  const [action, setAction] = useState("");
  const [entityType, setEntityType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadLogs = useCallback(async (targetPage = page) => {
    setLoading(true); setError("");
    try {
      const response = await getAuditLogs({ action: action || undefined, entity_type: entityType || undefined, start_date: startDate || undefined, end_date: endDate || undefined, page: targetPage, page_size: 15 });
      setItems(response.items); setPage(response.page); setTotalPages(Math.max(1, response.total_pages)); setTotal(response.total);
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? (typeof err.response?.data?.detail === "string" ? err.response.data.detail : "Unable to load audit logs.") : "Unable to load audit logs.";
      setError(message);
    } finally { setLoading(false); }
  }, [action, entityType, startDate, endDate, page]);

  useEffect(() => { void loadLogs(1); /* initial request */ // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const apply = () => { setPage(1); void loadLogs(1); };
  const reset = () => { setAction(""); setEntityType(""); setStartDate(""); setEndDate(""); setPage(1); void getAuditLogs({ page: 1, page_size: 15 }).then(r => { setItems(r.items); setTotal(r.total); setTotalPages(Math.max(1, r.total_pages)); }).catch(() => setError("Unable to load audit logs.")); };

  return <AppLayout><Stack spacing={2.5}>
    <Box sx={{ position: "relative", overflow: "hidden", p: { xs: 2.5, sm: 3.2 }, borderRadius: 5, background: "linear-gradient(135deg, #E8E0EF 0%, #F2E5E2 50%, #E3E9EF 100%)", border: "1px solid rgba(103,88,120,.09)", boxShadow: "0 16px 38px rgba(80,65,95,.07)" }}>
      <Box sx={{ position: "absolute", width: 190, height: 190, borderRadius: "50%", bgcolor: "#D7CADF", opacity: .55, right: -65, top: -95 }} />
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2} sx={{ position: "relative", zIndex: 1 }}>
        <Stack direction="row" spacing={1.5} alignItems="center"><Box sx={{ width: 54, height: 54, borderRadius: "17px", display: "grid", placeItems: "center", bgcolor: "rgba(255,255,255,.7)", color: "#76689A" }}><HistoryRoundedIcon /></Box><Box><Typography sx={{ fontSize: { xs: 27, sm: 32 }, fontWeight: 850, letterSpacing: "-0.035em", color: "#393440" }}>Audit Logs</Typography><Typography sx={{ mt: .35, color: "#766E7A" }}>A simple history of actions performed in your workspace.</Typography></Box></Stack>
        <Button variant="outlined" startIcon={<RefreshRoundedIcon />} onClick={() => void loadLogs(page)} disabled={loading} sx={{ borderColor: "#C9BDCE", color: "#665B73", bgcolor: "rgba(255,255,255,.55)" }}>Refresh</Button>
      </Stack>
    </Box>

    <Card sx={{ borderRadius: 5, p: { xs: 2, sm: 2.5 }, bgcolor: "rgba(255,252,250,.88)" }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={1.2} alignItems={{ md: "center" }}>
        <Select value={action} onChange={e => setAction(e.target.value)} size="small" displayEmpty sx={{ minWidth: 190 }}><MenuItem value="">All actions</MenuItem>{actions.filter(Boolean).map(item => <MenuItem key={item} value={item}>{item.replaceAll("_", " ")}</MenuItem>)}</Select>
        <Select value={entityType} onChange={e => setEntityType(e.target.value)} size="small" displayEmpty sx={{ minWidth: 170 }}><MenuItem value="">All entities</MenuItem>{entities.filter(Boolean).map(item => <MenuItem key={item} value={item}>{item}</MenuItem>)}</Select>
        <TextField size="small" type="date" label="From" value={startDate} onChange={e => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} />
        <TextField size="small" type="date" label="Until" value={endDate} onChange={e => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} />
        <Button variant="contained" startIcon={<SearchRoundedIcon />} onClick={apply} sx={{ bgcolor: "#76689A", "&:hover": { bgcolor: "#62577F" } }}>Apply</Button>
        <Button variant="text" onClick={reset} sx={{ color: "#76689A" }}>Clear</Button>
      </Stack>
    </Card>

    {error && <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => void loadLogs(page)}>Retry</Button>} sx={{ borderRadius: 3 }}>{error}</Alert>}

    <Card sx={{ borderRadius: 5, overflow: "hidden", bgcolor: "rgba(255,252,250,.88)" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: { xs: 2.2, sm: 2.7 } }}><Box><Typography variant="h6" fontWeight={800} color="#403A46">Activity history</Typography><Typography variant="body2" color="#8B838D">{total} recorded action{total === 1 ? "" : "s"}</Typography></Box><HistoryRoundedIcon sx={{ color: "#9A8CA2" }} /></Stack>
      {loading ? <Box sx={{ minHeight: 320, display: "grid", placeItems: "center" }}><CircularProgress sx={{ color: "#76689A" }} /></Box> : items.length === 0 ? <Box sx={{ minHeight: 300, display: "grid", placeItems: "center", px: 3 }}><Typography color="#8B828E">No audit events match your filters.</Typography></Box> : <Box sx={{ overflowX: "auto" }}><Box sx={{ minWidth: 850 }}><Box sx={{ display: "grid", gridTemplateColumns: "140px 130px 100px minmax(300px,1fr) 190px", gap: 1.5, px: 2.7, py: 1.4, bgcolor: "#F7F1F4", color: "#8B818E", fontSize: 12, fontWeight: 800, textTransform: "uppercase" }}><Box>Action</Box><Box>Entity</Box><Box>ID</Box><Box>Description</Box><Box>Time</Box></Box>{items.map((log, index) => <Box key={log.id} sx={{ display: "grid", gridTemplateColumns: "140px 130px 100px minmax(300px,1fr) 190px", gap: 1.5, alignItems: "center", px: 2.7, py: 1.6, borderBottom: index === items.length - 1 ? "none" : "1px solid rgba(86,70,88,.06)" }}><Typography fontWeight={800} color="#665878" fontSize={13}>{log.action.replaceAll("_", " ")}</Typography><Typography color="#6F6672" fontSize={13}>{log.entity_type ?? "—"}</Typography><Typography color="#7E7581" fontSize={13}>{log.entity_id ?? "—"}</Typography><Typography color="#5F5866" fontSize={13}>{log.description ?? "No description"}</Typography><Typography color="#817884" fontSize={13}>{formatDateTime(log.created_at)}</Typography></Box>)}</Box></Box>}
      {!loading && items.length > 0 && totalPages > 1 && <Box sx={{ display: "flex", justifyContent: "center", py: 2.5, borderTop: "1px solid rgba(86,70,88,.06)" }}><Pagination count={totalPages} page={page} onChange={(_, value) => { setPage(value); void loadLogs(value); }} shape="rounded" sx={{ "& .Mui-selected": { bgcolor: "#E4DCE9 !important", color: "#5F5270", fontWeight: 800 } }} /></Box>}
    </Card>
  </Stack></AppLayout>;
}
