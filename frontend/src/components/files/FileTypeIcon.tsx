import {
  ArchiveRounded,
  AudioFileRounded,
  DescriptionRounded,
  FolderZipRounded,
  ImageRounded,
  InsertDriveFileRounded,
  PictureAsPdfRounded,
  SlideshowRounded,
  TableChartRounded,
  VideoFileRounded,
} from "@mui/icons-material";
import { Box } from "@mui/material";
import type { ReactNode } from "react";

interface FileTypeIconProps {
  filename: string;
  extension?: string | null;
  size?: number;
}

export default function FileTypeIcon({ filename, extension, size = 42 }: FileTypeIconProps) {
  const ext = (extension ?? filename.split(".").pop() ?? "file").replace(".", "").toLowerCase();
  let icon: ReactNode = <InsertDriveFileRounded />;
  let background = "#E7E1EC";
  let color = "#786A88";

  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) {
    icon = <ImageRounded />; background = "#E5E1EF"; color = "#776A98";
  } else if (ext === "pdf") {
    icon = <PictureAsPdfRounded />; background = "#F0DDE1"; color = "#A26F7A";
  } else if (["doc", "docx", "txt", "rtf"].includes(ext)) {
    icon = <DescriptionRounded />; background = "#DDE9EC"; color = "#64818B";
  } else if (["xls", "xlsx", "csv"].includes(ext)) {
    icon = <TableChartRounded />; background = "#DFEADF"; color = "#68866F";
  } else if (["ppt", "pptx"].includes(ext)) {
    icon = <SlideshowRounded />; background = "#EEE2D8"; color = "#98795F";
  } else if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext)) {
    icon = <VideoFileRounded />; background = "#E6E1ED"; color = "#74688C";
  } else if (["mp3", "wav", "aac", "flac"].includes(ext)) {
    icon = <AudioFileRounded />; background = "#E7E1E8"; color = "#8A6D86";
  } else if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
    icon = ext === "zip" ? <FolderZipRounded /> : <ArchiveRounded />; background = "#E9E3D7"; color = "#907A59";
  }

  return <Box sx={{ width: size, height: size, borderRadius: `${Math.round(size * 0.3)}px`, display: "grid", placeItems: "center", flexShrink: 0, bgcolor: background, color }}>{icon}</Box>;
}
