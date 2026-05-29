import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset", {
  variants: {
    variant: {
      slate: "bg-slate-50 text-slate-700 ring-slate-600/20",
      blue: "bg-blue-50 text-blue-700 ring-blue-700/15",
      amber: "bg-amber-50 text-amber-700 ring-amber-700/15",
      green: "bg-emerald-50 text-emerald-700 ring-emerald-700/15",
      red: "bg-red-50 text-red-700 ring-red-700/15",
      zinc: "bg-zinc-100 text-zinc-700 ring-zinc-700/15"
    }
  },
  defaultVariants: {
    variant: "slate"
  }
});

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export const Badge = ({ className, variant, ...props }: BadgeProps) => (
  <span className={cn(badgeVariants({ variant, className }))} {...props} />
);
