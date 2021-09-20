import { Box } from "@mui/material";
import { SxProps } from "@mui/system";
import { memo, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

interface Props {
  containerStyles: SxProps;
  forceRender?: boolean;
  children: React.ReactNode;
}

const ProgressiveRender = memo<Props>(
  ({ containerStyles, forceRender = false, children }) => {
    const [isRendered, setIsRendered] = useState(forceRender);
    const { ref, inView } = useInView({
      rootMargin: "100px",
      triggerOnce: true,
    });

    useEffect(() => {
      if (!isRendered && inView) {
        setIsRendered(true);
      }
    }, [isRendered, inView]);

    useEffect(() => {
      window.requestIdleCallback(() => {
        if (!isRendered) {
          setIsRendered(true);
        }
      });
    }, [isRendered]);

    return (
      <Box sx={containerStyles} ref={ref}>
        {isRendered ? children : null}
      </Box>
    );
  }
);
ProgressiveRender.displayName = "ProgressiveRender";

export default ProgressiveRender;
