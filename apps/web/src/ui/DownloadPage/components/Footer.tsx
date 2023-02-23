import { getMediaQuery } from '@bypass/shared';
import { ActionIcon, Box, Flex, Text } from '@mantine/core';
import footerImage from '@public/footer.png';
import dayjs from 'dayjs';
import Image from 'next/image';
import { IconType } from 'react-icons';
import { GoMarkGithub } from 'react-icons/go';
import { MdExtension } from 'react-icons/md';
import { RiTimeFill } from 'react-icons/ri';

const Info = ({ icon: Icon, text }: { icon: IconType; text: string }) => {
  return (
    <Flex
      align="center"
      sx={(theme) => getMediaQuery(theme, { marginTop: [0, '10px'] })}
    >
      <Box
        sx={(theme) =>
          getMediaQuery(theme, {
            width: ['20px', '24px'],
            height: ['20px', '24px'],
          })
        }
      >
        <Icon size="100%" />
      </Box>
      <Text ml={10} fw={500} fz="1.1rem">
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
          height: ['130px', '300px'],
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
            padding: ['0 20px', '0 200px'],
            bottom: [0, '7%'],
          })
        }
      >
        <Flex direction="column">
          <Info icon={MdExtension} text={`v ${extVersion}`} />
          <Info
            icon={RiTimeFill}
            text={dayjs(releaseDate)
              .tz(timezone)
              .format('DD MMMM YYYY hh:mm A')}
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
              <GoMarkGithub size={28} />
            </ActionIcon>
          </Box>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Footer;
