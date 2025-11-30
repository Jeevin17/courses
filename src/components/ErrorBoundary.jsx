import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error("Uncaught error:", error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-[#e5e5e5] p-6">
                    <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center backdrop-blur-xl shadow-2xl">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>

                        <h1 className="text-2xl font-bold mb-3">Something went wrong</h1>
                        <p className="text-white/60 mb-8">
                            We're sorry, but the application encountered an unexpected error.
                        </p>

                        <div className="space-y-4">
                            <button
                                onClick={this.handleReload}
                                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <RefreshCw size={18} />
                                Reload Application
                            </button>

                            <button
                                onClick={() => this.setState({ hasError: false })}
                                className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-white/80 rounded-xl font-medium transition-colors"
                            >
                                Try to Recover
                            </button>
                        </div>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mt-8 text-left">
                                <div className="text-xs font-mono bg-black/50 p-4 rounded-lg overflow-auto max-h-48 text-red-400 border border-red-500/20">
                                    {this.state.error.toString()}
                                    <br />
                                    {this.state.errorInfo.componentStack}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
