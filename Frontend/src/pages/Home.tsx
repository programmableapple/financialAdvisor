import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#000',
            color: '#fff',
            display: 'flex',
            fontFamily: '"Inter", sans-serif',
            overflow: 'hidden'
        }}>
            {/* Left Column: Content */}
            <div style={{
                flex: 1,
                padding: '4rem 6rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 2
            }}>
                {/* Logo/Brand */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '6rem'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        border: '1px solid rgba(255,255,255,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.9rem',
                        fontWeight: 300,
                        letterSpacing: '1px'
                    }}>
                        S|A
                    </div>
                    <span style={{
                        fontSize: '1.5rem',
                        fontWeight: 400,
                        letterSpacing: '-0.02em'
                    }}>
                        Momentum Money
                    </span>
                </div>

                {/* Hero Text */}
                <div style={{ maxWidth: '600px' }}>
                    <h1 style={{
                        fontSize: '4.5rem',
                        fontWeight: 500,
                        lineHeight: 1.1,
                        marginBottom: '3rem',
                        letterSpacing: '-0.03em'
                    }}>
                        Helping you make smart, confident Financial decisions.
                    </h1>

                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <Link to="/register" style={{
                            padding: '1rem 2.5rem',
                            backgroundColor: '#fff',
                            color: '#000',
                            borderRadius: '100px',
                            textDecoration: 'none',
                            fontWeight: 600,
                            fontSize: '1.1rem',
                            transition: 'all 0.3s ease'
                        }}
                            onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                            onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                        >
                            Get Started
                        </Link>
                        <Link to="/login" style={{
                            padding: '1rem 2.5rem',
                            backgroundColor: 'transparent',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.3)',
                            borderRadius: '100px',
                            textDecoration: 'none',
                            fontWeight: 600,
                            fontSize: '1.1rem',
                            transition: 'all 0.3s ease'
                        }}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)')}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                            Log In
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right Column: Hero Image */}
            <div style={{
                flex: 1,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                paddingRight: '2rem'
            }}>
                <div style={{
                    width: '100%',
                    height: '85vh',
                    borderRadius: '1.5rem',
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}>
                    <img
                        src="/hero-financial.png"
                        alt="Financial Analysis"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                    />
                </div>

                {/* Subtle decorative element */}
                <div style={{
                    position: 'absolute',
                    top: '10%',
                    right: '5%',
                    width: '400px',
                    height: '400px',
                    background: 'radial-gradient(circle, rgba(122, 162, 247, 0.15) 0%, rgba(0,0,0,0) 70%)',
                    filter: 'blur(40px)',
                    zIndex: 1
                }} />
            </div>
        </div>
    );
};

export default Home;
