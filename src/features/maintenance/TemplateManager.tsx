import { useState } from 'react';
import { Download, Upload, FileJson, Check, AlertCircle } from 'lucide-react';

export function TemplateManager() {
    const [jsonInput, setJsonInput] = useState('');
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleExport = () => {
        // In a real app, fetch current curriculum structure
        const template = {
            version: "1.0",
            created_at: new Date().toISOString(),
            curriculum: {
                id: "custom-curriculum",
                title: "My Custom Path",
                sections: []
            }
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(template, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "course_template.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleImport = () => {
        try {
            const parsed = JSON.parse(jsonInput);
            if (!parsed.curriculum) throw new Error("Invalid template format");

            // Logic to save to DB would go here
            console.log("Importing:", parsed);

            setStatus('success');
            setMessage('Template imported successfully!');
            setJsonInput('');
        } catch (e) {
            setStatus('error');
            setMessage('Invalid JSON format');
        }
    };

    return (
        <div className="p-6 bg-glass-surface border border-glass-border rounded-2xl space-y-6">
            <div>
                <h3 className="text-lg font-medium text-text-primary flex items-center gap-2">
                    <FileJson size={20} className="text-blue-500" /> Template Manager
                </h3>
                <p className="text-sm text-text-secondary mt-1">Import or export course structures.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Export */}
                <div className="p-4 rounded-xl bg-text-primary/5 border border-text-primary/10">
                    <h4 className="text-sm font-medium text-text-primary mb-2">Export Current</h4>
                    <p className="text-xs text-text-secondary mb-4">Download the current curriculum structure as a JSON template.</p>
                    <button
                        onClick={handleExport}
                        className="w-full py-2 flex items-center justify-center gap-2 bg-text-primary/10 hover:bg-text-primary/20 text-text-primary rounded-lg text-sm font-medium transition-colors"
                    >
                        <Download size={16} /> Download JSON
                    </button>
                </div>

                {/* Import */}
                <div className="p-4 rounded-xl bg-text-primary/5 border border-text-primary/10">
                    <h4 className="text-sm font-medium text-text-primary mb-2">Import Template</h4>
                    <textarea
                        value={jsonInput}
                        onChange={(e) => {
                            setJsonInput(e.target.value);
                            setStatus('idle');
                        }}
                        placeholder="Paste JSON template here..."
                        className="w-full h-24 bg-bg-void border border-glass-border rounded-lg p-2 text-xs font-mono text-text-primary placeholder:text-text-secondary resize-none focus:ring-1 focus:ring-blue-500 mb-3"
                    />
                    <button
                        onClick={handleImport}
                        disabled={!jsonInput}
                        className="w-full py-2 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Upload size={16} /> Import JSON
                    </button>

                    {status !== 'idle' && (
                        <div className={`mt-3 flex items-center gap-2 text-xs font-medium ${status === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                            {status === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
