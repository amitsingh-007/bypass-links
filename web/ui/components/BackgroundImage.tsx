import { Box } from "@material-ui/core";
import Image from "next/image";

const BackgroundImage = ({
  src,
  alt,
  height,
  children,
}: {
  src: string;
  alt: string;
  height: string;
  children: React.ReactNode;
}) => {
  return (
    <>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height,
          zIndex: 1,
          "> div": {
            zIndex: -1,
          },
        }}
      >
        <Image src={src} alt={alt} layout="fill" objectFit="fill" blur />
        <Box>{children}</Box>
      </Box>
    </>
  );
};

export default BackgroundImage;
