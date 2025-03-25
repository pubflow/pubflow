// examples/react-native/banking-example-expo.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Alert, TouchableOpacity, SafeAreaView, ActivityIndicator, ScrollView } from 'react-native';
import { createExpoPubFlow } from 'pubflow/react-native';
import { PubFlowProvider, useBridge } from 'pubflow/react-native';
import { BridgeSchema } from 'pubflow';
import { z } from 'zod';

// Create the PubFlow client with Expo integration
const pubflowClient = createExpoPubFlow({
  baseUrl: 'https://api.example.com',
  useSecureStorage: true,
  deviceInfo: true
});

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
  const { data: account, loading: accountLoading, error: accountError } = useBridge<Account>({
    schema: accountSchema,
    id: accountId,
    autoLoad: true
  });

  const { data: transactions, loading: transactionsLoading, error: transactionsError } = useBridge<Transaction[]>({
    schema: transactionSchema,
    autoLoad: true,
    query: (q) => q.where('accountId', '==', accountId).orderBy('createdAt', 'desc').limit(10)
  });

  const { data: balanceHistory, loading: balanceLoading, error: balanceError } = useBridge<BalanceHistory[]>({
    schema: balanceHistorySchema,
    autoLoad: true,
    query: (q) => q.where('accountId', '==', accountId).orderBy('date', 'desc').limit(30)
  });

  if (accountLoading || transactionsLoading || balanceLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading account details...</Text>
      </View>
    );
  }

  if (accountError || transactionsError || balanceError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Error loading account details: {accountError?.message || transactionsError?.message || balanceError?.message}
        </Text>
      </View>
    );
  }

  if (!account) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Account not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.accountDetailsContainer}>
      <Text style={styles.sectionTitle}>Account Details</Text>
      <View style={styles.accountCard}>
        <View style={styles.accountHeader}>
          <Text style={styles.accountType}>{account.accountType.toUpperCase()} Account</Text>
          <View style={[styles.statusBadge, styles[`status${account.status}`]]}>
            <Text style={styles.statusText}>{account.status}</Text>
          </View>
        </View>
        <View style={styles.accountInfo}>
          <Text style={styles.accountInfoItem}><Text style={styles.bold}>Account Number:</Text> {account.accountNumber}</Text>
          <Text style={styles.accountInfoItem}><Text style={styles.bold}>Balance:</Text> {account.currency} {account.balance.toFixed(2)}</Text>
          <Text style={styles.accountInfoItem}><Text style={styles.bold}>Opened:</Text> {new Date(account.openedDate).toLocaleDateString()}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recent Transactions</Text>
      {transactions && transactions.length > 0 ? (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item: transaction }) => (
            <View style={[styles.transactionItem, styles[`transaction${transaction.type}`]]}>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionType}>{transaction.type}</Text>
                <Text style={styles.transactionDate}>{new Date(transaction.createdAt || '').toLocaleDateString()}</Text>
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionDescription}>{transaction.description || transaction.type}</Text>
                <Text style={styles.transactionAmount}>
                  {transaction.type === 'deposit' || transaction.type === 'interest' ? '+' : '-'} 
                  {transaction.currency} {Math.abs(transaction.amount).toFixed(2)}
                </Text>
              </View>
              <View style={styles.transactionStatus}>
                <View style={[styles.statusBadge, styles[`status${transaction.status}`]]}>
                  <Text style={styles.statusText}>{transaction.status}</Text>
                </View>
              </View>
            </View>
          )}
        />
      ) : (
        <Text style={styles.noDataText}>No recent transactions</Text>
      )}

      <Text style={styles.sectionTitle}>Balance History</Text>
      {balanceHistory && balanceHistory.length > 0 ? (
        <View style={styles.balanceChart}>
          {/* Simple representation of balance history */}
          <View style={styles.chartContainer}>
            {balanceHistory.map((record, index) => {
              const maxBalance = Math.max(...balanceHistory.map(r => r.balance));
              const height = (record.balance / maxBalance) * 100;
              return (
                <View 
                  key={record.id} 
                  style={[styles.chartBar, { 
                    height: `${height}%`, 
                    left: `${index * (100 / balanceHistory.length)}%` 
                  }]}
                />
              );
            })}
          </View>
          <View style={styles.chartDates}>
            <Text style={styles.chartDateText}>{new Date(balanceHistory[balanceHistory.length - 1].date).toLocaleDateString()}</Text>
            <Text style={styles.chartDateText}>{new Date(balanceHistory[0].date).toLocaleDateString()}</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.noDataText}>No balance history available</Text>
      )}
    </ScrollView>
  );
}

// Transaction Details Component
function TransactionDetails({ transactionId }: { transactionId: string }) {
  const { data: transaction, loading, error } = useBridge<Transaction>({
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
            const response = await fetch(`https://api.example.com/transactions/search?q=id:${transaction.relatedTransactionId}`);
            const relatedTxn = await response.json();
            setRelatedTransaction(relatedTxn);
          }
          
          if (transaction.relatedAccountId) {
            const response = await fetch(`https://api.example.com/accounts/search?q=id:${transaction.relatedAccountId}`);
            const relatedAcc = await response.json();
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
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading transaction details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading transaction: {error.message}</Text>
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Transaction not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.transactionDetailsContainer}>
      <Text style={styles.sectionTitle}>Transaction Details</Text>
      <View style={styles.transactionCard}>
        <View style={styles.transactionHeader}>
          <Text style={styles.transactionHeaderTitle}>{transaction.type.toUpperCase()}</Text>
          <View style={[styles.statusBadge, styles[`status${transaction.status}`]]}>
            <Text style={styles.statusText}>{transaction.status}</Text>
          </View>
        </View>
        
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionInfoItem}><Text style={styles.bold}>Amount:</Text> {transaction.currency} {Math.abs(transaction.amount).toFixed(2)}</Text>
          <Text style={styles.transactionInfoItem}><Text style={styles.bold}>Date:</Text> {new Date(transaction.createdAt || '').toLocaleString()}</Text>
          <Text style={styles.transactionInfoItem}><Text style={styles.bold}>Description:</Text> {transaction.description || 'N/A'}</Text>
          {transaction.category && <Text style={styles.transactionInfoItem}><Text style={styles.bold}>Category:</Text> {transaction.category}</Text>}
        </View>

        {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
          <View style={styles.transactionMetadata}>
            <Text style={styles.metadataTitle}>Additional Information</Text>
            {Object.entries(transaction.metadata).map(([key, value]) => (
              <Text key={key} style={styles.metadataItem}><Text style={styles.bold}>{key}:</Text> {String(value)}</Text>
            ))}
          </View>
        )}

        {(transaction.relatedTransactionId || transaction.relatedAccountId) && (
          <View style={styles.relatedInfo}>
            <Text style={styles.relatedInfoTitle}>Related Information</Text>
            {loadingRelated ? (
              <ActivityIndicator size="small" color="#0066cc" />
            ) : (
              <>
                {relatedTransaction && (
                  <View style={styles.relatedTransaction}>
                    <Text style={styles.relatedItemTitle}>Related Transaction</Text>
                    <Text style={styles.relatedItemDetail}><Text style={styles.bold}>Type:</Text> {relatedTransaction.type}</Text>
                    <Text style={styles.relatedItemDetail}><Text style={styles.bold}>Amount:</Text> {relatedTransaction.currency} {Math.abs(relatedTransaction.amount).toFixed(2)}</Text>
                    <Text style={styles.relatedItemDetail}><Text style={styles.bold}>Status:</Text> {relatedTransaction.status}</Text>
                  </View>
                )}
                
                {relatedAccount && (
                  <View style={styles.relatedAccount}>
                    <Text style={styles.relatedItemTitle}>Related Account</Text>
                    <Text style={styles.relatedItemDetail}><Text style={styles.bold}>Account Number:</Text> {relatedAccount.accountNumber}</Text>
                    <Text style={styles.relatedItemDetail}><Text style={styles.bold}>Type:</Text> {relatedAccount.accountType}</Text>
                    <Text style={styles.relatedItemDetail}><Text style={styles.bold}>Status:</Text> {relatedAccount.status}</Text>
                  </View>
                )}
              </>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// Account Balance History with Filtering
function AccountBalanceHistory({ accountId }: { accountId: string }) {
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ 
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end: new Date().toISOString().split('T')[0] // today
  });

  const { data: balanceHistory, loading, error, query, refetch } = useBridge<BalanceHistory[]>({
    schema: balanceHistorySchema,
    autoLoad: true,
    query: (q) => q
      .where('accountId', '==', accountId)
      .where('date', '>=', dateRange.start)
      .where('date', '<=', dateRange.end)
      .orderBy('date', 'asc')
  });

  const handleFilterChange = (name: string, value: string) => {
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilter = () => {
    refetch();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading balance history...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading balance history: {error.message}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.balanceHistoryContainer}>
      <Text style={styles.sectionTitle}>Account Balance History</Text>
      
      <View style={styles.filterControls}>
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Start Date:</Text>
          <TextInput 
            style={styles.filterInput} 
            value={dateRange.start} 
            onChangeText={(value) => handleFilterChange('start', value)} 
            placeholder="YYYY-MM-DD"
          />
        </View>
        
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>End Date:</Text>
          <TextInput 
            style={styles.filterInput} 
            value={dateRange.end} 
            onChangeText={(value) => handleFilterChange('end', value)} 
            placeholder="YYYY-MM-DD"
          />
        </View>
        
        <TouchableOpacity style={styles.filterButton} onPress={handleApplyFilter}>
          <Text style={styles.filterButtonText}>Apply Filter</Text>
        </TouchableOpacity>
      </View>
      
      {balanceHistory && balanceHistory.length > 0 ? (
        <View style={styles.balanceData}>
          <View style={styles.balanceChart}>
            {/* More detailed chart representation */}
            <View style={styles.chartContainer}>
              {balanceHistory.map((record, index) => {
                const maxBalance = Math.max(...balanceHistory.map(r => r.balance));
                const height = (record.balance / maxBalance) * 100;
                return (
                  <View 
                    key={record.id} 
                    style={[styles.chartBar, { 
                      height: `${height}%`, 
                      left: `${index * (100 / balanceHistory.length)}%` 
                    }]}
                  />
                );
              })}
            </View>
          </View>
          
          <View style={styles.balanceTable}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.tableHeaderCell, styles.dateCell]}>Date</Text>
              <Text style={[styles.tableCell, styles.tableHeaderCell, styles.balanceCell]}>Balance</Text>
              <Text style={[styles.tableCell, styles.tableHeaderCell, styles.changeCell]}>Change</Text>
            </View>
            <FlatList
              data={balanceHistory}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item: record, index }) => {
                const prevBalance = index > 0 ? balanceHistory[index - 1].balance : record.balance;
                const change = record.balance - prevBalance;
                return (
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.dateCell]}>{new Date(record.date).toLocaleDateString()}</Text>
                    <Text style={[styles.tableCell, styles.balanceCell]}>{record.currency || 'USD'} {record.balance.toFixed(2)}</Text>
                    <Text style={[styles.tableCell, styles.changeCell, change >= 0 ? styles.positiveChange : styles.negativeChange]}>
                      {change >= 0 ? '+' : ''}{change.toFixed(2)}
                    </Text>
                  </View>
                );
              }}
            />
          </View>
        </View>
      ) : (
        <Text style={styles.noDataText}>No balance history available for the selected period</Text>
      )}
    </ScrollView>
  );
}

// Main Banking Dashboard Component
export default function BankingDashboard() {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [view, setView] = useState<'accounts' | 'transactions' | 'balance'>('accounts');
  
  const { data: accounts, loading: accountsLoading, error: accountsError } = useBridge<Account[]>({
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
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Loading accounts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (accountsError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading accounts: {accountsError.message}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.dashboardTitle}>Banking Dashboard</Text>
      
      <View style={styles.dashboardLayout}>
        <View style={styles.accountsSidebar}>
          <Text style={styles.sidebarTitle}>Your Accounts</Text>
          {accounts && accounts.length > 0 ? (
            <FlatList
              data={accounts}
              keyExtractor={(item) => item.id}
              renderItem={({ item: account }) => (
                <View style={[styles.accountItem, selectedAccountId === account.id && styles.selectedAccount]}>
                  <TouchableOpacity style={styles.accountButton} onPress={() => handleAccountSelect(account.id)}>
                    <Text style={styles.accountItemType}>{account.accountType}</Text>
                    <Text style={styles.accountItemNumber}>{account.accountNumber}</Text>
                    <Text style={styles.accountItemBalance}>{account.currency} {account.balance.toFixed(2)}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.viewHistoryButton} 
                    onPress={() => handleViewBalanceHistory(account.id)}
                  >
                    <Text style={styles.viewHistoryButtonText}>History</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          ) : (
            <Text style={styles.noDataText}>No accounts found</Text>
          )}
        </View>
        
        <View style={styles.mainContent}>
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
            <View style={styles.welcomeMessage}>
              <Text style={styles.welcomeTitle}>Welcome to Your Banking Dashboard</Text>
              <Text style={styles.welcomeText}>Select an account from the sidebar to view details and transactions.</Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  dashboardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
    backgroundColor: '#0066cc',
    color: 'white',
  },
  dashboardLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  accountsSidebar: {
    width: '35%',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    backgroundColor: 'white',
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 12,
    backgroundColor: '#f0f0f0',
  },
  accountItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedAccount: {
    backgroundColor: '#e6f2ff',
  },
  accountButton: {
    padding: 8,
  },
  accountItemType: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  accountItemNumber: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  accountItemBalance: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewHistoryButton: {
    marginTop: 8,
    padding: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    alignItems: 'center',
  },
  viewHistoryButtonText: {
    fontSize: 12,
    color: '#333',
  },
  mainContent: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  welcomeMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 18,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 12,
  },
  accountDetailsContainer: {
    flex: 1,
    padding: 8,
  },
  accountCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  accountType: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusactive: {
    backgroundColor: '#4caf50',
  },
  statusinactive: {
    backgroundColor: '#9e9e9e