import { Box } from "@material-ui/core";
import { memo } from "react";
import { useInView } from "react-intersection-observer";

const ProgressiveRender = memo(({ containerStyles, forceRender, children }) => {
  const { ref, inView } = useInView({
    rootMargin: "100px",
    triggerOnce: true,
  });

  return (
    <Box sx={containerStyles} ref={ref}>
      {inView || forceRender ? children : null}
    </Box>
  );
});
ProgressiveRender.displayName = "ProgressiveRender";
export default ProgressiveRender;
