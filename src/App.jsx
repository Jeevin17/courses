import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { OSSUProvider } from './hooks/useOSSUStore';
import Layout from './components/Layout';
import Footer from './components/Footer';
import { Loader2 } from 'lucide-react';

// Lazy load factories
const loadDashboard = () => import('./pages/Dashboard');
const loadCourseList = () => import('./pages/CourseList');
const loadCourseDetail = () => import('./pages/CourseDetail');
const loadStudyMode = () => import('./pages/StudyMode');
const loadGraphView = () => import('./pages/GraphView');
const loadTerms = () => import('./pages/Terms');
const loadCredits = () => import('./pages/Credits');

// Lazy components
const Dashboard = lazy(loadDashboard);
const CourseList = lazy(loadCourseList);
const CourseDetail = lazy(loadCourseDetail);
const StudyMode = lazy(loadStudyMode);
const GraphView = lazy(loadGraphView);
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
        <OSSUProvider>
            <Router>
                <RoutePrefetcher />
                <Layout>
                    <div className="flex flex-col min-h-screen">
                        <Suspense fallback={<PageLoader />}>
                            <Routes>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/courses" element={<CourseList />} />
                                <Route path="/courses/:curriculumId" element={<CourseList />} />
                                <Route path="/course/:courseId" element={<CourseDetail />} />
                                <Route path="/study" element={<StudyMode />} />
                                <Route path="/graph" element={<GraphView />} />
                                <Route path="/terms" element={<Terms />} />
                                <Route path="/credits" element={<Credits />} />
                            </Routes>
                        </Suspense>
                        <Footer />
                    </div>
                </Layout>
            </Router>
        </OSSUProvider>
    );
}

export default App;
