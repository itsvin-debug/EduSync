import './bootstrap';
import '../css/app.css';

import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('React Render Crash:', error, errorInfo);
        this.setState({ errorInfo });
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', fontFamily: 'system-ui, -apple-system, sans-serif', background: '#FEF2F2', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ maxWidth: '640px', width: '100%', background: '#FFF', padding: '2rem', borderRadius: '1rem', border: '1px solid #FECACA', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold' }}>!</div>
                            <div>
                                <h2 style={{ color: '#991B1B', margin: 0, fontSize: '1.25rem' }}>Terjadi Kendala Tampilan Halaman</h2>
                                <p style={{ color: '#6B7280', margin: '0.25rem 0 0', fontSize: '0.875rem' }}>Detail error telah dicatat ke console browser.</p>
                            </div>
                        </div>
                        <div style={{ background: '#FFF1F2', border: '1px solid #FFE4E6', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                            <p style={{ color: '#BE123C', margin: 0, fontWeight: 600, fontSize: '0.875rem' }}>{String(this.state.error?.message || this.state.error)}</p>
                        </div>
                        <button onClick={() => window.location.reload()} style={{ background: '#0F172A', color: '#FFF', border: 'none', padding: '0.625rem 1.25rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                            Muat Ulang Halaman
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

createInertiaApp({
    title: (title) => (title ? `${title} - EDUSYNC` : 'EDUSYNC - Sistem Penjadwalan & Akademik SMK'),
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });
        const page = pages[`./Pages/${name}.jsx`];
        if (!page) {
            console.error(`Page component ./Pages/${name}.jsx not found in available pages`);
            throw new Error(`Page component ./Pages/${name}.jsx not found`);
        }
        return page.default || page;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <ErrorBoundary>
                <App {...props} />
            </ErrorBoundary>
        );
    },
    progress: {
        color: '#4F46E5',
    },
});
