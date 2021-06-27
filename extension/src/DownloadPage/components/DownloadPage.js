import { Box } from "@material-ui/core";
import { memo } from "react";
import AppHeader from "./AppHeader";
import Footer from "./Footer";
import PageHeader from "./PageHeader";
import SalientFeatures from "./SalientFeatures";

const DownloadPage = memo(() => (
  <>
    <AppHeader />
    <Box sx={{ p: "0 200px" }}>
      <PageHeader />
      <SalientFeatures />
    </Box>
    <Footer />
  </>
));

export default DownloadPage;
