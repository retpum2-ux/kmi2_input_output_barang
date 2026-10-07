/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HomePage } from './components/HomePage';
import { PengambilanPage } from './components/PengambilanPage';
import { KedatanganPage } from './components/KedatanganPage';
import { PengambilanFormData, KedatanganFormData } from './types';
import { submitFormData } from './services/api';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'pengambilan' | 'kedatangan'>('home');

  const handleSubmitForm = async (
    formData: PengambilanFormData | KedatanganFormData
  ): Promise<{ success: boolean; synced: boolean; message: string }> => {
    return await submitFormData(formData);
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans text-stone-900 antialiased selection:bg-blue-600 selection:text-white">
      {/* Main View Area */}
      <main className="w-full flex-1 flex flex-col items-center justify-center">
        {currentPage === 'home' && (
          <div className="w-full flex-1 flex items-center justify-center p-3 sm:p-6">
            <HomePage onNavigate={setCurrentPage} />
          </div>
        )}

        {currentPage === 'pengambilan' && (
          <div className="w-full flex-1 flex flex-col items-center justify-start">
            <PengambilanPage
              onBack={() => setCurrentPage('home')}
              onSubmit={handleSubmitForm}
            />
          </div>
        )}

        {currentPage === 'kedatangan' && (
          <div className="w-full flex-1 flex flex-col items-center justify-start">
            <KedatanganPage
              onBack={() => setCurrentPage('home')}
              onSubmit={handleSubmitForm}
            />
          </div>
        )}
      </main>
    </div>
  );
}
