interface AspectRatioIconProps {
    ratio: string;
    className?: string;
  }
  
  export function AspectRatioIcon({ ratio, className = "" }: AspectRatioIconProps) {
    const getIconStyles = (ratio: string) => {
      const styles = {
        "9:16": "w-3 h-5",
        "16:9": "w-5 h-3",
        "1:1": "w-4 h-4",
        "4:3": "w-4 h-3",
      }[ratio] || "w-4 h-4";
      
      return `bg-current rounded-sm ${styles} ${className}`;
    };
  
    return <div className={getIconStyles(ratio)} />;
  }

  export const TabIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect 
        x="2" 
        y="6" 
        width="20" 
        height="12" 
        rx="2" 
        fill="hsl(var(--muted))"
        strokeWidth="1"
      />
      <text
        x="12"
        y="14.5"
        fontSize="6"
        textAnchor="middle"
        fill="currentColor"
        stroke="none"
      >
        tab
      </text>
    </svg>
  );

  export const LightIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );

  export const ArrowUpIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 7-7 7 7" />
      <path d="M12 19V5" />
    </svg>
  );

