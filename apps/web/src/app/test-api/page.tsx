'use client';

import { useState } from 'react';

export default function TestAPIPage() {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/test-api/diagnostics');
      const data = await res.json();
      setDiagnostics(data);
    } catch (error: any) {
      setDiagnostics({ error: error.message });
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        padding: '40px',
        maxWidth: '800px',
        margin: '0 auto',
        fontFamily: 'monospace',
      }}
    >
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>
        Story 2.1 - Diagnostics
      </h1>

      <button
        onClick={runDiagnostics}
        disabled={loading}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          backgroundColor: loading ? '#ccc' : '#6366f1',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '20px',
        }}
      >
        {loading ? 'Running...' : 'Run Diagnostics'}
      </button>

      {diagnostics && (
        <div
          style={{
            backgroundColor: '#f9fafb',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
          }}
        >
          <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Results:</h2>
          <pre
            style={{
              fontSize: '12px',
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
            }}
          >
            {JSON.stringify(diagnostics, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
