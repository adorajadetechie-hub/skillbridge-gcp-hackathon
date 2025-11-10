import React, { useState, useCallback, useMemo } from 'react';
import { analyzeResume } from './services/geminiService';
import { AnalysisResult } from './types';
import LoadingSpinner from './components/LoadingSpinner';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_FILE_SIZE_MB = MAX_FILE_SIZE_BYTES / (1024 * 1024);

const allowedMimeTypes = [
  'application/pdf',
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'text/plain' // .txt
];

const getAcceptedExtensionsString = () => {
  return allowedMimeTypes
    .map(type => {
      if (type === 'application/pdf') return '.pdf';
      if (type === 'application/msword') return '.doc';
      if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return '.docx';
      if (type === 'text/plain') return '.txt';
      return '';
    })
    .filter(ext => ext !== '')
    .join(', ');
};

const acceptedExtensionsDisplay = getAcceptedExtensionsString();

const App: React.FC = () => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Compose a clean plain-text export for copy/download
  const analysisText = useMemo(() => {
    if (!analysisResult) return '';
    const lines: string[] = [];
    lines.push('=== SkillBridge — Analysis Results ===');
    lines.push('');
    lines.push(`Target Role: ${targetRole || '-'}`);
    if (resumeFile?.name) lines.push(`Resume File: ${resumeFile.name}`);
    lines.push('');
    lines.push('Career Gap Summary:');
    lines.push(analysisResult.gap_summary || '-');
    lines.push('');
    lines.push('Missing Skills:');
    if (analysisResult.missing_skills?.length) {
      analysisResult.missing_skills.forEach((s) => lines.push(`- ${s}`));
    } else {
      lines.push('-');
    }
    lines.push('');
    lines.push('Certifications:');
    if (analysisResult.certifications?.length) {
      analysisResult.certifications.forEach((c) => lines.push(`- ${c}`));
    } else {
      lines.push('-');
    }
    lines.push('');
    lines.push('Learning Resources:');
    if (analysisResult.learning_resources?.length) {
      analysisResult.learning_resources.forEach((r) => lines.push(`- ${r}`));
    } else {
      lines.push('-');
    }
    lines.push('');
    lines.push('======================================');
    return lines.join('\n');
  }, [analysisResult, targetRole, resumeFile]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      if (!allowedMimeTypes.includes(file.type)) {
        setError(`Unsupported file type. Please upload one of the following: ${acceptedExtensionsDisplay}.`);
        setResumeFile(null);
        event.target.value = ''; // Clear file input
        return;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError(`File size exceeds ${MAX_FILE_SIZE_MB}MB. Please upload a smaller file.`);
        setResumeFile(null);
        event.target.value = ''; // Clear file input
        return;
      }

      setResumeFile(file);
      setError(null);
    }
  }, []);

  const handleTargetRoleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setTargetRole(value);

    const trimmedValue = value.trim();
    if (!trimmedValue) {
      setError('Target role cannot be empty.');
    } else if (trimmedValue.length < 3) {
      setError('Target role must be at least 3 characters long.');
    } else if (!/^[a-zA-Z0-9\s.,\-/()&]*$/.test(trimmedValue)) {
      setError('Target role contains invalid characters. Only letters, numbers, spaces, and (., - / () &) are allowed.');
    } else {
      setError(null);
    }
  }, []);

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();

    // Re-validate all fields on submit
    if (!resumeFile) {
      setError('Please upload your resume.');
      return;
    }

    const trimmedTargetRole = targetRole.trim();
    if (!trimmedTargetRole) {
      setError('Please enter a target role.');
      return;
    }
    if (trimmedTargetRole.length < 3) {
      setError('Target role must be at least 3 characters long.');
      return;
    }
    if (!/^[a-zA-Z0-9\s.,\-/()&]*$/.test(trimmedTargetRole)) {
      setError('Target role contains invalid characters. Only letters, numbers, spaces, and (., - / () &) are allowed.');
      return;
    }

    if (error) return;

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target && e.target.result) {
        try {
          const base64Content = (e.target.result as string).split(',')[1]; // strip data:...;base64,
          const result = await analyzeResume(base64Content, resumeFile.type, trimmedTargetRole);
          setAnalysisResult(result);
        } catch (err: any) {
          console.error('Analysis failed:', err);
          setError(err?.message || 'An unexpected error occurred during analysis.');
        } finally {
          setIsLoading(false);
        }
      }
    };
    reader.onerror = () => {
      setIsLoading(false);
      setError('Failed to read resume file.');
    };
    reader.readAsDataURL(resumeFile);
  }, [resumeFile, targetRole, error]);

  // Copy, Download, Reset actions
  const copyToClipboard = useCallback(async () => {
    if (!analysisText) return;
    try {
      await navigator.clipboard.writeText(analysisText);
      alert('Analysis copied to clipboard.');
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = analysisText;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        alert('Analysis copied to clipboard.');
      } finally {
        document.body.removeChild(ta);
      }
    }
  }, [analysisText]);

  const downloadTxt = useCallback(() => {
    if (!analysisText) return;
    const blob = new Blob([analysisText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeRole = (targetRole || 'role').replace(/\s+/g, '-').toLowerCase();
    a.href = url;
    a.download = `skillbridge-analysis-${safeRole}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [analysisText, targetRole]);

  const resetAll = useCallback(() => {
    setResumeFile(null);
    setTargetRole('');
    setAnalysisResult(null);
    setError(null);
    setIsLoading(false);
    // Also clear the file input DOM value (best effort)
    const input = document.getElementById('resume-upload') as HTMLInputElement | null;
    if (input) input.value = '';
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-stone-900 py-4 px-8 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto flex flex-col items-center text-center">
          <h1 className="text-2xl font-bold text-stone-100 mb-2">
            <span className="text-amber-400">Skillbridge</span> - Resume Gap Analyzer
          </h1>
          <p className="text-stone-300 text-sm italic">Bridge Your Career Gaps</p>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-8 flex flex-col items-center justify-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-stone-100 mb-8 text-center sr-only">
          Skillbridge - Resume Gap Analyzer
        </h1>

        <form onSubmit={handleSubmit} className="bg-stone-800 p-6 md:p-10 rounded-lg shadow-xl w-full max-w-2xl space-y-6">
          <div>
            <label htmlFor="target-role" className="block text-amber-300 text-lg font-semibold mb-2">
              Target Role
            </label>
            <input
              type="text"
              id="target-role"
              value={targetRole}
              onChange={handleTargetRoleChange}
              placeholder="e.g., Senior Frontend Engineer, Data Scientist, Pediatrician"
              className="w-full max-w-md mx-auto px-4 py-3 rounded-md bg-stone-700 text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              maxLength={50}
            />
          </div>

          <div>
            <label htmlFor="resume-upload" className="block text-amber-300 text-lg font-semibold mb-2">
              Upload Your Resume
            </label>
            <input
              type="file"
              id="resume-upload"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              className="block w-full text-sm text-stone-300
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-amber-500 file:text-white
                hover:file:bg-amber-600
                cursor-pointer"
            />
            <p className="mt-2 text-sm text-stone-400">
              Accepted formats: {acceptedExtensionsDisplay}. Max size: {MAX_FILE_SIZE_MB}MB.
            </p>
            {resumeFile && (
              <p className="mt-2 text-sm text-stone-400">
                Selected file: <span className="font-medium text-stone-200">{resumeFile.name}</span>
              </p>
            )}
          </div>

          {error && (
            <p className="text-red-400 text-sm md:text-base text-center bg-red-900/40 p-3 rounded-md border border-red-600">
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !resumeFile || !targetRole.trim() || error !== null}
              aria-live="polite"
              aria-busy={isLoading}
            >
              {isLoading ? 'Analyzing...' : 'Start Analysis'}
            </button>

            <button
              type="button"
              onClick={resetAll}
              className="w-full bg-transparent border border-stone-500 text-stone-100 hover:bg-stone-700 font-bold py-3 px-4 rounded-md transition duration-300"
            >
              Reset
            </button>
          </div>
        </form>

        {isLoading && <LoadingSpinner />}

        {analysisResult && (
          <div className="mt-12 bg-stone-800 p-6 md:p-10 rounded-lg shadow-xl w-full max-w-2xl space-y-8 animate-fade-in">
            <h2 className="text-3xl font-bold text-stone-100 mb-6 text-center">Analysis Results</h2>

            <div>
              <h3 className="text-2xl font-semibold text-amber-300 mb-3">Gap Summary</h3>
              <p className="text-stone-200 leading-relaxed bg-stone-700 p-4 rounded-md">
                {analysisResult.gap_summary}
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-amber-300 mb-3">Missing Skills</h3>
              {analysisResult.missing_skills.length > 0 ? (
                <ul className="list-disc list-inside text-stone-200 space-y-1 bg-stone-700 p-4 rounded-md">
                  {analysisResult.missing_skills.map((skill, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2 text-amber-400">•</span>
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-stone-400 italic bg-stone-700 p-4 rounded-md">
                  No significant missing skills identified.
                </p>
              )}
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-amber-300 mb-3">Certifications</h3>
              {analysisResult.certifications.length > 0 ? (
                <ul className="list-disc list-inside text-stone-200 space-y-1 bg-stone-700 p-4 rounded-md">
                  {analysisResult.certifications.map((cert, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2 text-amber-400">•</span>
                      <span>{cert}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-stone-400 italic bg-stone-700 p-4 rounded-md">
                  No specific certifications suggested at this time.
                </p>
              )}
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-amber-300 mb-3">Learning Resources</h3>
              {analysisResult.learning_resources.length > 0 ? (
                <ul className="list-disc list-inside text-stone-200 space-y-2 bg-stone-700 p-4 rounded-md">
                  {analysisResult.learning_resources.map((resource, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2 text-amber-400">•</span>
                      {resource.startsWith('http://') || resource.startsWith('https://') ? (
                        <a
                          href={resource}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-400 hover:text-orange-300 underline break-all"
                        >
                          {resource}
                        </a>
                      ) : (
                        <span>{resource}</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-stone-400 italic bg-stone-700 p-4 rounded-md">
                  No specific learning resources suggested.
                </p>
              )}
            </div>

            {/* Actions: Copy & Download */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={copyToClipboard}
                className="w-full bg-stone-700 hover:bg-stone-600 text-stone-100 font-bold py-3 px-4 rounded-md transition duration-300"
                title="Copy analysis to clipboard"
              >
                Copy Result
              </button>
              <button
                type="button"
                onClick={downloadTxt}
                className="w-full bg-stone-700 hover:bg-stone-600 text-stone-100 font-bold py-3 px-4 rounded-md transition duration-300"
                title="Download analysis as .txt"
              >
                Download .txt
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-stone-900 py-4 text-center text-sm text-stone-400 mt-auto">
        <div className="container mx-auto">
          &copy; {currentYear} Skillbridge. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default App;