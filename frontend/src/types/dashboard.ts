export interface DashboardFileItem {
  id: number;
  original_filename: string;
  file_size: number;
  mime_type: string | null;
  file_extension: string | null;
  status: string;
  is_protected: boolean;
  uploaded_at: string;
}

export interface DashboardSummary {
  total_files: number;
  total_storage: number;
  duplicate_files: number;
  duplicate_storage: number;
  potential_savings: number;
  largest_files: DashboardFileItem[];
  recent_uploads: DashboardFileItem[];
}
