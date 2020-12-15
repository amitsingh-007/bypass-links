import { Container, Typography } from "@material-ui/core";
import React, { memo } from "react";
import { ChromeExtension } from "./ChromeExtension";
import Features from "./Features";
import { ReleaseInfo } from "./ReleaseInfo";
import Section from "./Section";

const DownloadPage = memo(() => (
  <>
    <Container>
      <Section textAlign="center">
        <Typography component="h1" variant="h2">
          Welcome to Bypass Links
        </Typography>
      </Section>
      <Section>
        <Features />
      </Section>
      <Section display="flex" justifyContent="space-evenly">
        <ChromeExtension />
      </Section>
      <Section>
        <ReleaseInfo />
      </Section>
    </Container>
  </>
));

export default DownloadPage;
