import { Box } from "@material-ui/core";
import { memo } from "react";
import { useInView } from "react-intersection-observer";

const ProgressiveRender = memo((props) => {
  const { ref, inView } = useInView({
    rootMargin: "100px",
    triggerOnce: true,
  });

  return (
    <Box sx={{ height: props.height }} ref={ref}>
      {inView || props.forceRender ? props.children : null}
    </Box>
  );
});
ProgressiveRender.displayName = "ProgressiveRender";
export default ProgressiveRender;
