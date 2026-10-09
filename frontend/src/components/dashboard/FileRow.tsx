import {
  Avatar,
  Box,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import TableChartRoundedIcon from "@mui/icons-material/TableChartRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import type { DashboardFileItem } from "../../types/dashboard";
import { formatBytes, formatDateTime, getFileExtension } from "../../utils/fileFormat";

interface FileRowProps {
  file: DashboardFileItem;
  compact?: boolean;
}

function getFileIcon(file: DashboardFileItem) {
  const extension = getFileExtension(file.original_filename, file.file_extension);

  if (extension === "PDF") return <PictureAsPdfRoundedIcon />;
  if (["PNG", "JPG", "JPEG", "GIF", "WEBP", "SVG"].includes(extension)) {
    return <ImageRoundedIcon />;
  }
  if (["XLS", "XLSX", "CSV"].includes(extension)) return <TableChartRoundedIcon />;
  if (["DOC", "DOCX", "TXT"].includes(extension)) return <ArticleRoundedIcon />;
  return <DescriptionRoundedIcon />;
}

export default function FileRow({ file, compact = false }: FileRowProps) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.5}
      sx={{
        py: compact ? 1.2 : 1.45,
        px: compact ? 0 : 1,
        borderRadius: 3,
        "&:hover": { bgcolor: "#FAF7F7" },
      }}
    >
      <Avatar
        variant="rounded"
        sx={{
          width: 40,
          height: 40,
          bgcolor: "#EEE8F0",
          color: "#7D6D8D",
        }}
      >
        {getFileIcon(file)}
      </Avatar>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="body2"
          fontWeight={700}
          color="#4A4350"
          noWrap
          title={file.original_filename}
        >
          {file.original_filename}
        </Typography>
        <Typography variant="caption" color="#9A929C">
          {formatDateTime(file.uploaded_at)}
        </Typography>
      </Box>

      <Stack alignItems="flex-end" spacing={0.35} sx={{ flexShrink: 0 }}>
        <Typography variant="body2" fontWeight={700} color="#5D5662">
          {formatBytes(file.file_size)}
        </Typography>
        {file.is_protected ? (
          <Chip
            label="Protected"
            size="small"
            sx={{
              height: 22,
              bgcolor: "#F0EAEF",
              color: "#806A7B",
              fontSize: 10.5,
              fontWeight: 700,
            }}
          />
        ) : (
          <Typography variant="caption" color="#AAA2AB">
            {file.status}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}
