import Header from './header';
import HeroDog from './hero-dog';
import { Icon } from './icons';
const pillars = [
  {
    title: 'Seleção Criteriosa',
    image: 'pilar-selecao.png',
    concept:
      'Qualidade, procedência, segurança e benefícios reais para os pets.',
    message: 'Escolhas que fazem a diferença no dia a dia do seu pet.',
  },
  {
    title: 'Bem-Estar e Desenvolvimento',
    image: 'pilar-bem-estar.png',
    concept:
      'Cuidado e estímulos para o equilíbrio físico, mental e comportamental.',
    message: 'Mais estímulos, cuidado e equilíbrio para uma vida melhor.',
  },
  {
    title: 'Experiência Premium',
    image: 'pilar-premium.png',
    concept:
      'Funcionalidade, conforto, durabilidade e design em produtos diferenciados.',
    message: 'Funcionalidade, conforto e design em cada detalhe.',
  },
];
const map =
  'https://www.google.com/maps/dir/?api=1&destination=Avenida+Riachuelo%2C+350%2C+Liberdade%2C+Resende%2C+RJ%2C+27521-171';
export default function Home() {
  return (
    <>
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>
      <main id="conteudo">
        <section
          className="hero section"
          id="inicio"
          aria-labelledby="hero-title"
        >
          <Header />
          <div className="hero-content container">
            <div className="hero-copy">
              <h1 id="hero-title">
                Mais bem-estar{' '}
                <span className="hero-second-line">começa com</span>{' '}
                <strong>boas escolhas.</strong>
              </h1>
              <p>
                Produtos selecionados com critério para cuidar, estimular e
                enriquecer a vida do seu pet.
              </p>
              <div className="hero-actions">
                <a className="button button-primary" href="#selecao">
                  Conheça nossa seleção
                  <Icon name="down" />
                </a>
                <a className="button button-outline" href="#loja">
                  Visite nossa loja
                  <Icon name="down" />
                </a>
              </div>
            </div>
            <HeroDog />
          </div>
        </section>
        <section
          className="section about"
          id="marca"
          aria-labelledby="about-title"
        >
          <div className="container about-grid">
            <div className="about-heading">
              <h2 id="about-title">
                Qualidade,
                <br />
                especialização
                <br />e <span>curadoria.</span>
              </h2>
              <img
                className="brand-seal"
                src="/images/selo-transparente.png"
                width="750"
                height="749"
                alt="Selo Nardini Select"
                loading="lazy"
              />
            </div>
            <div className="about-copy">
              <p>
                A Nardini Select Pet Shop é uma loja especializada em produtos
                selecionados para promover o bem-estar, o desenvolvimento
                comportamental e a qualidade de vida dos pets.
              </p>
              <p>
                Nossa proposta é oferecer uma curadoria criteriosa de produtos
                que combinam qualidade, segurança, funcionalidade e design,
                atendendo tanto tutores exigentes quanto profissionais do
                universo pet.
              </p>
            </div>
          </div>
        </section>
        <section
          className="section selection"
          id="selecao"
          aria-labelledby="selection-title"
        >
          <div className="container">
            <h2 id="selection-title">
              Uma curadoria.
              <br className="mobile-break" /> <span>Três compromissos.</span>
            </h2>
            <div className="pillars">
              {pillars.map((p) => (
                <article className="pillar" key={p.title}>
                  <div className="pillar-art">
                    <img
                      src={'/images/' + p.image}
                      width="1280"
                      height="1280"
                      alt=""
                      loading="lazy"
                    />
                  </div>
                  <h3>{p.title}</h3>
                  <p className="pillar-concept">{p.concept}</p>
                  <p className="pillar-message">{p.message}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section
          className="section location"
          id="loja"
          aria-labelledby="location-title"
        >
          <div className="container location-grid">
            <div className="location-copy">
              <h2 id="location-title">
                Estamos em
                <br />
                <span>Resende, RJ.</span>
              </h2>
              <p className="location-intro">
                Venha nos visitar e conhecer de perto nossa seleção de produtos.
              </p>
              <div className="address">
                <Icon name="pin" />
                <address>
                  <strong>Avenida Riachuelo, 350</strong>
                  <br />
                  Liberdade · Resende, RJ
                  <br />
                  <span>CEP 27521-171</span>
                </address>
              </div>
              <a
                className="button button-primary"
                href={map}
                target="_blank"
                rel="noopener noreferrer"
              >
                Como chegar
              </a>
            </div>
            <figure className="storefront">
              <img
                src="/images/loja-frente.jpg"
                width="900"
                height="1600"
                alt="Fachada da Nardini Select, com a identificação 350 e a marca nas portas de vidro"
                loading="lazy"
              />
            </figure>
          </div>
        </section>
        <section
          className="section contact"
          id="contato"
          aria-labelledby="contact-title"
        >
          <div className="container contact-content">
            <h2 id="contact-title">
              Vamos <span>conversar?</span>
            </h2>
            <div className="contact-columns">
              <div className="contact-option">
                <Icon name="whatsapp" className="social-icon" />
                <div>
                  <h3>Fale pelo WhatsApp</h3>
                  <p>
                    Tire suas dúvidas, receba orientações e fale com a nossa
                    equipe.
                  </p>
                  <a
                    className="button button-primary"
                    href="/contato/whatsapp"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Fale com a gente
                    <span className="sr-only">
                      {' '}
                      pelo WhatsApp, em uma nova aba
                    </span>
                  </a>
                </div>
              </div>
              <div className="contact-option">
                <Icon name="instagram" className="social-icon" />
                <div>
                  <h3>Acompanhe no Instagram</h3>
                  <p>
                    Conteúdo, novidades e um pouco da nossa rotina. Venha fazer
                    parte.
                  </p>
                  <a
                    className="button button-primary"
                    href="https://www.instagram.com/nardiniselect/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Siga @nardiniselect
                    <span className="sr-only">
                      {' '}
                      no Instagram, em uma nova aba
                    </span>
                  </a>
                </div>
              </div>
            </div>
            <footer className="footer">
              <a href="#inicio" aria-label="Voltar ao início">
                <img
                  src="/images/logo-horizontal.png"
                  alt="Nardini Select"
                  width="1938"
                  height="563"
                  loading="lazy"
                />
              </a>
              <p>Uma escolha com assinatura.</p>
              <span>Resende, RJ</span>
            </footer>
          </div>
        </section>
      </main>
    </>
  );
}
