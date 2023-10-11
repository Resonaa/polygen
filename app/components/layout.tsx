import type { ReactNode } from "react";
import type { SemanticWIDTHS } from "semantic-ui-react";

export default function Layout({
  children
}: {
  columns: SemanticWIDTHS;
  children: ReactNode;
}) {
  return children;
}
