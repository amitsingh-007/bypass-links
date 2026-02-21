import CircleIcon from '@app/icons/circle.svg';
import React from 'react';
import { firstColumn, secondColumn } from '../constants/features';
import type Feature from './types/feature';

function Description() {
  return (
    <div className="relative mb-10">
      <span className="text-3xl font-medium">
        Why <span className="text-[#7e67ff]">Bypass Links</span>
      </span>
      <div
        className="
          absolute top-7.5 right-26.25 w-35 border-b-30
          border-b-[rgba(106,80,255,0.4)]
        "
      />
      <p className="mt-9 text-base">
        An easy to use links bypasser and highly customizable & multipurpose
        bookmarks panel with person tagging panel, website last visited feature
        and many more ...
      </p>
      <div className="relative top-4.5 -right-25">
        <CircleIcon />
      </div>
    </div>
  );
}

function FeaturesColumn({
  columnData,
}: {
  columnData: Feature[];
}): React.JSX.Element {
  return (
    <>
      {columnData.map(({ title, content, icon: Icon }) => (
        <div key={title} className="mb-17.5">
          <Icon height={35} width={35} />
          <p className="text-lg font-bold">{title}</p>
          <p className="text-base text-[#839bad]">{content}</p>
        </div>
      ))}
    </>
  );
}

function SalientFeatures() {
  return (
    <div className="mt-37.5 flex">
      <div className="grid grid-cols-12">
        <div
          className="
            col-span-12
            sm:col-span-5
          "
        >
          <Description />
        </div>
        <div
          className="
            col-span-12
            sm:col-span-3
          "
        >
          <FeaturesColumn columnData={firstColumn} />
        </div>
        <div
          className="
            col-span-12
            sm:col-span-3
          "
        >
          <FeaturesColumn columnData={secondColumn} />
        </div>
      </div>
    </div>
  );
}

export default SalientFeatures;
