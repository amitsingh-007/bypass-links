import { ActionIcon, Box, Flex, Text } from '@mantine/core';
import footerImage from '@public/footer.png';
import dayjs from 'dayjs';
import { headers } from 'next/headers';
import Image from 'next/image';
import { type IconType } from 'react-icons';
import { BsGithub } from 'react-icons/bs';
import { MdExtension } from 'react-icons/md';
import { RiTimeFill } from 'react-icons/ri';
import styles from './styles/Footer.module.css';

function Info({
  icon: Icon,
  text,
  testId,
}: {
  icon: IconType;
  text: string;
  testId: string;
}) {
  return (
    <Flex align="center" className={styles.infoContainer} data-testid={testId}>
      <Box className={styles.iconContainer}>
        <Icon size="100%" />
      </Box>
      <Text ml="0.625rem" fw={500} fz="1.1rem">
        {text}
      </Text>
    </Flex>
  );
}

function Footer({
  releaseDate,
  extVersion,
}: {
  releaseDate: string;
  extVersion: string;
}) {
  const headersList = await headers();
  const tz = headersList.get('x-vercel-ip-timezone') ?? undefined;

  return (
    <Flex
      pos="relative"
      w="100%"
      justify="space-around"
      className={styles.footerContainer}
    >
      <Image src={footerImage} alt="footer image" className={styles.image} />
      <Flex
        pos="absolute"
        justify="space-between"
        w="100%"
        className={styles.footerBody}
      >
        <Flex direction="column">
          <Info
            icon={MdExtension}
            text={`v ${extVersion}`}
            testId="ext-version"
          />
          <Info
            icon={RiTimeFill}
            text={dayjs(releaseDate).tz(tz).format('DD MMMM YYYY hh:mm A')}
            testId="ext-release-data"
          />
        </Flex>
        <Flex align="center">
          <Box
            component="a"
            target="_blank"
            href="https://github.com/amitsingh-007/bypass-links"
            title="Bypass Links - Github"
          >
            <ActionIcon
              radius="xl"
              size="xl"
              color="gray.2"
              aria-label="Github Repository Link"
            >
              <BsGithub size={28} />
            </ActionIcon>
          </Box>
        </Flex>
      </Flex>
    </Flex>
  );
}

export default Footer;
