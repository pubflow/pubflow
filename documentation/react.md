# PubFlow React Adapter

## Installation

```bash
npm install pubflow
Basic Usage
Copy
import { PubFlow, PubFlowProvider } from 'pubflow/react';

const client = new PubFlow({
  baseUrl: 'https://api.example.com'
});

function App() {
  return (
    <PubFlowProvider client={client}>
      {/* Your app components */}
    </PubFlowProvider>
  );
}
Hooks
useAuth
Manages authentication state and operations.

Copy
function LoginPage() {
  const { login, logout, session, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  
  if (session) {
    return (
      <div>
        Welcome {session.user.name}
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  return <LoginForm onSubmit={login} />;
}
useBridge
Manages Bridge resources with full CRUD operations.

Copy
function UserManagement() {
  const {
    data,
    loading,
    error,
    query,
    create,
    update,
    remove
  } = useBridge('users', userSchema);

  // Load users
  useEffect(() => {
    query({ limit: 10 });
  }, []);

  // Create user
  const handleCreate = async (userData) => {
    await create(userData);
    await query(); // Refresh list
  };

  // Update user
  const handleUpdate = async (id, userData) => {
    await update(id, userData);
    await query(); // Refresh list
  };

  // Delete user
  const handleDelete = async (id) => {
    await remove(id);
    await query(); // Refresh list
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <UserList
        users={data}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
      <CreateUserForm onSubmit={handleCreate} />
    </div>
  );
}
Schema Validation
PubFlow includes built-in schema validation using Zod:

Copy
import { BridgeSchema } from 'pubflow';
import { z } from 'zod';

const userSchema = new BridgeSchema({
  name: 'user',
  fields: {
    email: z.string().email(),
    name: z.string().min(2),
    role: z.enum(['admin', 'user'])
  },
  timestamps: true
});

// Schema will automatically validate data in useBridge
const { create, update } = useBridge('users', userSchema);

// Example usage:
function App() {
  return (
    <PubFlowProvider client={pubflowClient}>
      <Router>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected route - any authenticated user */}
          <Route
            path="/dashboard"
            element={
              <BridgeView requireAuth>
                <DashboardPage />
              </BridgeView>
            }
          />
          
          {/* Protected route - specific user types */}
          <Route
            path="/admin"
            element={
              <BridgeView
                userTypes="admin"
                unauthorized={<UnauthorizedPage />}
              >
                <AdminPanel />
              </BridgeView>
            }
          />
          
          {/* Multiple user types */}
          <Route
            path="/reports"
            element={
              <BridgeView userTypes={['admin', 'manager']}>
                <ReportsPage />
              </BridgeView>
            }
          />
        </Routes>
      </Router>
    </PubFlowProvider>
  );
}

// Example components
function AdminPanel() {
  const { user } = useAuth();
  
  return (
    <div>
      <h1>Admin Panel</h1>
      <p>Welcome {user?.name}</p>
    </div>
  );
}

function LoginPage() {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      // Handle error
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}

// Example of a component using BridgeView with complex permissions
function UserManagement() {
  return (
    <div>
      {/* Only admin can see this section */}
      <BridgeView userTypes="admin">
        <section>
          <h2>User Administration</h2>
          <UserList />
        </section>
      </BridgeView>

      {/* Both admin and manager can see this section */}
      <BridgeView userTypes={['admin', 'manager']}>
        <section>
          <h2>User Reports</h2>
          <UserReports />
        </section>
      </BridgeView>

      {/* Any authenticated user can see this section */}
      <BridgeView requireAuth>
        <section>
          <h2>Profile</h2>
          <UserProfile />
        </section>
      </BridgeView>
    </div>
  );
}