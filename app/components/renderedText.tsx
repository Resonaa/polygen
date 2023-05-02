import clsx from "clsx";

export default function RenderedText({
                                       html,
                                       mode,
                                       className
                                     }: { html: string, mode: "light" | "dark", className?: string }) {
  return (
    <div className={clsx(className, mode === "light" && "vditor-reset")}
         dangerouslySetInnerHTML={{ __html: html }} />
  );
}