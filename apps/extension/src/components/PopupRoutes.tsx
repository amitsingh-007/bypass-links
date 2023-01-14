import { Suspense } from 'react';
import { Routes } from 'react-router-dom';

const PopupRoutes = () => (
  <Suspense fallback={null}>
    <Routes></Routes>
  </Suspense>
);

export default PopupRoutes;
