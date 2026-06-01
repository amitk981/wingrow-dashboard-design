import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { LocationFinalization } from './pages/LocationFinalization';
import { FarmerBilling } from './pages/FarmerBilling';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'location-finalization', Component: LocationFinalization },
      { path: 'farmer-billing', Component: FarmerBilling },
    ],
  },
]);
