export type DBFolder = {
  id: string;
  name: string;
  parent_id?: string;
};

export type DBFolderMeta = {
  folder_id: string;
  content_id: string;
  is_folder: boolean;
  priority: number;
};
