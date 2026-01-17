import { Button, Flex, Group, Title } from '@mantine/core';
import Image from 'next/image';
import { memo } from 'react';
import styles from './styles/PageHeader.module.css';

interface IExtData {
  version: string;
  date: string;
  downloadLink: string;
}

interface Props {
  chrome: IExtData;
}

function DownloadButton({
  logo,
  text,
  downloadLink,
}: {
  logo: string;
  text: string;
  downloadLink: string;
}) {
  return (
    <Button
      component="a"
      href={downloadLink}
      className={styles.downloadButton}
      radius="xl"
      size="lg"
      leftSection={<Image src={logo} alt={text} height={22} width={22} />}
      variant="gradient"
      gradient={{ from: '#6850ff', to: '#a750ff', deg: 90 }}
      fz="1rem"
    >
      {text}
    </Button>
  );
}

const PageHeader = memo<Props>(({ chrome }) => (
  <Group mt="4.375rem" justify="center">
    <Title fz={{ base: '2.1875rem', md: '2.8125rem' }} ta="center">
      Have a Link Bypasser and private Bookmarks Panel !
    </Title>
    <Flex
      mt={{ base: 8, md: 20 }}
      gap={{ base: 20, md: 120 }}
      direction={{ base: 'column', md: 'row' }}
    >
      <DownloadButton
        logo="chrome.svg"
        text="Download for Chrome"
        downloadLink={chrome.downloadLink}
      />
    </Flex>
  </Group>
));

export default PageHeader;
