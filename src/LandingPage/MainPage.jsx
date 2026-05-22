import Navbar from './NavBar';


function MainPage() {
  return (
    <div className="landing-container">
      <Navbar />

      <header className="hero">
        <h1>Welcome to SeniorConnect</h1>
        <p>Connect generations through meaningful experiences.</p>
        <a href="/about" className="cta-button">Learn More</a>
      </header>

      <section className="features">
        <div className="feature">
          <h2>🤝 Community Engagement</h2>
          <p>Bridge the gap between youth and seniors through shared activities.</p>
        </div>
        <div className="feature">
          <h2>📅 Easy Scheduling</h2>
          <p>Plan events and meetings with just a few clicks.</p>
        </div>
        <div className="feature">
          <h2>🔒 Safe & Secure</h2>
          <p>We prioritize the privacy and safety of every user.</p>
        </div>
      </section>

      <footer className="footer">
        <p>© {new Date().getFullYear()} SeniorConnect. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default MainPage;
