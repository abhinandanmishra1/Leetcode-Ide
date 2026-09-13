import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

const TooltipProvider = TooltipPrimitive.Provider;

const TooltipRoot = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef(
  ({ className, sideOffset = 5, ...props }, ref) => (
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={`z-50 overflow-hidden rounded-md border border-[#3e3e3e] bg-[#222222] px-2.5 py-1 text-xs text-gray-200 shadow-xl animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1 select-none pointer-events-none ${
        className || ""
      }`}
      {...props}
    />
  )
);
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

/**
 * Shadcn-styled Tooltip component supporting both compound usage and shortcut usage:
 * Shortcut: <Tooltip content="Tooltip text" side="bottom"><button>...</button></Tooltip>
 * Compound: <TooltipRoot><TooltipTrigger asChild>...</TooltipTrigger><TooltipContent>...</TooltipContent></TooltipRoot>
 */
const Tooltip = ({
  content,
  children,
  side = "top",
  align = "center",
  delayDuration = 150,
  className = "",
  ...props
}) => {
  if (!content) {
    return <TooltipRoot {...props}>{children}</TooltipRoot>;
  }

  return (
    <TooltipRoot delayDuration={delayDuration} {...props}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} align={align} className={className}>
        {content}
      </TooltipContent>
    </TooltipRoot>
  );
};

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  TooltipRoot,
};
export default Tooltip;
