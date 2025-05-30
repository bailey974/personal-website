// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ItemList from './components/ItemList';
import ItemForm from './components/ItemForm';
import DocPage from './components/DocPage';

export default function App() {
  const [editing, setEditing] = useState(null);
  const [reloadFlag, setReloadFlag] = useState(false);
  const triggerReload = () => setReloadFlag(f => !f);

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <header className="bg-blue-600 text-white p-4 shadow-md">
          <div className="container mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-bold">My Full-Stack App</h1>
            <nav className="space-x-4">
              <Link to="/" className="hover:underline">Home</Link>
              <Link to="/doc" className="hover:underline">Doc</Link>
            </nav>
          </div>
        </header>

        <main className="flex-grow container mx-auto p-6">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Manage Items</h2>
                    <div className="bg-white rounded-lg shadow p-6">
                      <ItemForm
                        current={editing}
                        onSaved={() => {
                          setEditing(null);
                          triggerReload();
                        }}
                      />
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-4">Your Items</h2>
                    <div className="bg-white rounded-lg shadow p-6">
                      <ItemList
                        key={reloadFlag}
                        onEdit={item => setEditing(item)}
                      />
                    </div>
                  </section>
                </>
              }
            />
            <Route path="/doc" element={<DocPage />} />
          </Routes>
        </main>

        <footer className="bg-gray-200 text-gray-600 text-center p-4">
          <p className="text-sm">&copy; {new Date().getFullYear()} My Company</p>
        </footer>
      </div>
    </Router>
  );
}
