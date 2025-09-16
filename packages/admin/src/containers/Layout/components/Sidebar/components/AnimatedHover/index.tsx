import { Box } from "@mui/material";
import { FC, memo, useRef } from "react";

const AnimatedHover: FC = memo(() => {
  const ref = useRef<HTMLDivElement>(null);

  return <Box ref={ref} sx={{ backgroundColor: "primary.200" }}></Box>;
});

export default AnimatedHover;
