import {
  FaDiscord,
  FaTelegram,
  FaTwitter,
  FaFacebook,
  FaInstagram,
} from 'react-icons/fa';

const Footer = () => (
  <div className="footer">
    <div className="footer-container">
      <div className="footer-left">
        <p>I like it</p>
        <p className="reach-out">Share!</p>
        <div className="contact-logo">
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fworkerlytics.iex.ec%2F&amp;src=sdkpreparse"
          >
            <FaFacebook />
          </a>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://twitter.com/intent/tweet?text=Watch%20iExec%20Workerpools%20metrics%20at%3A%20https%3A//workerlytics.iex.ec"
          >
            <FaTwitter />
          </a>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.instagram.com/iexec_team/?hl=en"
          >
            <FaInstagram />
          </a>
        </div>
      </div>
      <div className="footer-middle">
        <div className="powered-by-div">
          <p>Powered By</p>
        </div>
        <div className="white-logo"></div>
        <div className="all-rights-div">
          <a href="https://iex.ec">https://iex.ec</a>
          <p>All rights reserved {new Date().getFullYear()}</p>
        </div>
      </div>
      <div className="footer-right">
        <p>Wants to say Hi?</p>
        <p className="reach-out">Reach out</p>
        <div className="contact-logo">
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://discord.gg/pbt9m98wnU"
          >
            <FaDiscord />
          </a>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://t.me/iexec_rlc_official"
          >
            <FaTelegram />
          </a>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://twitter.com/iEx_ec"
          >
            <FaTwitter />
          </a>
        </div>
      </div>
    </div>
  </div>
);

export default Footer;
