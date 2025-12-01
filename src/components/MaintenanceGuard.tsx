import { ReactNode, useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';


interface MaintenanceGuardProps {
    children: ReactNode;
}

export function MaintenanceGuard({ children }: MaintenanceGuardProps) {
    const [isMaintenance, setIsMaintenance] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkMaintenance = async () => {
            try {
                // In a real app, we'd query a 'system_settings' table
                // For now, we'll just check a hardcoded value or a mock query
                // const { data } = await supabase.from('system_settings').select('value').eq('key', 'maintenance_mode').single();
                // setIsMaintenance(data?.value === 'true');

                // Mock: Always false for now unless manually changed
                setIsMaintenance(false);
            } catch (e) {
                console.error("Error checking maintenance mode", e);
            } finally {
                setLoading(false);
            }
        };
        checkMaintenance();
    }, []);

    if (loading) return null; // Or a spinner

    if (isMaintenance) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-bg-void text-text-primary p-6 text-center">
                <div className="p-4 bg-yellow-500/10 rounded-full mb-6 text-yellow-500 animate-pulse">
                    <ShieldAlert size={48} />
                </div>
                <h1 className="text-3xl font-display font-bold mb-2">System Maintenance</h1>
                <p className="text-text-secondary max-w-md">
                    We are currently performing scheduled upgrades to improve your experience.
                    Please check back in a few minutes.
                </p>
            </div>
        );
    }

    return <>{children}</>;
}
