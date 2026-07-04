import { Images } from 'lucide-react';
import { ComingSoon } from '@/components/ui/ComingSoon';

export default function ThumbnailClonerPage() {
  return (
    <ComingSoon
      title="Thumbnail Cloner"
      description="Auto-generate thumbnail variations for your videos, or clone a competitor's thumbnail from a reference. Coming soon."
      icon={<Images className="w-8 h-8" />}
    />
  );
}
