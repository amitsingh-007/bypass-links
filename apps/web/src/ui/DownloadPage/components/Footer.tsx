import { getMediaQuery } from '@bypass/shared';
import { ActionIcon, Box, Flex, Text } from '@mantine/core';
import footerImage from '@public/footer.png';
import dayjs from 'dayjs';
import Image from 'next/image';
import { IconType } from 'react-icons';
import { BsGithub } from 'react-icons/bs';
import { MdExtension } from 'react-icons/md';
import { RiTimeFill } from 'react-icons/ri';

const Info = ({
  icon: Icon,
  text,
  testId,
}: {
  icon: IconType;
  text: string;
  testId: string;
}) => {
  return (
    <Flex
      align="center"
      sx={(theme) => getMediaQuery(theme, { marginTop: [0, '0.625rem'] })}
      data-testid={testId}
    >
      <Box
        sx={(theme) =>
          getMediaQuery(theme, {
            width: ['1.25rem', '1.5rem'],
            height: ['1.25rem', '1.5rem'],
          })
        }
      >
        <Icon size="100%" />
      </Box>
      <Text ml="0.625rem" fw={500} fz="1.1rem">
        {text}
      </Text>
    </Flex>
  );
};

const Footer = ({
  releaseDate,
  extVersion,
  timezone,
}: {
  releaseDate: string;
  extVersion: string;
  timezone: string;
}) => {
  return (
    <Flex
      pos="relative"
      w="100%"
      justify="space-around"
      sx={(theme) =>
        getMediaQuery(theme, {
          height: ['8.125rem', '18.75rem'],
        })
      }
    >
      <Image
        src={footerImage}
        alt="footer image"
        style={{ height: 'inherit', width: 'inherit' }}
      />
      <Flex
        pos="absolute"
        justify="space-between"
        w="100%"
        sx={(theme) =>
          getMediaQuery(theme, {
            padding: ['0 1.25rem', '0 12.5rem'],
            bottom: [0, '7%'],
          })
        }
      >
        <Flex direction="column">
          <Info
            icon={MdExtension}
            text={`v ${extVersion}`}
            testId="ext-version"
          />
          <Info
            icon={RiTimeFill}
            text={dayjs(releaseDate)
              .tz(timezone)
              .format('DD MMMM YYYY hh:mm A')}
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
              radius={999}
              size="xl"
              aria-label="Github Repository Link"
            >
              <BsGithub size={28} />
            </ActionIcon>
          </Box>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Footer;
