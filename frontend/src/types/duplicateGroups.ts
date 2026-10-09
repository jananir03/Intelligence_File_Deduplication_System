export interface DuplicateGroupListItem {
  id: number;
  file_hash_id: number;
  sha256_hash: string;
  total_files: number;
  duplicate_count: number;
  total_size: number;
  potential_savings: number;
  created_at: string;
  updated_at: string;
}

export interface DuplicateGroupFile {
  id: number;
  original_filename: string;
  stored_filename: string;
  file_size: number;
  mime_type: string | null;
  file_extension: string | null;
  status: string;
  is_protected: boolean;
  uploaded_at: string;
  is_original: boolean;
}

export interface DuplicateGroupDetail extends DuplicateGroupListItem {
  original_file: DuplicateGroupFile | null;
  duplicate_files: DuplicateGroupFile[];
}

export interface DuplicateGroupListResponse {
  items: DuplicateGroupListItem[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}
