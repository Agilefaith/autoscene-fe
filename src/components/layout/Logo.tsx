import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * AutoScene brand mark — uses /public/logo.png (gradient play mark).
 * See docs/AUTOSCENE_DESIGN_SYSTEM.md §2.6.
 */
export function LogoMark({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="AutoScene"
      width={size}
      height={size}
      priority
      className={cn('shrink-0', className)}
    />
  );
}

export default function Logo({
  href = '/',
  size = 36,
  className,
  wordmarkClassName,
}: {
  href?: string;
  size?: number;
  className?: string;
  wordmarkClassName?: string;
}) {
  return (
    <Link href={href} className={cn('flex items-center gap-2.5 group', className)}>
      <LogoMark size={size} className="transition-transform duration-200 group-hover:scale-105" />
      <span className={cn('text-[1.6rem] font-display font-bold tracking-tight text-text leading-none', wordmarkClassName)}>
        AutoScene
      </span>
    </Link>
  );
}
