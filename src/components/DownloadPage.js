import { Container } from "@material-ui/core";
import { memo } from "react";
import { ChromeExtension } from "./ChromeExtension";
import Features from "./Features";
import Heading from "./Heading";
import { ReleaseInfo } from "./ReleaseInfo";
import Section from "./Section";

const DownloadPage = memo(() => (
  <>
    <Container>
      <Section textAlign="center">
        <Heading />
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
