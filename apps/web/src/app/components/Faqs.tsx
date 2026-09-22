import { PlusSignIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { FAQS } from '@app/constants/faqs';

function Faqs() {
  return (
    <section id="faq" className="scroll-mt-20 py-16">
      <h2 className="mb-10 text-center text-3xl/tight font-bold lowercase md:text-4xl/tight">
        questions, answered
      </h2>
      <div className="mx-auto flex max-w-3xl flex-col gap-3">
        {FAQS.map(({ question, answer }) => (
          <details
            key={question}
            className="landing-press group rounded-xl border border-border bg-card"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl p-5 font-semibold lowercase outline-none focus-visible:ring-2 focus-visible:ring-primary">
              {question}
              <HugeiconsIcon
                icon={PlusSignIcon}
                size={18}
                className="shrink-0 text-primary transition-transform group-open:rotate-45"
              />
            </summary>
            <p className="px-5 pb-5 text-sm/relaxed text-muted-foreground">
              {answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

export default Faqs;
