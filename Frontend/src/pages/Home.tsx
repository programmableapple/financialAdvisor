import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Home = () => {
    return (
        <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
            {/* Left Column: Content */}
            <div className="flex-1 px-16 py-16 flex flex-col justify-center relative z-10">
                {/* Logo/Brand */}
                <div className="flex items-center gap-4 mb-24">
                    <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-sm font-light tracking-tight">
                        S|A
                    </div>
                    <span className="text-2xl font-normal tracking-tight">
                        Momentum Money
                    </span>
                </div>

                {/* Hero Text */}
                <div className="max-w-2xl">
                    <h1 className="display-lg mb-12">
                        Helping you make smart, confident Financial decisions.
                    </h1>

                    <div className="flex gap-6">
                        <Button asChild size="lg" className="h-12 px-10 text-base rounded-full">
                            <Link to="/register">
                                Get Started
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="h-12 px-10 text-base rounded-full">
                            <Link to="/login">
                                Log In
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Right Column: Hero Image */}
            <div className="flex-1 relative flex items-center pr-8">
                <div className="w-full h-[85vh] rounded-3xl overflow-hidden shadow-2xl">
                    <img
                        src="/hero-financial.png"
                        alt="Financial Analysis Dashboard"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Subtle decorative element */}
                <div className="absolute top-[10%] right-[5%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            </div>
        </div>
    );
};

export default Home;
