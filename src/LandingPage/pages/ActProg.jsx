import Navbar from '../NavBar';
import '../css/actprog.css';

function ActProg() {
  return (
    <div className="LPAct-container">
      <Navbar />

      {/* Main Content */}
      <section className="LPAct-main">
        <h2>Activities & Programs</h2>

        <p className="LPAct-desc">
          Ang mga programa at aktibidad sa loob ng Federasyon ay naglalayong magbigay-suporta, mag-ugnay, at magdiwang ng bawat senior citizen. 
          Alamin ang mga proyektong handog para sa inyong kapakanan at kasiyahan!
        </p>

        <div className="LPAct-grid">

        <div className="LPAct-card">
            <div className="LPAct-img"
              style={{ backgroundImage: `url('/images/anniversarry.jpg')` }}
              role="img"
              aria-label="Damayan">
            </div>
            <h4>Anniversary</h4>
            <span>
              We honor couples in our community who reach major marriage milestones—celebrating love,
              partnership, and lifelong commitment.
            </span>
          </div>

          <div className="LPAct-card">
            <div className="LPAct-img"
              style={{ backgroundImage: `url('/images/celebration.jpg')` }}
              role="img"
              aria-label="Elderly Celebration"></div>

            <h4>Elderly Celebration</h4>
            <span>
              Includes wellness checkups, counseling, home visits, and workshops on health, nutrition,
              and self-care—supporting mind and body.
            </span>
          </div>

          <div className="LPAct-card">
            <div className="LPAct-img"
              style={{ backgroundImage: `url('/images/assembly.jpg')` }}
              role="img"
              aria-label="General Assembly"></div>
            <h4>General Assembly</h4>
            <span>
              Our biggest yearly gathering—updates, recognitions, project planning, games, and
              strengthening friendships among members.
            </span>
          </div>
          
          <div className="LPAct-card">
            <div
              className="LPAct-img"
              style={{ backgroundImage: `url('/images/bday.png')` }}
              role="img"
              aria-label="Birthday celebration"
            ></div>

            <h4>Birthday Assistance</h4>
            <span>
              SeniorConnect celebrates every member’s birthday by providing small gifts, greetings,
              and financial tokens to honor our seniors’ special day.
            </span>
          </div>

          <div className="LPAct-card">
            <div className="LPAct-img"
              style={{ backgroundImage: `url('/images/tulong.jpg')` }}
              role="img"
              aria-label="Gilas Tulong"></div>
            <h4>Gilas Tulong</h4>
            <span>
              Our emergency response program provides urgent assistance such as food packs, basic
              medical support, or transportation—ensuring help is always within reach.
            </span>
          </div>

          <div className="LPAct-card">
            <div className="LPAct-img"
                style={{ backgroundImage: `url('/images/contribution.jpg')` }}
                role="img"
                aria-label="Damayan"></div>
            <h4>Damayan (Optional)</h4>
            <span>
              A mutual aid fund that offers financial and emotional support during sickness,
              bereavement, or major emergency needs.
            </span>
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

export default ActProg;
