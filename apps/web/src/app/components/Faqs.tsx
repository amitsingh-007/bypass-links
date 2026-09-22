import { FAQS } from '@app/constants/faqs';

function Faqs() {
  return (
    <section id="faq" className="landing-faq">
      <div className="landing-container-wide landing-faq-grid">
        <h2 className="landing-h2">
          <span className="block">questions,</span>
          <span className="landing-accent block">answered</span>
        </h2>
        <div>
          {FAQS.map(({ question, answer }) => (
            <details key={question} className="landing-faq-item">
              <summary className="landing-faq-summary">
                {question}
                <span aria-hidden="true" className="landing-faq-plus">
                  +
                </span>
              </summary>
              <p className="landing-faq-answer">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Faqs;
