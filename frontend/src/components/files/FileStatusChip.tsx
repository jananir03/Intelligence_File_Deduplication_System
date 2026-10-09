import { Chip } from "@mui/material";

interface FileStatusChipProps { status: string; duplicate?: boolean; }

export default function FileStatusChip({ status, duplicate }: FileStatusChipProps) {
  if (duplicate) {
    return <Chip size="small" label="Duplicate" sx={{ bgcolor: "#F0DCE3", color: "#966678", fontWeight: 700, borderRadius: 2 }} />;
  }
  const normalized = status.toLowerCase();
  const styles = normalized === "completed"
    ? { background: "#DFEADF", color: "#63806B" }
    : normalized === "processing"
      ? { background: "#E8E2EF", color: "#746488" }
      : { background: "#F0DFDF", color: "#986C70" };
  return <Chip size="small" label={status.charAt(0).toUpperCase() + status.slice(1)} sx={{ bgcolor: styles.background, color: styles.color, fontWeight: 700, borderRadius: 2 }} />;
}
