import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import type { SelectChangeEvent } from "@mui/material/Select";
import type { DuplicateFilter, SortField, SortOrder } from "../../types/files";

export interface FileFilterValues {
  filename: string; fileType: string; duplicate: DuplicateFilter; minSize: string; maxSize: string;
  startDate: string; endDate: string; sortBy: SortField; sortOrder: SortOrder;
}
interface FileFiltersProps { values: FileFilterValues; onChange: (values: FileFilterValues) => void; onApply: () => void; onReset: () => void; }

export default function FileFilters({ values, onChange, onApply, onReset }: FileFiltersProps) {
  const update = <K extends keyof FileFilterValues>(key: K, value: FileFilterValues[K]) => onChange({ ...values, [key]: value });
  const handleSelect = (key: "duplicate" | "sortBy" | "sortOrder") => (event: SelectChangeEvent) => update(key, event.target.value as FileFilterValues[typeof key]);

  return (
    <Box sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 4, bgcolor: "rgba(255,252,250,.68)", border: "1px solid rgba(91,75,103,.08)" }}>
      <Stack spacing={2}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 36, height: 36, borderRadius: "12px", display: "grid", placeItems: "center", bgcolor: "#E6DCEB", color: "#77698D" }}><FilterAltRoundedIcon fontSize="small" /></Box>
            <Box><Typography fontWeight={800} color="#514858">Search & filters</Typography><Typography variant="caption" color="#8B828E">Narrow down your files without leaving the page.</Typography></Box>
          </Stack>
          <Button startIcon={<RestartAltRoundedIcon />} onClick={onReset} sx={{ color: "#786A87", alignSelf: { xs: "flex-start", sm: "center" } }}>Clear filters</Button>
        </Stack>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "2fr 1fr 1fr" }, gap: 1.5 }}>
          <TextField label="Search filename" value={values.filename} onChange={(event) => update("filename", event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") onApply(); }} placeholder="e.g. report, invoice, photo" fullWidth />
          <FormControl fullWidth><InputLabel>File type</InputLabel><Select label="File type" value={values.fileType} onChange={(event) => update("fileType", event.target.value)}>
            <MenuItem value="">All types</MenuItem><MenuItem value="pdf">PDF</MenuItem><MenuItem value="docx">Word</MenuItem><MenuItem value="xlsx">Excel</MenuItem><MenuItem value="txt">Text</MenuItem><MenuItem value="image">Images</MenuItem><MenuItem value="video">Videos</MenuItem><MenuItem value="audio">Audio</MenuItem><MenuItem value="zip">Archives</MenuItem>
          </Select></FormControl>
          <FormControl fullWidth><InputLabel>Duplicate status</InputLabel><Select label="Duplicate status" value={values.duplicate} onChange={handleSelect("duplicate")}>
            <MenuItem value="all">All files</MenuItem><MenuItem value="duplicate">Duplicates only</MenuItem><MenuItem value="unique">Unique only</MenuItem>
          </Select></FormControl>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" }, gap: 1.5 }}>
          <TextField label="Minimum size (KB)" type="number" value={values.minSize} onChange={(event) => update("minSize", event.target.value)} inputProps={{ min: 0 }} />
          <TextField label="Maximum size (KB)" type="number" value={values.maxSize} onChange={(event) => update("maxSize", event.target.value)} inputProps={{ min: 0 }} />
          <TextField label="Uploaded from" type="date" value={values.startDate} onChange={(event) => update("startDate", event.target.value)} InputLabelProps={{ shrink: true }} />
          <TextField label="Uploaded until" type="date" value={values.endDate} onChange={(event) => update("endDate", event.target.value)} InputLabelProps={{ shrink: true }} />
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "stretch", sm: "center" }}>
          <FormControl sx={{ minWidth: 190 }}><InputLabel>Sort by</InputLabel><Select label="Sort by" value={values.sortBy} onChange={handleSelect("sortBy")}>
            <MenuItem value="uploaded_at">Upload date</MenuItem><MenuItem value="filename">Filename</MenuItem><MenuItem value="size">File size</MenuItem><MenuItem value="status">Status</MenuItem><MenuItem value="extension">File type</MenuItem>
          </Select></FormControl>
          <FormControl sx={{ minWidth: 150 }}><InputLabel>Order</InputLabel><Select label="Order" value={values.sortOrder} onChange={handleSelect("sortOrder")}>
            <MenuItem value="desc">Descending</MenuItem><MenuItem value="asc">Ascending</MenuItem>
          </Select></FormControl>
          <Button variant="contained" startIcon={<FilterAltRoundedIcon />} onClick={onApply} sx={{ ml: { sm: "auto" }, bgcolor: "#76689A", "&:hover": { bgcolor: "#62577F" } }}>Apply filters</Button>
        </Stack>
      </Stack>
    </Box>
  );
}
