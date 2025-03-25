// examples/next/banking-example.tsx
import React, { useState, useEffect } from 'react';
import { useNextBridge, NextPubFlowProvider } from 'pubflow/next';
import { BridgeSchema } from 'pubflow';
import { z } from 'zod';

// Define Account schema
const accountSchema = new BridgeSchema({
  name: 'account',
  fields: {
    id: z.string().optional(),
    accountNumber: z.string().min(8, 'Account number must be at least 8 characters'),
    accountType: z.enum(['checking', 'savings', 'credit', 'investment']),
    balance: z.number().min(0, 'Balance cannot be negative for this account type'),
    currency: z.string().default('USD'),
    ownerId: z.string(),
    status: z.enum(['active', 'inactive', 'frozen', 'closed']).default('active'),
    openedDate: z.string()
  },
  timestamps: true
});

// Define Transaction schema
const transactionSchema = new BridgeSchema({
  name: 'transaction',
  fields: {
    id: z.string().optional(),
    accountId: z.string(),
    type: z.enum(['deposit', 'withdrawal', 'transfer', 'payment', 'fee', 'interest']),
    amount: z.number(),
    currency: z.string().default('USD'),
    description: z.string().optional(),
    category: z.string().optional(),
    status: z.enum(['pending', 'completed', 'failed', 'reversed']).default('completed'),
    relatedTransactionId: z.string().optional(),
    relatedAccountId: z.string().optional(),
    metadata: z.record(z.string(), z.any()).optional()
  },
  timestamps: true
});

// Define BalanceHistory schema
const balanceHistorySchema = new BridgeSchema({
  name: 'balanceHistory',
  fields: {
    id: z.string().optional(),
    accountId: z.string(),
    balance: z.number(),
    date: z.string(),
    transactionId: z.string().optional()
  },
  timestamps: true
});

// Interfaces
interface Account {
  id: string;
  accountNumber: string;
  accountType: 'checking' | 'savings' | 'credit' | 'investment';
  balance: number;
  currency: string;
  ownerId: string;
  status: 'active' | 'inactive' | 'frozen' | 'closed';
  openedDate: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Transaction {
  id: string;
  accountId: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'fee' | 'interest';
  amount: number;
  currency: string;
  description?: string;
  category?: string;
  status: 'pending' | 'completed' | 'failed' | 'reversed';
  relatedTransactionId?: string;
  relatedAccountId?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

interface BalanceHistory {
  id: string;
  accountId: string;
  balance: number;
  date: string;
  transactionId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Account Details Component
function AccountDetails({ accountId }: { accountId: string }) {
  const { data: account, loading: accountLoading, error: accountError } = useNextBridge<Account>({
    schema: accountSchema,
    id: accountId,
    autoLoad: true
  });

  const { data: transactions, loading: transactionsLoading, error: transactionsError } = useNextBridge<Transaction[]>({
    schema: transactionSchema,
    autoLoad: true,
    query: (q) => q.where('accountId', '==', accountId).orderBy('createdAt', 'desc').limit(10)
  });

  const { data: balanceHistory, loading: balanceLoading, error: balanceError } = useNextBridge<BalanceHistory[]>({
    schema: balanceHistorySchema,
    autoLoad: true,
    query: (q) => q.where('accountId', '==', accountId).orderBy('date', 'desc').limit(30)
  });

  if (accountLoading || transactionsLoading || balanceLoading) {
    return <div className="loading">Loading account details...</div>;
  }

  if (accountError || transactionsError || balanceError) {
    return <div className="error">Error loading account details: {accountError?.message || transactionsError?.message || balanceError?.message}</div>;
  }

  if (!account) {
    return <div className="not-found">Account not found</div>;
  }

  return (
    <div className="account-details">
      <h2>Account Details</h2>
      <div className="account-card">
        <div className="account-header">
          <h3>{account.accountType.toUpperCase()} Account</h3>
          <span className={`status status-${account.status}`}>{account.status}</span>
        </div>
        <div className="account-info">
          <p><strong>Account Number:</strong> {account.accountNumber}</p>
          <p><strong>Balance:</strong> {account.currency} {account.balance.toFixed(2)}</p>
          <p><strong>Opened:</strong> {new Date(account.openedDate).toLocaleDateString()}</p>
        </div>
      </div>

      <h3>Recent Transactions</h3>
      {transactions && transactions.length > 0 ? (
        <div className="transactions-list">
          {transactions.map(transaction => (
            <div key={transaction.id} className={`transaction-item transaction-${transaction.type}`}>
              <div className="transaction-details">
                <span className="transaction-type">{transaction.type}</span>
                <span className="transaction-date">{new Date(transaction.createdAt || '').toLocaleDateString()}</span>
              </div>
              <div className="transaction-info">
                <span className="transaction-description">{transaction.description || transaction.type}</span>
                <span className="transaction-amount">
                  {transaction.type === 'deposit' || transaction.type === 'interest' ? '+' : '-'} 
                  {transaction.currency} {Math.abs(transaction.amount).toFixed(2)}
                </span>
              </div>
              <div className="transaction-status">
                <span className={`status status-${transaction.status}`}>{transaction.status}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No recent transactions</p>
      )}

      <h3>Balance History</h3>
      {balanceHistory && balanceHistory.length > 0 ? (
        <div className="balance-chart">
          {/* Simple representation of balance history */}
          <div className="chart-container">
            {balanceHistory.map((record, index) => (
              <div 
                key={record.id} 
                className="chart-bar" 
                style={{ 
                  height: `${(record.balance / Math.max(...balanceHistory.map(r => r.balance))) * 100}%`,
                  left: `${index * (100 / balanceHistory.length)}%`
                }}
                title={`${record.date}: ${record.balance.toFixed(2)}`}
              />
            ))}
          </div>
          <div className="chart-dates">
            <span>{new Date(balanceHistory[balanceHistory.length - 1].date).toLocaleDateString()}</span>
            <span>{new Date(balanceHistory[0].date).toLocaleDateString()}</span>
          </div>
        </div>
      ) : (
        <p>No balance history available</p>
      )}
    </div>
  );
}

// Transaction Details Component
function TransactionDetails({ transactionId }: { transactionId: string }) {
  const { data: transaction, loading, error } = useNextBridge<Transaction>({
    schema: transactionSchema,
    id: transactionId,
    autoLoad: true
  });

  const [relatedTransaction, setRelatedTransaction] = useState<Transaction | null>(null);
  const [relatedAccount, setRelatedAccount] = useState<Account | null>(null);
  const [loadingRelated, setLoadingRelated] = useState(false);

  // Fetch related transaction and account if available
  useEffect(() => {
    if (transaction?.relatedTransactionId || transaction?.relatedAccountId) {
      setLoadingRelated(true);
      
      const fetchRelated = async () => {
        try {
          // Using the /record/search?q=id pattern for subsequent requests
          if (transaction.relatedTransactionId) {
            const relatedTxn = await fetch(`/api/transactions/search?q=id:${transaction.relatedTransactionId}`)
              .then(res => res.json());
            setRelatedTransaction(relatedTxn);
          }
          
          if (transaction.relatedAccountId) {
            const relatedAcc = await fetch(`/api/accounts/search?q=id:${transaction.relatedAccountId}`)
              .then(res => res.json());
            setRelatedAccount(relatedAcc);
          }
        } catch (err) {
          console.error('Error fetching related data:', err);
        } finally {
          setLoadingRelated(false);
        }
      };
      
      fetchRelated();
    }
  }, [transaction]);

  if (loading) {
    return <div className="loading">Loading transaction details...</div>;
  }

  if (error) {
    return <div className="error">Error loading transaction: {error.message}</div>;
  }

  if (!transaction) {
    return <div className="not-found">Transaction not found</div>;
  }

  return (
    <div className="transaction-details">
      <h2>Transaction Details</h2>
      <div className="transaction-card">
        <div className="transaction-header">
          <h3>{transaction.type.toUpperCase()}</h3>
          <span className={`status status-${transaction.status}`}>{transaction.status}</span>
        </div>
        
        <div className="transaction-info">
          <p><strong>Amount:</strong> {transaction.currency} {Math.abs(transaction.amount).toFixed(2)}</p>
          <p><strong>Date:</strong> {new Date(transaction.createdAt || '').toLocaleString()}</p>
          <p><strong>Description:</strong> {transaction.description || 'N/A'}</p>
          {transaction.category && <p><strong>Category:</strong> {transaction.category}</p>}
        </div>

        {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
          <div className="transaction-metadata">
            <h4>Additional Information</h4>
            {Object.entries(transaction.metadata).map(([key, value]) => (
              <p key={key}><strong>{key}:</strong> {String(value)}</p>
            ))}
          </div>
        )}

        {(transaction.relatedTransactionId || transaction.relatedAccountId) && (
          <div className="related-info">
            <h4>Related Information</h4>
            {loadingRelated ? (
              <p>Loading related information...</p>
            ) : (
              <>
                {relatedTransaction && (
                  <div className="related-transaction">
                    <h5>Related Transaction</h5>
                    <p><strong>Type:</strong> {relatedTransaction.type}</p>
                    <p><strong>Amount:</strong> {relatedTransaction.currency} {Math.abs(relatedTransaction.amount).toFixed(2)}</p>
                    <p><strong>Status:</strong> {relatedTransaction.status}</p>
                  </div>
                )}
                
                {relatedAccount && (
                  <div className="related-account">
                    <h5>Related Account</h5>
                    <p><strong>Account Number:</strong> {relatedAccount.accountNumber}</p>
                    <p><strong>Type:</strong> {relatedAccount.accountType}</p>
                    <p><strong>Status:</strong> {relatedAccount.status}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Account Balance History with Filtering
function AccountBalanceHistory({ accountId }: { accountId: string }) {
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ 
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end: new Date().toISOString().split('T')[0] // today
  });

  const { data: balanceHistory, loading, error, query, refetch } = useNextBridge<BalanceHistory[]>({
    schema: balanceHistorySchema,
    autoLoad: true,
    query: (q) => q
      .where('accountId', '==', accountId)
      .where('date', '>=', dateRange.start)
      .where('date', '<=', dateRange.end)
      .orderBy('date', 'asc')
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilter = () => {
    refetch();
  };

  if (loading) {
    return <div className="loading">Loading balance history...</div>;
  }

  if (error) {
    return <div className="error">Error loading balance history: {error.message}</div>;
  }

  return (
    <div className="balance-history">
      <h2>Account Balance History</h2>
      
      <div className="filter-controls">
        <div className="filter-group">
          <label htmlFor="start">Start Date:</label>
          <input 
            type="date" 
            id="start" 
            name="start" 
            value={dateRange.start} 
            onChange={handleFilterChange} 
          />
        </div>
        
        <div className="filter-group">
          <label htmlFor="end">End Date:</label>
          <input 
            type="date" 
            id="end" 
            name="end" 
            value={dateRange.end} 
            onChange={handleFilterChange} 
          />
        </div>
        
        <button onClick={handleApplyFilter} className="filter-button">Apply Filter</button>
      </div>
      
      {balanceHistory && balanceHistory.length > 0 ? (
        <div className="balance-data">
          <div className="balance-chart">
            {/* More detailed chart representation */}
            <div className="chart-container">
              {balanceHistory.map((record, index) => (
                <div 
                  key={record.id} 
                  className="chart-bar" 
                  style={{ 
                    height: `${(record.balance / Math.max(...balanceHistory.map(r => r.balance))) * 100}%`,
                    left: `${index * (100 / balanceHistory.length)}%`
                  }}
                  title={`${record.date}: ${record.balance.toFixed(2)}`}
                />
              ))}
            </div>
          </div>
          
          <div className="balance-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Balance</th>
                  <th>Change</th>
                </tr>
              </thead>
              <tbody>
                {balanceHistory.map((record, index) => {
                  const prevBalance = index > 0 ? balanceHistory[index - 1].balance : record.balance;
                  const change = record.balance - prevBalance;
                  return (
                    <tr key={record.id}>
                      <td>{new Date(record.date).toLocaleDateString()}</td>
                      <td>{record.currency || 'USD'} {record.balance.toFixed(2)}</td>
                      <td className={change >= 0 ? 'positive-change' : 'negative-change'}>
                        {change >= 0 ? '+' : ''}{change.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p>No balance history available for the selected period</p>
      )}
    </div>
  );
}

// Main Banking Dashboard Component
export default function BankingDashboard() {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [view, setView] = useState<'accounts' | 'transactions' | 'balance'>('accounts');
  
  const { data: accounts, loading: accountsLoading, error: accountsError } = useNextBridge<Account[]>({
    schema: accountSchema,
    autoLoad: true
  });

  const handleAccountSelect = (accountId: string) => {
    setSelectedAccountId(accountId);
    setView('accounts');
  };

  const handleTransactionSelect = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
    setView('transactions');
  };

  const handleViewBalanceHistory = (accountId: string) => {
    setSelectedAccountId(accountId);
    setView('balance');
  };

  if (accountsLoading) {
    return <div className="loading">Loading accounts...</div>;
  }

  if (accountsError) {
    return <div className="error">Error loading accounts: {accountsError.message}</div>;
  }

  return (
    <div className="banking-dashboard">
      <h1>Banking Dashboard</h1>
      
      <div className="dashboard-layout">
        <div className="accounts-sidebar">
          <h2>Your Accounts</h2>
          {accounts && accounts.length > 0 ? (
            <ul className="accounts-list">
              {accounts.map(account => (
                <li key={account.id} className={`account-item ${selectedAccountId === account.id ? 'selected' : ''}`}>
                  <button onClick={() => handleAccountSelect(account.id)}>
                    <span className="account-type">{account.accountType}</span>
                    <span className="account-number">{account.accountNumber}</span>
                    <span className="account-balance">{account.currency} {account.balance.toFixed(2)}</span>
                  </button>
                  <button 
                    className="view-history-button" 
                    onClick={() => handleViewBalanceHistory(account.id)}
                    title="View Balance History"
                  >
                    History
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No accounts found</p>
          )}
        </div>
        
        <div className="main-content">
          {view === 'accounts' && selectedAccountId && (
            <AccountDetails accountId={selectedAccountId} />
          )}
          
          {view === 'transactions' && selectedTransactionId && (
            <TransactionDetails transactionId={selectedTransactionId} />
          )}
          
          {view === 'balance' && selectedAccountId && (
            <AccountBalanceHistory accountId={selectedAccountId} />
          )}
          
          {!selectedAccountId && !selectedTransactionId && (
            <div className="welcome-message">
              <h2>Welcome to Your Banking Dashboard</h2>
              <p>Select an account from the sidebar to view details and transactions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}