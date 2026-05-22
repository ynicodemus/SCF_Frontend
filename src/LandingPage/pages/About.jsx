import Navbar from '../NavBar';
import '../css/About.css';
import { FaHandsHelping, FaEye, FaBalanceScale, FaHeart, FaUsers } from "react-icons/fa";

function About() {
  return (
    <div className="LPAbout-bg">
      <Navbar />

      <section className="LPAbout-main">
        <div className="LPAbout-wrapper">

          {/* About Header */}
          <h2 className="LPAbout-title">About Us</h2>

          {/* Mission & Vision */}
          <div className="LPAbout-flex">
            <div className="LPAbout-box LPAbout-box-icon">
              <h3>Misyon</h3>
              <p>
                Para makabuo ng isang malakas at epektibong samahan na tutulong at makikipag-ugnayan
                sa DSWD-LGU-PSWDO at iba pang sangay ng pamahalaan para sa pagsusulong ng mga
                kapaki-pakinabang na programa para sa kapakanan ng mga nakatatanda. Maglingkod nang
                tapat at maayos upang maipatupad ang mga programang tumutugon sa pangangailangan ng
                mamamayan tungo sa kaunlaran.
              </p>
            </div>

            <div className="LPAbout-box LPAbout-box-icon">
              <h3>Pananaw</h3>
              <p>
                Bayan ng Sanaya—isang masagana at pinagpalang pamayanang may luntiang kapaligiran,
                mayamang karagatan, maunlad na turismo at kalakalan. Tinatamasa ng bawat mamamayang
                may pananalig sa Diyos, may dangal, pagkakaisa, at malusog na pangangatawan at isipan— 
                may silungan ng mga ulila at nakatatandang mamamayan upang maging huwaran ng mga 
                susunod na salinlahi.
              </p>
            </div>
          </div>

          {/* Federation Mandate / Legal Basis */}
          <div className="LPAbout-section">
            <FaBalanceScale className="LPAbout-icon-lg" />
            <h2>Federation Mandate / Legal Basis</h2>
            <p>
              Ang SeniorConnect Federation ay kumikilos alinsunod sa mga mandato ng Local Government 
              Unit (LGU) at ng Office for Senior Citizens Affairs (OSCA), at gabay ng mga pambansang 
              polisiya ng Department of Social Welfare and Development (DSWD). Ang samahan ay 
              nakabatay sa mga probisyon ng Expanded Senior Citizens Act (Republic Act 9994) upang 
              patuloy na maisulong ang karapatan, benepisyo, at aktibong partisipasyon ng mga 
              nakatatanda sa komunidad.
            </p>
          </div>

          {/* Core Values */}
          <div className="LPAbout-section">
            <h2>Core Values</h2>

            <div className="LPAbout-flex">
              <div className="LPAbout-box LPAbout-box-icon">
                <FaHeart className="LPAbout-icon" />
                <h3>Integridad</h3>
                <p>Matapat at tapat na paglilingkod sa bawat miyembro ng komunidad.</p>
              </div>

              <div className="LPAbout-box LPAbout-box-icon">
                <FaHandsHelping className="LPAbout-icon" />
                <h3>Paglilingkod</h3>
                <p>Prayoridad ang kapakanan, pangangailangan, at kaginhawaan ng mga nakatatanda.</p>
              </div>

              <div className="LPAbout-box LPAbout-box-icon">
                <FaUsers className="LPAbout-icon" />
                <h3>Pagkakaisa</h3>
                <p>Pagpapalakas ng samahan upang makamit ang mas malaking layunin para sa lahat.</p>
              </div>
            </div>
          </div>

          {/* Officers Section */}
          <div className="LPAbout-team">
            <h3 className="LPAbout-subtitle">Our Officers</h3>

            <div className="LPAbout-team-list">

              <div className="LPAbout-team-card">
                <img className="LPAbout-team-img" src="/images/officers/jessa.jpg" alt="Jessa Dela Cruz" />
                <h4>Jessa Dela Cruz</h4>
                <span>SCCF Head</span>
              </div>

              <div className="LPAbout-team-card">
                <img className="LPAbout-team-img" src="/images/officers/jec.jpg" alt="Jec Santos" />
                <h4>Jec Santos</h4>
                <span>Federation Head</span>
              </div>

              <div className="LPAbout-team-card">
                <img className="LPAbout-team-img" src="/images/officers/alexa.jpg" alt="Alexa Villanueva" />
                <h4>Alexa Villanueva</h4>
                <span>Damayan Head</span>
              </div>


            </div>
          </div>

          {/* Contact Info */}
          <div className="LPAbout-contact">
            <h3>Contact Us</h3>
            <p>You may reach us through the following contact information:</p>

            <div className="LPAbout-contact-methods">
              <div><b>Email:</b> seniorfederation@gmail.com</div>
              <div><b>Phone:</b> +63 912 345 6789</div>
              <div><b>Address:</b> Sariya, Quezon Province</div>
            </div>
          </div>

        </div>
      </section>

      <footer className="LPHome-footer">
        <div className="LPHome-footer-bottom">
          <p>© 2025 SeniorConnect. All rights reserved.</p>
          <p className="LPHome-privacy">
            We protect your data under the Data Privacy Act of 2012.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default About;
