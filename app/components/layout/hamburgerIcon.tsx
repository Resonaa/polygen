import { motion } from "framer-motion";

function Path(props: typeof motion.path.defaultProps) {
  return (
    <motion.path
      fill="transparent"
      strokeWidth={2.5}
      stroke="currentColor"
      strokeLinecap="round"
      {...props}
    />
  );
}

type HamburgerButtonProps = typeof motion.svg.defaultProps & {
  isOpen: boolean;
};

export default function HamburgerIcon({
  isOpen,
  ...props
}: HamburgerButtonProps) {
  return (
    <motion.svg
      animate={isOpen ? "open" : "closed"}
      width={16}
      height={16}
      viewBox="0 0 22 18"
      {...props}
    >
      <Path
        variants={{
          closed: { d: "M 2 2.5 L 20 2.5" },
          open: { d: "M 3 16.5 L 17 2.5" }
        }}
      />
      <Path
        d="M 2 9.423 L 20 9.423"
        variants={{
          closed: { opacity: 1 },
          open: { opacity: 0 }
        }}
        transition={{ duration: 0.1 }}
      />
      <Path
        variants={{
          closed: { d: "M 2 16.346 L 20 16.346" },
          open: { d: "M 3 2.5 L 17 16.346" }
        }}
      />
    </motion.svg>
  );
}
