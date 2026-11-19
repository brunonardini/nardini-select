import Image from 'next/image';
import { BrandLogo } from '../components/brand-logo/brand-logo';
import { Button } from '../components/button/button';
import { Icon } from '../components/icon/icon';
import { SiteHeader } from '../components/site-header/site-header';
const pillars = [
  {
    title: 'Seleção Criteriosa',
    image: 'pilar-selecao.png',
    concept:
      'Qualidade, procedência, segurança e benefícios reais para o seu cão.',
    message: 'Escolhas melhores também são cuidado.',
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
      <SiteHeader />
      <main id="conteudo">
        <section
          className="hero section"
          id="inicio"
          aria-labelledby="hero-title"
        >
          <div className="hero-copy">
            <h1 id="hero-title">
              Mais bem-estar começa com <strong>boas escolhas.</strong>
            </h1>
            <p>
              Produtos selecionados com critério para cuidar, estimular e
              enriquecer a vida do seu cão.
            </p>
            <div className="hero-actions">
              <Button href="#selecao" trailingIcon={<Icon name="down" />}>
                Conheça nossa seleção
              </Button>
              <Button
                variant="outline"
                href="#loja"
                trailingIcon={<Icon name="down" />}
              >
                Visite nossa loja
              </Button>
            </div>
          </div>
          <div className="hero-panel">
            <svg
              className="hero-monogram"
              viewBox="0 0 222 182"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M0 0H65L222 182H157L65 66V182H0Z" fill="var(--cafe)" />
              <path d="M152 0H222V182L152 101Z" fill="var(--terracota)" />
            </svg>
            <Image
              className="hero-dog"
              src="/images/hero-weimaraner-transparente.png"
              width={1507}
              height={1044}
              // Hidden at 760px and below, so request the smallest variant there.
              sizes="(max-width: 760px) 1px, 50vw"
              alt="Weimaraner cinza prateado, o cão que inspira a identidade da Nardini Select"
              fetchPriority="high"
              loading="eager"
            />
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
              <Image
                className="brand-seal"
                src="/images/selo.png"
                width={750}
                height={749}
                sizes="(max-width: 1100px) 25vw, 260px"
                alt="Selo Nardini Select"
              />
            </div>
            <div className="about-copy">
              <p>
                A Nardini Select é uma loja especializada em produtos
                selecionados para promover o bem-estar, o desenvolvimento
                comportamental e a qualidade de vida dos cães.
              </p>
              <p>
                Nossa proposta é oferecer uma curadoria criteriosa de produtos
                que combinam qualidade, segurança, funcionalidade e design,
                atendendo tanto tutores exigentes quanto profissionais que
                trabalham com cães.
              </p>
              <p className="about-motto">Mais seleção. Menos convencional.</p>
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
                    <Image
                      src={'/images/' + p.image}
                      width={1280}
                      height={1280}
                      sizes="(max-width: 760px) 125px, (max-width: 1100px) 33vw, 380px"
                      alt=""
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
          <div className="location-grid">
            <div className="location-copy">
              <h2 id="location-title">
                Estamos em
                <br />
                Resende, RJ.
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
              <Button href={map} target="_blank" rel="noopener noreferrer">
                Como chegar
                <span className="sr-only">
                  {' '}
                  no Google Maps, em uma nova aba
                </span>
              </Button>
            </div>
            <figure className="storefront">
              <Image
                src="/images/loja-frente.jpg"
                width={941}
                height={1672}
                sizes="(max-width: 760px) 100vw, 50vw"
                alt="Fachada da Nardini Select, com a identificação 350 e a marca nas portas de vidro"
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
                    Tire suas dúvidas, receba orientação na escolha e fale com a
                    nossa equipe.
                  </p>
                  <Button
                    href="/contato/whatsapp"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Fale com a gente
                    <span className="sr-only">
                      {' '}
                      pelo WhatsApp, em uma nova aba
                    </span>
                  </Button>
                </div>
              </div>
              <div className="contact-option">
                <Icon name="instagram" className="social-icon" />
                <div>
                  <h3>Acompanhe no Instagram</h3>
                  <p>
                    Novidades da seleção e um pouco da nossa rotina. Venha fazer
                    parte.
                  </p>
                  <Button
                    href="https://www.instagram.com/nardiniselect/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Siga @nardiniselect
                    <span className="sr-only">
                      {' '}
                      no Instagram, em uma nova aba
                    </span>
                  </Button>
                </div>
              </div>
            </div>
            <footer className="footer">
              <BrandLogo label="Voltar ao início" sizes="200px" />
              <p>Uma escolha com assinatura.</p>
              <span>Curadoria especializada para cães · Resende, RJ</span>
            </footer>
          </div>
        </section>
      </main>
    </>
  );
}
