import {
  GithubIcon,
  PuzzleIcon,
  Clock01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import footerImage from '@public/footer.png';
import dayjs from 'dayjs';
import { headers } from 'next/headers';
import Image from 'next/image';

function Info({
  icon,
  text,
  testId,
}: {
  icon: typeof GithubIcon;
  text: string;
  testId: string;
}) {
  return (
    <div
      className="
        mt-2.5 flex items-center
        sm:mt-0
      "
      data-testid={testId}
    >
      <div
        className="
          size-6
          sm:size-5
        "
      >
        <HugeiconsIcon icon={icon} size="100%" />
      </div>
      <span className="ml-2.5 text-lg font-medium">{text}</span>
    </div>
  );
}

async function Footer({
  releaseDate,
  extVersion,
}: {
  releaseDate: string;
  extVersion: string;
}) {
  const headersList = await headers();
  const tz = headersList.get('x-vercel-ip-timezone') ?? undefined;

  return (
    <div
      className="
        relative flex h-[300px] w-full justify-around
        sm:h-[130px]
      "
    >
      <Image src={footerImage} alt="footer image" className="size-full" />
      <div
        className="
          absolute bottom-[7%] flex w-full justify-between px-[200px]
          sm:bottom-0 sm:px-5
        "
      >
        <div className="flex flex-col">
          <Info
            icon={PuzzleIcon}
            text={`v ${extVersion}`}
            testId="ext-version"
          />
          <Info
            icon={Clock01Icon}
            text={dayjs(releaseDate).tz(tz).format('DD MMMM YYYY hh:mm A')}
            testId="ext-release-date"
          />
        </div>
        <div className="flex items-center">
          <a
            target="_blank"
            href="https://github.com/amitsingh-007/bypass-links"
            title="Bypass Links - Github"
            className="
              flex size-12 items-center justify-center rounded-full bg-gray-200
              text-gray-800 transition-colors
              hover:bg-gray-300
            "
            aria-label="Github Repository Link"
            rel="noreferrer"
          >
            <HugeiconsIcon icon={GithubIcon} size={28} />
          </a>
        </div>
      </div>
    </div>
  );
}

export default Footer;
