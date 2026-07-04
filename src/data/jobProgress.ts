export interface PipelineStageItem {
  name: string;
  status: 'complete' | 'active' | 'pending' | 'failed';
  duration?: string;
}

// AutoScene render pipeline (job_events.stage → order):
// breakdown → images → voiceover → render → assembly
export const PIPELINE_STAGES: PipelineStageItem[] = [
  { name: 'Scene Breakdown', status: 'pending' },
  { name: 'Generating Images', status: 'pending' },
  { name: 'Voiceover', status: 'pending' },
  { name: 'Rendering Scenes', status: 'pending' },
  { name: 'Assembling', status: 'pending' },
];
