import { Box } from "@material-ui/core";
import { memo } from "react";
import AppHeader from "./AppHeader";
import Footer from "./Footer";
import MetaTags from "./MetaTags";
import PageHeader from "./PageHeader";
import SalientFeatures from "./SalientFeatures";

const DownloadPage = memo(() => (
  <>
    <MetaTags />
    <AppHeader />
    <Box sx={{ p: "0 200px" }}>
      <PageHeader />
      <SalientFeatures />
    </Box>
    <Footer />
  </>
));
DownloadPage.displayName = "DownloadPage";

export default DownloadPage;
