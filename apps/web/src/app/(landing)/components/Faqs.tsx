import { FAQS } from '../constants/faqs';

function Faqs() {
  return (
    <section id="faq" className="py-16 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-5 lg:gap-16 lg:px-12">
        <h2 className="font-display text-4xl leading-none font-extrabold tracking-tighter md:text-5xl lg:col-span-2 xl:text-6xl">
          <span className="block">questions,</span>
          <span className="block text-primary">answered</span>
        </h2>
        <div className="lg:col-span-3">
          {FAQS.map(({ question, answer, link }) => (
            <details key={question} className="group border-b py-5 first:pt-0">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-semibold [&::-webkit-details-marker]:hidden">
                {question}
                <span
                  aria-hidden="true"
                  className="text-2xl leading-none font-normal text-muted-foreground group-open:rotate-45 motion-safe:transition-transform"
                >
                  +
                </span>
              </summary>
              <p className="mt-4 mr-8 text-sm leading-relaxed text-muted-foreground">
                {answer}
                {link && (
                  <>
                    {' '}
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-primary underline-offset-4 hover:underline dark:text-chart-1"
                    >
                      {link.label}
                    </a>
                  </>
                )}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Faqs;
