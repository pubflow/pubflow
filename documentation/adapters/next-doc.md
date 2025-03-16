// Example usage in a Next.js page:
// pages/admin/users.tsx
import { BridgeView, useNextBridge } from '@/adapters/next';
import { userSchema } from '@/schemas';

export default function UsersPage() {
  const {
    data: users,
    loading,
    error,
    query,
    create,
    update,
    remove,
    selected,
    setSelected,
    bulkActions
  } = useNextBridge('users', {
    schema: userSchema,
    autoLoad: true,
    pageSize: 10
  });

  return (
    <BridgeView
      userTypes={['admin', 'manager']}
      loginPath="/login"
      unauthorized={<UnauthorizedPage />}
    >
      <div className="users-page">
        {/* User management UI */}
      </div>
    </BridgeView>
  );
}

// Add to _app.tsx
import { NextPubFlowProvider } from '@/adapters/next';
import { pubflowClient } from '@/config/pubflow';

function MyApp({ Component, pageProps }) {
  return (
    <NextPubFlowProvider
      client={pubflowClient}
      options={{
        autoLogin: true,
        loading: <AppLoader />,
        onError: (error) => {
          console.error('PubFlow error:', error);
          toast.error('An error occurred');
        },
        loginPath: '/login',
        unauthorizedPath: '/unauthorized'
      }}
    >
      <Component {...pageProps} />
    </NextPubFlowProvider>
  );
}

// Example with layouts and multiple guards
// pages/admin/dashboard.tsx
export default function AdminDashboard() {
  return (
    <BridgeView requireAuth loginPath="/login">
      <AdminLayout>
        <BridgeView userTypes="admin">
          <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>
            <DashboardContent />
          </div>
        </BridgeView>
      </AdminLayout>
    </BridgeView>
  );
}


Example usage:

Copy
// pages/admin/users.tsx
import { withNextAuth, withNextBridge, BridgeView } from '@/adapters/next';
import { userSchema } from '@/schemas';

function UsersPage({ bridge }) {
  const { params, setParams } = useQueryParams();

  useEffect(() => {
    bridge.query(params);
  }, [params]);

  return (
    <BridgeView userTypes="admin">
      <div className="users-page">
        {/* User management UI */}
      </div>
    </BridgeView>
  );
}

export const getServerSideProps = withServerSideAuth(
  async (context) => {
    const client = createServerSideClient(context);
    const users = await client.bridge.query('users');

    return {
      props: {
        initialData: users
      }
    };
  },
  {
    requireAuth: true,
    userTypes: 'admin'
  }
);

export default withNextAuth(
  withNextBridge(UsersPage, {
    resourceName: 'users',
    schema: userSchema,
    autoLoad: false
  }),
  {
    userTypes: 'admin'
  }
);