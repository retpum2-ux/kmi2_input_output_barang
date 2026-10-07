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
      <main className="w-full flex-1 flex flex-col">
        {currentPage === 'home' && (
          <div className="flex-1 flex items-center justify-center">
            <HomePage onNavigate={setCurrentPage} />
          </div>
        )}

        {currentPage === 'pengambilan' && (
          <PengambilanPage
            onBack={() => setCurrentPage('home')}
            onSubmit={handleSubmitForm}
          />
        )}

        {currentPage === 'kedatangan' && (
          <KedatanganPage
            onBack={() => setCurrentPage('home')}
            onSubmit={handleSubmitForm}
          />
        )}
      </main>
    </div>
  );
}
