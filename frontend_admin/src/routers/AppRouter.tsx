import { Routes, Route } from 'react-router-dom';
import { Dashboard } from '../pages/Dashboard';
import { ProductImport } from '../pages/ProductImport';

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/products/import" element={<ProductImport />} />
    </Routes>
  );
};
