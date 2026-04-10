import { AdminLayout } from './layouts/AdminLayout';
import { AppRouter } from './routers/AppRouter';

function App() {
  return (
    <AdminLayout>
      <AppRouter />
    </AdminLayout>
  );
}

export default App;
