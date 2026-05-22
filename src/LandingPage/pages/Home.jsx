import React, { useState, useEffect } from 'react';
import { FaHandsHelping, FaBalanceScale, FaHeart, FaUsers, FaBars, FaTimes } from 'react-icons/fa';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* NAVBAR */}
      <nav style={{
        position: 'fixed',
        width: '100%',
        zIndex: 1000,
        transition: 'all 0.3s',
        backgroundColor: scrolled ? 'white' : 'white',
        boxShadow: scrolled ? '0 4px 6px rgba(0,0,0,0.1)' : 'none',
        padding: scrolled ? '1rem 0' : '1.5rem 0'
      }}>
        <div style={{ 
          maxWidth: '1280px', 
          margin: '0 auto', 
          padding: isMobile ? '0 1rem' : '0 1.5rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>

      <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px'  
        }}>
          <img
            src="/images/logo.png"
            alt="SeniorConnect Logo"
            style={{
              width: isMobile ? "36px" : "42px",
              height: "auto",
            }}
          />
          <div style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 'bold' }}>
            <span style={{ color: scrolled ? '#1f2937' : '#1f2937' }}>Sariaya </span>
            <span style={{ color: '#2563eb' }}>SeniorConnect</span>
          </div>
      </div>    
          {/* Desktop Menu */}
          {!isMobile && (
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
              {['Home', 'Activities', 'About'].map(item => (
                <a 
                  key={item}
                  href={`#${item.toLowerCase()}`} 
                  style={{ 
                    color: scrolled ? '#374151' : '#374151',
                    fontWeight: '500',
                    textDecoration: 'none',
                    transition: 'color 0.3s'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#2563eb'}
                  onMouseLeave={(e) => e.target.style.color = scrolled ? '#374151' : '#374151'}
                >
                  {item}
                </a>
              ))}
              <a 
                href="/Account" 
                style={{
                  backgroundColor: '#2563eb',
                  color: 'white',
                  padding: '0.75rem 2rem',
                  borderRadius: '9999px',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
              >
                Join Now
              </a>
            </div>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                color: scrolled ? '#1f2937' : '#1f2937',
                cursor: 'pointer'
              }}
            >
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          )}
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobile && mobileMenuOpen && (
          <div style={{
            backgroundColor: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            padding: '1.5rem'
          }}>
            {['Home', 'Activities', 'About'].map(item => (
              <a 
                key={item}
                href={`#${item.toLowerCase()}`} 
                style={{
                  display: 'block',
                  color: '#374151',
                  padding: '1rem 0',
                  textDecoration: 'none',
                  fontWeight: '500',
                  borderBottom: '1px solid #e5e7eb'
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <a 
              href="/Account" 
              style={{
                display: 'block',
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '1rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontWeight: '500',
                textAlign: 'center',
                marginTop: '1rem'
              }}
            >
              Join Now
            </a>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section id="home" style={{
        position: 'relative',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url(/images/seniors-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.85) 0%, rgba(59, 130, 246, 0.75) 100%)'
        }} />
        
        <div style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          color: 'white',
          maxWidth: '900px',
          padding: isMobile ? '0 1.5rem' : '0 2rem'
        }}>
          <h4 style={{ 
            fontSize: isMobile ? '1rem' : '1.5rem', 
            fontWeight: '300', 
            marginBottom: '1rem',
            opacity: 0.95
          }}>
            Welcome to
          </h4>
          <h1 style={{ 
            fontSize: isMobile ? '2.5rem' : '4.5rem', 
            fontWeight: 'bold', 
            marginBottom: '1.5rem',
            lineHeight: '1.1'
          }}>
            Sariaya <span style={{ color: '#fbbf24' }}>SeniorConnect</span>
          </h1>
          <p style={{ 
            fontSize: isMobile ? '1.125rem' : '1.5rem', 
            marginBottom: '2.5rem',
            opacity: 0.95,
            fontWeight: '300'
          }}>
            Mas organisado. Mas konektado. Para sa samahan ng bawat senior.
          </p>
          <a 
            href="/Account" 
            style={{
              display: 'inline-block',
              backgroundColor: '#fbbf24',
              color: '#1f2937',
              padding: isMobile ? '1rem 2.5rem' : '1.25rem 3.5rem',
              borderRadius: '9999px',
              textDecoration: 'none',
              fontSize: isMobile ? '1rem' : '1.25rem',
              fontWeight: '600',
              transition: 'all 0.3s',
              boxShadow: '0 10px 30px rgba(251, 191, 36, 0.4)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = '0 15px 40px rgba(251, 191, 36, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 10px 30px rgba(251, 191, 36, 0.4)';
            }}
          >
            Maging Miyembro
          </a>
        </div>
      </section>

      {/* ACTIVITIES SECTION */}
      <section id="activities" style={{ padding: isMobile ? '3rem 0' : '6rem 0', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 1rem' : '0 1.5rem' }}>
          <h2 style={{ 
            fontSize: isMobile ? '2rem' : '3rem', 
            fontWeight: 'bold', 
            textAlign: 'center', 
            marginBottom: '1.5rem',
            color: '#1f2937'
          }}>
            Activities & Programs
          </h2>

          <p style={{ 
            textAlign: 'center', 
            maxWidth: '800px', 
            margin: isMobile ? '0 auto 2.5rem' : '0 auto 4rem',
            fontSize: isMobile ? '1rem' : '1.125rem',
            color: '#6b7280',
            lineHeight: '1.8'
          }}>
            Ang mga programa at aktibidad sa loob ng Federasyon ay naglalayong magbigay-suporta,  
            mag-ugnay, at magdiwang ng bawat senior citizen.  
            Alamin ang mga proyektong handog para sa inyong kapakanan at kasiyahan!
          </p>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: isMobile ? '1.5rem' : '2rem'
          }}>
            {[
              { img: '/images/anniversarry.jpg', title: 'Anniversary', desc: 'We honor couples in our community who reach major marriage milestones—celebrating love, partnership, and lifelong commitment.' },
              { img: '/images/celebration.jpg', title: 'Elderly Celebration', desc: 'Includes wellness checkups, counseling, home visits, and workshops on health, nutrition, and self-care—supporting mind and body.' },
              { img: '/images/assembly.jpg', title: 'General Assembly', desc: 'Our biggest yearly gathering—updates, recognitions, project planning, games, and strengthening friendships among members.' },
              { img: '/images/bday.png', title: 'Birthday Assistance', desc: 'SeniorConnect celebrates every member\'s birthday by providing small gifts, greetings, and financial tokens to honor our seniors\' special day.' },
              { img: '/images/tulong.jpg', title: 'Gilas Tulong', desc: 'Our emergency response program provides urgent assistance such as food packs, basic medical support, or transportation—ensuring help is always within reach.' },
              { img: '/images/contribution.jpg', title: 'Damayan (Optional)', desc: 'A mutual aid fund that offers financial and emotional support during sickness, bereavement, or major emergency needs.' }
            ].map((activity, idx) => (
              <article 
                key={idx}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '1rem',
                  overflow: 'hidden',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                  }
                }}
              >
                <div style={{
                  height: isMobile ? '200px' : '250px',
                  backgroundImage: `url('${activity.img}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }} />
                <div style={{ padding: isMobile ? '1.5rem' : '2rem' }}>
                  <h4 style={{ 
                    fontSize: isMobile ? '1.25rem' : '1.5rem', 
                    fontWeight: 'bold', 
                    marginBottom: '1rem',
                    color: '#1f2937'
                  }}>
                    {activity.title}
                  </h4>
                  <p style={{ color: '#6b7280', lineHeight: '1.7', fontSize: isMobile ? '0.95rem' : '1rem' }}>
                    {activity.desc}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" style={{ padding: isMobile ? '3rem 0' : '6rem 0', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 1rem' : '0 1.5rem' }}>
          <h2 style={{ 
            fontSize: isMobile ? '2rem' : '3rem', 
            fontWeight: 'bold', 
            textAlign: 'center', 
            marginBottom: isMobile ? '2.5rem' : '4rem',
            color: '#1f2937'
          }}>
            About Us
          </h2>

          {/* Mission & Vision */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: isMobile ? '1.5rem' : '2rem',
            marginBottom: isMobile ? '3rem' : '5rem'
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: isMobile ? '2rem' : '3rem',
              borderRadius: '1rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ 
                fontSize: isMobile ? '1.5rem' : '1.75rem', 
                fontWeight: 'bold', 
                marginBottom: '1.5rem',
                color: '#2563eb'
              }}>
                Misyon
              </h3>
              <p style={{ color: '#4b5563', lineHeight: '1.8', fontSize: isMobile ? '0.95rem' : '1.05rem' }}>
                Para makabuo ng isang malakas at epektibong samahan na tutulong at makikipag-ugnayan
                sa DSWD-LGU-PSWDO at iba pang sangay ng pamahalaan para sa pagsusulong ng mga
                kapaki-pakinabang na programa para sa kapakanan ng mga nakatatanda.
              </p>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: isMobile ? '2rem' : '3rem',
              borderRadius: '1rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ 
                fontSize: isMobile ? '1.5rem' : '1.75rem', 
                fontWeight: 'bold', 
                marginBottom: '1.5rem',
                color: '#2563eb'
              }}>
                Pananaw
              </h3>
              <p style={{ color: '#4b5563', lineHeight: '1.8', fontSize: isMobile ? '0.95rem' : '1.05rem' }}>
                Bayan ng Sariaya—isang masagana at pinagpalang pamayanan na may pagkakaisa at may
                malasakit sa mga nakatatanda.
              </p>
            </div>
          </div>

          {/* Mandate */}
          <div style={{
            backgroundColor: 'white',
            padding: isMobile ? '2rem' : '3rem',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            marginBottom: isMobile ? '3rem' : '5rem',
            textAlign: 'center'
          }}>
            <FaBalanceScale style={{ 
              fontSize: isMobile ? '2.5rem' : '3.5rem', 
              color: '#2563eb',
              marginBottom: '1.5rem'
            }} />
            <h2 style={{ 
              fontSize: isMobile ? '1.5rem' : '2rem', 
              fontWeight: 'bold', 
              marginBottom: '1.5rem',
              color: '#1f2937'
            }}>
              Federation Mandate / Legal Basis
            </h2>
            <p style={{ 
              color: '#4b5563', 
              lineHeight: '1.8', 
              fontSize: isMobile ? '0.95rem' : '1.05rem',
              maxWidth: '900px',
              margin: '0 auto'
            }}>
              Ang SeniorConnect Federation ay kumikilos alinsunod sa mandato ng LGU, OSCA,  
              at mga pambansang polisiya ng DSWD. Nakabatay ito sa Expanded Senior Citizens Act  
              (RA 9994) para maisulong ang karapatan, benepisyo, at partisipasyon ng mga nakatatanda.
            </p>
          </div>

          {/* Core Values */}
          <div style={{ marginBottom: isMobile ? '3rem' : '5rem' }}>
            <h2 style={{ 
              fontSize: isMobile ? '1.75rem' : '2.5rem', 
              fontWeight: 'bold', 
              textAlign: 'center', 
              marginBottom: isMobile ? '2rem' : '3rem',
              color: '#1f2937'
            }}>
              Core Values
            </h2>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: isMobile ? '1.5rem' : '2rem'
            }}>
              {[
                { icon: FaHeart, title: 'Integridad', desc: 'Matapat at tapat na paglilingkod sa bawat miyembro.' },
                { icon: FaHandsHelping, title: 'Paglilingkod', desc: 'Prayoridad ang pangangailangan ng nakatatanda.' },
                { icon: FaUsers, title: 'Pagkakaisa', desc: 'Pagpapalakas ng samahan para sa kabutihan ng lahat.' }
              ].map((value, idx) => {
                const Icon = value.icon;
                return (
                  <div 
                    key={idx}
                    style={{
                      backgroundColor: 'white',
                      padding: isMobile ? '2rem' : '2.5rem',
                      borderRadius: '1rem',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                      textAlign: 'center',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      if (!isMobile) {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.boxShadow = '0 15px 30px rgba(37, 99, 235, 0.2)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isMobile) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                      }
                    }}
                  >
                    <Icon style={{ 
                      fontSize: isMobile ? '2.5rem' : '3rem', 
                      color: '#2563eb',
                      marginBottom: '1.5rem'
                    }} />
                    <h3 style={{ 
                      fontSize: isMobile ? '1.25rem' : '1.5rem', 
                      fontWeight: 'bold', 
                      marginBottom: '1rem',
                      color: '#1f2937'
                    }}>
                      {value.title}
                    </h3>
                    <p style={{ color: '#6b7280', lineHeight: '1.7', fontSize: isMobile ? '0.95rem' : '1rem' }}>
                      {value.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Officers */}
          <div style={{ marginBottom: isMobile ? '3rem' : '5rem' }}>
            <h3 style={{ 
              fontSize: isMobile ? '1.75rem' : '2.5rem', 
              fontWeight: 'bold', 
              textAlign: 'center', 
              marginBottom: isMobile ? '2rem' : '3rem',
              color: '#1f2937'
            }}>
              Our Officers
            </h3>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: isMobile ? '2rem' : '3rem',
              maxWidth: '1000px',
              margin: '0 auto'
            }}>
              {[
                { img: '/images/officers/jessa.jpg', name: 'Jessa Dela Cruz', role: 'SCCF Head' },
                { img: '/images/officers/jec.jpg', name: 'Jec Santos', role: 'Federation Head' },
                { img: '/images/officers/alexa.jpg', name: 'Alexa Villanueva', role: 'Damayan Head' }
              ].map((officer, idx) => (
                <div 
                  key={idx}
                  style={{
                    textAlign: 'center',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => !isMobile && (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={(e) => !isMobile && (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <div style={{
                    width: isMobile ? '150px' : '180px',
                    height: isMobile ? '150px' : '180px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    margin: '0 auto 1.5rem',
                    border: '5px solid #2563eb',
                    boxShadow: '0 10px 30px rgba(37, 99, 235, 0.3)'
                  }}>
                    <img 
                      src={officer.img} 
                      alt={officer.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                  <h4 style={{ 
                    fontSize: isMobile ? '1.125rem' : '1.25rem', 
                    fontWeight: 'bold', 
                    marginBottom: '0.5rem',
                    color: '#1f2937'
                  }}>
                    {officer.name}
                  </h4>
                  <span style={{ 
                    color: '#2563eb',
                    fontWeight: '500',
                    fontSize: isMobile ? '0.95rem' : '1rem'
                  }}>
                    {officer.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div style={{
            backgroundColor: 'white',
            padding: isMobile ? '2rem' : '3rem',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ 
              fontSize: isMobile ? '1.5rem' : '2rem', 
              fontWeight: 'bold', 
              marginBottom: '1rem',
              color: '#1f2937'
            }}>
              Contact Us
            </h3>
            <p style={{ 
              color: '#6b7280', 
              marginBottom: '2rem',
              fontSize: isMobile ? '0.95rem' : '1.05rem'
            }}>
              You may reach us through:
            </p>

            <div style={{ 
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              flexWrap: 'wrap',
              gap: isMobile ? '1rem' : '2rem',
              justifyContent: 'center',
              fontSize: isMobile ? '0.95rem' : '1.05rem'
            }}>
              <div style={{ color: '#4b5563' }}>
                <b>Email:</b> seniorfederation@gmail.com
              </div>
              <div style={{ color: '#4b5563' }}>
                <b>Phone:</b> +63 912 345 6789
              </div>
              <div style={{ color: '#4b5563' }}>
                <b>Address:</b> Sariaya, Quezon Province
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        backgroundColor: '#1f2937',
        color: 'white',
        padding: isMobile ? '2rem 0' : '3rem 0',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 1rem' : '0 1.5rem' }}>
          <p style={{ marginBottom: '0.5rem', fontSize: isMobile ? '0.95rem' : '1.05rem' }}>
            © 2025 SeniorConnect. All rights reserved.
          </p>

          <p style={{ opacity: 0.7, fontSize: "0.85rem", marginTop: "0.5rem", lineHeight: "1.6" }}>
            Disclaimer: Ang Sariaya SeniorConnect ay para lamang sa mga senior citizen ng
            Sariaya, Quezon.
          </p>

          <p style={{ opacity: 0.8, fontSize: isMobile ? '0.875rem' : '1rem', marginTop: "0.5rem" }}>
            We protect your data under the Data Privacy Act of 2012.
          </p>
        </div>
      </footer>

    </div>
  );
}