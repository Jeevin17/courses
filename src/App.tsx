import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { OSSUProvider } from './hooks/useOSSUStore';
import Layout from './components/Layout';
import Footer from './components/Footer';
import { Loader2 } from 'lucide-react';
import { MaintenanceGuard } from './components/MaintenanceGuard';

// Lazy load factories
const loadDashboard = () => import('./pages/Dashboard');
const loadCourseList = () => import('./pages/CourseList');
const loadCourseDetail = () => import('./pages/CourseDetail');
const loadStudyMode = () => import('./pages/StudyMode');
const loadGraphView = () => import('./pages/GraphView');
const loadTerms = () => import('./pages/Terms');
const loadCredits = () => import('./pages/Credits');
const loadAnalytics = () => import('./pages/Analytics');

// Lazy components
const Dashboard = lazy(loadDashboard);
const CourseList = lazy(loadCourseList);
const CourseDetail = lazy(loadCourseDetail);
const StudyMode = lazy(loadStudyMode);
const GraphView = lazy(loadGraphView);
const Analytics = lazy(loadAnalytics);
const Planner = lazy(() => import('./pages/Planner'));
const Settings = lazy(() => import('./pages/Settings'));
const Admin = lazy(() => import('./pages/AdminDashboard'));
const Terms = lazy(loadTerms);
const Credits = lazy(loadCredits);

// Prefetcher Component
const RoutePrefetcher = () => {
    useEffect(() => {
        // Prefetch routes after initial load to ensure instant navigation
        const prefetch = async () => {
            try {
                // Wait a bit for main thread to settle
                await new Promise(resolve => setTimeout(resolve, 2000));
                loadCourseList();
                await new Promise(resolve => setTimeout(resolve, 1000));
                loadCourseDetail();
                loadStudyMode();
                loadGraphView();
                loadTerms();
                loadCredits();
                loadAnalytics();
            } catch (e) {
                console.error("Prefetch error", e);
            }
        };
        prefetch();
    }, []);
    return null;
};

// Loading Fallback
const PageLoader = () => (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-[var(--text-secondary)]">
        <Loader2 size={40} className="animate-spin mb-4 text-blue-500" />
        <p>Loading...</p>
    </div>
);

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <OSSUProvider>
                <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <RoutePrefetcher />
                    <MaintenanceGuard>
                        <Layout>
                            <div className="flex flex-col min-h-screen">
                                <Suspense fallback={<PageLoader />}>
                                    <Routes>
                                        <Route path="/" element={<Dashboard />} />
                                        <Route path="/courses" element={<CourseList />} />
                                        <Route path="/courses/:curriculumId" element={<CourseList />} />
                                        <Route path="/course/:courseId" element={<CourseDetail />} />
                                        <Route path="/planner" element={<Planner />} />
                                        <Route path="/study" element={<StudyMode />} />
                                        <Route path="/graph" element={<GraphView />} />
                                        <Route path="/analytics" element={<Analytics />} />
                                        <Route path="/settings" element={<Settings />} />
                                        <Route path="/admin" element={<Admin />} />
                                        <Route path="/terms" element={<Terms />} />
                                        <Route path="/credits" element={<Credits />} />
                                    </Routes>
                                </Suspense>
                                <Footer />
                            </div>
                        </Layout>
                    </MaintenanceGuard>
                </Router>
            </OSSUProvider>
        </QueryClientProvider>
    );
}

export default App;
