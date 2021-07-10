import { Box } from "@material-ui/core";
import { SxProps } from "@material-ui/system";
import { memo } from "react";
import { useInView } from "react-intersection-observer";

interface Props {
  containerStyles: SxProps;
  forceRender: boolean;
}

const ProgressiveRender = memo<Props>(
  ({ containerStyles, forceRender, children }) => {
    const { ref, inView } = useInView({
      rootMargin: "100px",
      triggerOnce: true,
    });

    return (
      <Box sx={containerStyles} ref={ref}>
        {inView || forceRender ? children : null}
      </Box>
    );
  }
);
ProgressiveRender.displayName = "ProgressiveRender";

export default ProgressiveRender;
