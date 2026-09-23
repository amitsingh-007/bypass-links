import { FAQS } from '@app/constants/faqs';
import { CONTAINER_WIDE, FOCUS_RING, HEADING } from '@app/constants/landing';

function Faqs() {
  return (
    <section
      id="faq"
      className="max-landing-md:py-20 max-landing-sm:py-15.5 bg-background py-27.5"
    >
      <div
        className={`${CONTAINER_WIDE} max-landing-md:grid-cols-1 max-landing-md:gap-8 grid grid-cols-[0.8fr_1.2fr] gap-17.5`}
      >
        <h2 className={HEADING}>
          <span className="block">questions,</span>
          <span className="block text-primary">answered</span>
        </h2>
        <div>
          {FAQS.map(({ question, answer }) => (
            <details
              key={question}
              className="group border-landing-faq-line border-b py-5.5 first:pt-0"
            >
              <summary
                className={`flex cursor-pointer list-none items-center justify-between gap-5.5 text-(length:--text-landing-15) font-semibold [&::-webkit-details-marker]:hidden ${FOCUS_RING}`}
              >
                {question}
                <span
                  aria-hidden="true"
                  className="ease-landing flex-none text-(length:--text-landing-23) leading-none font-normal text-muted-foreground transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
                >
                  +
                </span>
              </summary>
              <p className="leading-landing-faq mt-4 mr-8.5 text-sm text-muted-foreground">
                {answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Faqs;
