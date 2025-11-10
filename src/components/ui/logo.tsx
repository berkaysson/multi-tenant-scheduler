import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export function Logo({ 
  className, 
  width = 40, 
  height = 40,
  priority = false 
}: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="Logo"
      width={width}
      height={height}
      className={cn("rounded-lg", className)}
      priority={priority}
    />
  );
}

