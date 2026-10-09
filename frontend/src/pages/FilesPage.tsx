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
  TextField,
  Divider,
  IconButton,
  Pagination,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SearchOffRoundedIcon from "@mui/icons-material/SearchOffRounded";
import FolderOpenRoundedIcon from "@mui/icons-material/FolderOpenRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from "react";
import axios from "axios";
import AppLayout from "../components/layout/AppLayout";
import FileFilters, { type FileFilterValues } from "../components/files/FileFilters";
import FileStatusChip from "../components/files/FileStatusChip";
import FileTypeIcon from "../components/files/FileTypeIcon";
import UploadDialog from "../components/files/UploadDialog";
import { deleteFile, downloadFile, getFiles } from "../api/filesApi";
import type { FileItem } from "../types/files";
import { formatBytes, formatDateTime } from "../utils/fileFormat";

const defaultFilters: FileFilterValues = {
  filename: "",
  fileType: "",
  duplicate: "all",
  minSize: "",
  maxSize: "",
  startDate: "",
  endDate: "",
  sortBy: "uploaded_at",
  sortOrder: "desc",
};

export default function FilesPage() {
  const [filters, setFilters] = useState<FileFilterValues>(defaultFilters);
  const [items, setItems] = useState<FileItem[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [downloadId, setDownloadId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<FileItem | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleting, setDeleting] = useState(false);

  const loadFiles = useCallback(async (targetPage = page, activeFilters: FileFilterValues = filters) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await getFiles({
        filename: activeFilters.filename.trim() || undefined,
        file_type: activeFilters.fileType || undefined,
        duplicate:
          activeFilters.duplicate === "all"
            ? undefined
            : activeFilters.duplicate === "duplicate",
        min_size: activeFilters.minSize ? Number(activeFilters.minSize) * 1024 : undefined,
        max_size: activeFilters.maxSize ? Number(activeFilters.maxSize) * 1024 : undefined,
        start_date: activeFilters.startDate || undefined,
        end_date: activeFilters.endDate || undefined,
        page: targetPage,
        page_size: pageSize,
        sort_by: activeFilters.sortBy,
        sort_order: activeFilters.sortOrder,
      });

      setItems(response.items);
      setTotal(response.total);
      setTotalPages(Math.max(1, response.total_pages));
      setPage(response.page);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const detail = error.response?.data?.detail;
        setErrorMessage(
          typeof detail === "string"
            ? detail
            : "Unable to load your files. Please make sure the backend is running.",
        );
      } else {
        setErrorMessage("Unable to load your files. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [filters, page, pageSize]);

  useEffect(() => {
    void loadFiles(1);
    // Initial load only. Filter changes are applied with the Apply button.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const summaryText = useMemo(() => {
    if (total === 0) return "No files found";
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, total);
    return `Showing ${start}-${end} of ${total} file${total === 1 ? "" : "s"}`;
  }, [page, pageSize, total]);

  const handleApply = () => {
    setPage(1);
    void loadFiles(1);
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    setPage(1);
    void loadFiles(1, defaultFilters);
  };

  const handlePageChange = (_event: ChangeEvent<unknown>, value: number) => {
    setPage(value);
    void loadFiles(value);
  };

  const handleDownload = async (file: FileItem) => {
    setDownloadId(file.id);
    try {
      await downloadFile(file.id, file.original_filename);
      setSnackbar(`${file.original_filename} download started.`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const detail = error.response?.data?.detail;
        setSnackbar(typeof detail === "string" ? detail : "Download failed.");
      } else {
        setSnackbar("Download failed. Please try again.");
      }
    } finally {
      setDownloadId(null);
    }
  };

  const handleUploaded = () => {
    setSnackbar("File uploaded. Hashing and duplicate detection are processing in the background.");
    window.setTimeout(() => void loadFiles(1), 700);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const response = await deleteFile(deleteTarget.id, deleteReason);
      setDeleteTarget(null);
      setDeleteReason("");
      setSnackbar(response.warning ?? `${deleteTarget.original_filename} was deleted successfully.`);
      await loadFiles(page);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const detail = error.response?.data?.detail;
        setSnackbar(typeof detail === "string" ? detail : "Unable to delete the file.");
      } else {
        setSnackbar("Unable to delete the file. Please try again.");
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AppLayout>
      <Stack spacing={2.5}>
        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            p: { xs: 2.5, sm: 3.2 },
            borderRadius: 5,
            background: "linear-gradient(135deg, #EEE4F1 0%, #F3E8E4 52%, #E7E8F1 100%)",
            border: "1px solid rgba(103,88,120,.09)",
            boxShadow: "0 16px 38px rgba(80,65,95,.07)",
          }}
        >
          <Box sx={{ position: "absolute", width: 180, height: 180, borderRadius: "50%", bgcolor: "#DCCDE2", opacity: .55, right: -65, top: -90 }} />
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2} sx={{ position: "relative", zIndex: 1 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ width: 54, height: 54, borderRadius: "17px", display: "grid", placeItems: "center", bgcolor: "rgba(255,255,255,.68)", color: "#76689A", boxShadow: "0 10px 24px rgba(80,65,95,.08)" }}>
                <FolderOpenRoundedIcon />
              </Box>
              <Box>
                <Typography sx={{ fontSize: { xs: 27, sm: 32 }, fontWeight: 850, letterSpacing: "-0.035em", color: "#393440" }}>
                  My Files
                </Typography>
                <Typography sx={{ mt: 0.35, color: "#766E7A" }}>
                  Upload, search and manage the files in your workspace.
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" startIcon={<RefreshRoundedIcon />} onClick={() => void loadFiles(page)} disabled={isLoading} sx={{ borderColor: "#C9BDCE", color: "#665B73", bgcolor: "rgba(255,255,255,.52)" }}>
                Refresh
              </Button>
              <Button variant="contained" startIcon={<CloudUploadRoundedIcon />} onClick={() => setUploadOpen(true)} sx={{ bgcolor: "#76689A", "&:hover": { bgcolor: "#62577F" }, boxShadow: "0 10px 22px rgba(118,104,154,.18)" }}>
                Upload file
              </Button>
            </Stack>
          </Stack>
        </Box>

        <FileFilters
          values={filters}
          onChange={setFilters}
          onApply={handleApply}
          onReset={handleReset}
        />

        {errorMessage && (
          <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => void loadFiles(page)}>Retry</Button>} sx={{ borderRadius: 3 }}>
            {errorMessage}
          </Alert>
        )}

        <Card sx={{ borderRadius: 5, overflow: "hidden", bgcolor: "rgba(255,252,250,.86)" }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1} sx={{ p: { xs: 2.2, sm: 2.7 } }}>
            <Box>
              <Typography variant="h6" fontWeight={800} color="#403A46">Your file library</Typography>
              <Typography variant="body2" color="#8B838D" sx={{ mt: 0.3 }}>{summaryText}</Typography>
            </Box>
            <Typography variant="caption" color="#968D98">Duplicate detection runs asynchronously after upload.</Typography>
          </Stack>
          <Divider sx={{ borderColor: "rgba(86,70,88,.07)" }} />

          {isLoading ? (
            <Box sx={{ minHeight: 360, display: "grid", placeItems: "center" }}>
              <Stack alignItems="center" spacing={1.5}>
                <CircularProgress sx={{ color: "#76689A" }} />
                <Typography color="#8B828E">Loading your files...</Typography>
              </Stack>
            </Box>
          ) : items.length === 0 ? (
            <Box sx={{ minHeight: 360, display: "grid", placeItems: "center", px: 3 }}>
              <Stack alignItems="center" spacing={1.3} textAlign="center">
                <Box sx={{ width: 66, height: 66, borderRadius: "22px", display: "grid", placeItems: "center", bgcolor: "#E9E1ED", color: "#796A8C" }}>
                  <SearchOffRoundedIcon fontSize="large" />
                </Box>
                <Typography variant="h6" fontWeight={800} color="#4A4350">Nothing matched</Typography>
                <Typography variant="body2" color="#8B828E" maxWidth={420}>
                  Try changing your search or filters, or upload your first file to start building your library.
                </Typography>
                <Button variant="contained" startIcon={<CloudUploadRoundedIcon />} onClick={() => setUploadOpen(true)} sx={{ mt: 0.5, bgcolor: "#76689A", "&:hover": { bgcolor: "#62577F" } }}>
                  Upload a file
                </Button>
              </Stack>
            </Box>
          ) : (
            <Box sx={{ overflowX: "auto" }}>
              <Box sx={{ minWidth: 900 }}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "minmax(280px, 2.3fr) 120px 140px 170px 150px",
                    gap: 2,
                    px: { xs: 2.2, sm: 2.7 },
                    py: 1.4,
                    bgcolor: "#F7F1F4",
                    color: "#8B818E",
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: ".04em",
                    textTransform: "uppercase",
                  }}
                >
                  <Box>File</Box><Box>Size</Box><Box>Status</Box><Box>Uploaded</Box><Box sx={{ textAlign: "right" }}>Action</Box>
                </Box>

                {items.map((file, index) => (
                  <Box
                    key={file.id}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "minmax(280px, 2.3fr) 120px 140px 170px 150px",
                      gap: 2,
                      alignItems: "center",
                      px: { xs: 2.2, sm: 2.7 },
                      py: 1.65,
                      borderBottom: index === items.length - 1 ? "none" : "1px solid rgba(86,70,88,.06)",
                      transition: "background .18s ease",
                      "&:hover": { bgcolor: "#FCF7F8" },
                    }}
                  >
                    <Stack direction="row" spacing={1.4} alignItems="center" minWidth={0}>
                      <FileTypeIcon filename={file.original_filename} extension={file.file_extension} />
                      <Box minWidth={0}>
                        <Stack direction="row" spacing={0.8} alignItems="center" minWidth={0}>
                          <Typography fontWeight={760} color="#48414D" noWrap title={file.original_filename}>
                            {file.original_filename}
                          </Typography>
                          {file.is_protected && <Tooltip title="Protected file"><LockRoundedIcon sx={{ fontSize: 16, color: "#8C7C91" }} /></Tooltip>}
                        </Stack>
                        <Typography variant="caption" color="#928995" noWrap>
                          {file.mime_type ?? file.file_extension?.toUpperCase() ?? "File"}
                        </Typography>
                      </Box>
                    </Stack>
                    <Typography variant="body2" fontWeight={700} color="#625A67">{formatBytes(file.file_size)}</Typography>
                    <FileStatusChip status={file.status} duplicate={file.is_duplicate} />
                    <Typography variant="body2" color="#77707B">{formatDateTime(file.uploaded_at)}</Typography>
                    <Box sx={{ textAlign: "right" }}>
                      <Stack direction="row" justifyContent="flex-end" spacing={0.6}>
                        <Tooltip title="Download">
                          <span>
                            <IconButton
                              onClick={() => void handleDownload(file)}
                              disabled={downloadId === file.id || file.status !== "completed"}
                              sx={{ bgcolor: "#EEE7F0", color: "#76689F", "&:hover": { bgcolor: "#E5DBE9" } }}
                            >
                              {downloadId === file.id ? <CircularProgress size={19} sx={{ color: "#76689F" }} /> : <DownloadRoundedIcon fontSize="small" />}
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title={file.is_protected ? "Protected file" : file.status === "processing" ? "Cannot delete while processing" : "Delete file"}>
                          <span>
                            <IconButton
                              onClick={() => { setDeleteTarget(file); setDeleteReason(""); }}
                              disabled={file.is_protected || file.status === "processing"}
                              sx={{ bgcolor: "#F2E4E5", color: "#A66F78", "&:hover": { bgcolor: "#EBD7D9" } }}
                            >
                              <DeleteOutlineRoundedIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {!isLoading && items.length > 0 && totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2.5, borderTop: "1px solid rgba(86,70,88,.06)" }}>
              <Pagination count={totalPages} page={page} onChange={handlePageChange} shape="rounded" sx={{ "& .MuiPaginationItem-root": { color: "#75687F" }, "& .Mui-selected": { bgcolor: "#E4DCE9 !important", color: "#5F5270", fontWeight: 800 } }} />
            </Box>
          )}
        </Card>
      </Stack>

      <UploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} onUploaded={handleUploaded} />

      <Dialog open={Boolean(deleteTarget)} onClose={() => !deleting && setDeleteTarget(null)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4, bgcolor: "#FFFCFA" } }}>
        <DialogTitle sx={{ fontWeight: 850, color: "#403A46" }}>Delete file?</DialogTitle>
        <DialogContent>
          <Typography color="#655D69" sx={{ mb: 1 }}>You are about to permanently delete:</Typography>
          <Box sx={{ p: 1.6, borderRadius: 3, bgcolor: "#F7EFF1", mb: 2 }}>
            <Typography fontWeight={800} color="#4A4350" noWrap>{deleteTarget?.original_filename}</Typography>
            <Typography variant="body2" color="#8A818D">{deleteTarget ? formatBytes(deleteTarget.file_size) : ""}</Typography>
          </Box>
          {deleteTarget?.is_duplicate && <Alert severity="warning" sx={{ mb: 2, borderRadius: 3 }}>This file is marked as a duplicate. Deleting it can recover its storage.</Alert>}
          <TextField fullWidth label="Reason (optional)" value={deleteReason} onChange={(event) => setDeleteReason(event.target.value)} inputProps={{ maxLength: 255 }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting} sx={{ color: "#75697D" }}>Cancel</Button>
          <Button onClick={() => void handleDelete()} disabled={deleting} variant="contained" startIcon={deleting ? <CircularProgress size={17} color="inherit" /> : <DeleteOutlineRoundedIcon />} sx={{ bgcolor: "#A66F78", "&:hover": { bgcolor: "#8F5D67" } }}>Delete file</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={4500}
        onClose={() => setSnackbar("")}
        message={snackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        sx={{
          zIndex: (theme) => theme.zIndex.snackbar + 1,
          mb: { xs: 1, md: 2 },
          mr: { xs: 1, md: 2 },
        }}
      />
    </AppLayout>
  );
}
