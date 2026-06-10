export interface PipelineStageItem {
  name: string;
  status: 'complete' | 'active' | 'pending' | 'failed';
  duration?: string;
}

export const PIPELINE_STAGES: PipelineStageItem[] = [
  { name: 'Script Processing', status: 'pending' },
  { name: 'Motion Analysis', status: 'pending' },
  { name: 'Avatar Rendering', status: 'pending' },
  { name: 'Applying Edits', status: 'pending' },
  { name: 'Subtitle Generation', status: 'pending' },
  { name: 'Uploading', status: 'pending' },
];
