import { FaLink } from 'react-icons/fa';
import Logo from './logo.svg';

const Header = () => (
  <div className="header">
    <div className="header-inner-container">
      <div className="header-container">
        <div className="header-left">
          <img className="logo" src={Logo} alt="iExec logo" />
        </div>
        <div className="header-middle">
          <p>
            Worker<span>lytics</span>
          </p>
        </div>
        <div className="header-right">
          <div className="chain-badge">
            <div className="header-chain-logo-div">
              <FaLink className="header-chain-logo" />
            </div>
            <p className="sidechain-text">iExec Chain</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Header;
