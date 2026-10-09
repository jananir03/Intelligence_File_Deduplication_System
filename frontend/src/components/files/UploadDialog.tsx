import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import InsertDriveFileRoundedIcon from "@mui/icons-material/InsertDriveFileRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { useRef, useState } from "react";
import axios from "axios";
import { uploadFile } from "../../api/filesApi";
import { formatBytes } from "../../utils/fileFormat";

interface UploadDialogProps { open: boolean; onClose: () => void; onUploaded: () => void; }

export default function UploadDialog({ open, onClose, onUploaded }: UploadDialogProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const reset = () => { setSelectedFile(null); setProgress(0); setIsUploading(false); setErrorMessage(""); setSuccessMessage(""); };
  const handleClose = () => { if (isUploading) return; reset(); onClose(); };
  const chooseFile = (file?: File) => { if (!file) return; setErrorMessage(""); setSuccessMessage(""); setProgress(0); setSelectedFile(file); };

  const handleUpload = async () => {
    if (!selectedFile) { setErrorMessage("Please choose a file first."); return; }
    setIsUploading(true); setErrorMessage("");
    try {
      const result = await uploadFile(selectedFile, setProgress);
      setSuccessMessage(result.message);
      onUploaded();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const detail = error.response?.data?.detail;
        setErrorMessage(typeof detail === "string" ? detail : "The file could not be uploaded. Please try again.");
      } else setErrorMessage("The file could not be uploaded. Please try again.");
    } finally { setIsUploading(false); }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 5, bgcolor: "#FFFCFA", background: "linear-gradient(145deg, #FFFCFA 0%, #F0E8F1 100%)", overflow: "hidden" } }}>
      <DialogTitle sx={{ px: 3, pt: 3, pb: 1.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box><Typography variant="h5" fontWeight={800} color="#3D3744">Upload a file</Typography><Typography variant="body2" color="#837A86" sx={{ mt: 0.4 }}>Add a file and let FileNest analyze it in the background.</Typography></Box>
          <Button onClick={handleClose} disabled={isUploading} sx={{ minWidth: 40, px: 1, color: "#807783" }} aria-label="Close upload dialog"><CloseRoundedIcon /></Button>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ px: 3, py: 2 }}>
        <Stack spacing={2}>
          {errorMessage && <Alert severity="error" sx={{ borderRadius: 3 }}>{errorMessage}</Alert>}
          {successMessage && <Alert severity="success" icon={<CheckCircleRoundedIcon />} sx={{ borderRadius: 3 }}>{successMessage}</Alert>}
          <Box component="button" type="button" onClick={() => inputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); chooseFile(event.dataTransfer.files[0]); }} sx={{ width: "100%", minHeight: 205, border: "1.5px dashed #B9ADC1", borderRadius: 4, bgcolor: "rgba(255,252,250,.68)", cursor: "pointer", color: "inherit", font: "inherit", textAlign: "center", p: 3, transition: "all .2s ease", "&:hover": { borderColor: "#8A789D", bgcolor: "rgba(241,233,242,.72)", transform: "translateY(-1px)" } }}>
            <Stack alignItems="center" justifyContent="center" spacing={1.2} sx={{ height: "100%" }}>
              <Box sx={{ width: 58, height: 58, borderRadius: "18px", display: "grid", placeItems: "center", bgcolor: "#E6DCEB", color: "#796A8C" }}><CloudUploadRoundedIcon fontSize="large" /></Box>
              <Typography fontWeight={800} color="#514858">Drop a file here or browse</Typography>
              <Typography variant="body2" color="#8B828E">Maximum upload size follows your backend configuration.</Typography>
            </Stack>
          </Box>
          <input ref={inputRef} hidden type="file" onChange={(event) => chooseFile(event.target.files?.[0])} />
          {selectedFile && <Box sx={{ p: 1.7, borderRadius: 3.5, bgcolor: "rgba(255,255,255,.68)", border: "1px solid rgba(92,76,103,.08)" }}><Stack direction="row" spacing={1.5} alignItems="center"><Box sx={{ width: 42, height: 42, borderRadius: "13px", display: "grid", placeItems: "center", bgcolor: "#E4E0ED", color: "#76688F" }}><InsertDriveFileRoundedIcon /></Box><Box sx={{ minWidth: 0, flex: 1 }}><Typography fontWeight={750} noWrap color="#4B4451">{selectedFile.name}</Typography><Typography variant="caption" color="#8B828E">{formatBytes(selectedFile.size)}</Typography></Box><Button size="small" onClick={() => setSelectedFile(null)} disabled={isUploading} sx={{ color: "#806F91" }}>Change</Button></Stack></Box>}
          {isUploading && <Box><Stack direction="row" justifyContent="space-between" sx={{ mb: 0.7 }}><Typography variant="caption" color="#7E7481">Uploading...</Typography><Typography variant="caption" fontWeight={750} color="#6E607D">{progress}%</Typography></Stack><LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 10, bgcolor: "#E9E1E8", "& .MuiLinearProgress-bar": { bgcolor: "#806E94", borderRadius: 10 } }} /></Box>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
        <Button onClick={handleClose} disabled={isUploading} sx={{ color: "#766B78" }}>Cancel</Button>
        <Button variant="contained" onClick={() => void handleUpload()} disabled={!selectedFile || isUploading || Boolean(successMessage)} startIcon={<CloudUploadRoundedIcon />} sx={{ bgcolor: "#76689A", "&:hover": { bgcolor: "#62577F" }, boxShadow: "0 10px 22px rgba(118,104,154,.18)" }}>Upload file</Button>
      </DialogActions>
    </Dialog>
  );
}
