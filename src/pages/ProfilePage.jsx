import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { userService } from '../api/userService';
import { transactionService } from '../api/transactionService';

export default function ProfilePage() {
  const { currentUser } = useUser();
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    availableBalance: 0,
    lockedBalance: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load user's balance and transaction history
  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser?.uid) return;

      try {
        setIsLoading(true);

        // Ensure user exists and get balance
        await userService.getOrCreateUser(
          currentUser.uid,
          currentUser.email,
          currentUser.displayName || 'User'
        );

        const balance = await userService.getUserBalance(currentUser.uid);
        setStats({
          availableBalance: balance.availableBalance,
          lockedBalance: balance.lockedBalance,
        });

        // Fetch transaction history
        const txList = await transactionService.getTransactionsByUser(currentUser.uid);
        
        // Format transactions for display
        const formattedTx = txList.map((tx) => ({
          id: tx.id,
          title: tx.taskTitle || 'Unknown Task',
          credits: tx.amount,
          status: tx.status === 'pending' ? 'Unsettled' : 'Completed',
          type: tx.type,
          createdAt: tx.createdAt,
        }));

        setTransactions(formattedTx);
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [currentUser?.uid, currentUser?.email, currentUser?.displayName]);

  const displayName = currentUser?.displayName || 'Firstname Lastname';
  const email = currentUser?.email || 'user@columbia.edu';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  // Get display label for transaction type
  const getTransactionLabel = (tx) => {
    switch (tx.type) {
      case 'earn':
        return 'Completed';
      case 'spend':
        return 'Completed';
      case 'lock':
        return 'Unsettled';
      case 'unlock':
        return 'Withdrawn';
      default:
        return tx.status;
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-header-left">
            <h1 className="profile-title">My Wallet</h1>
            <p className="profile-subtitle">Earn credit first, then spend them.</p>
          </div>
          <div className="profile-header-right">
            <div className="profile-user-info">
              <p className="profile-user-name">{displayName}</p>
              <p className="profile-user-email">{email}</p>
            </div>
            <div className="profile-user-avatar">{avatarLetter}</div>
          </div>
        </div>

        {/* Balance Section */}
        <div className="balance-section">
          <div className="balance-row">
            <span className="balance-label">Available Balance</span>
            <span className="balance-value available">
              <span className="balance-number">{stats.availableBalance}</span> credits
            </span>
          </div>
          <div className="balance-row">
            <span className="balance-label">Locked for pending tasks</span>
            <span className="balance-value locked">
              <span className="balance-number">{stats.lockedBalance}</span> credits
            </span>
          </div>
        </div>

        {/* Transaction History */}
        <div className="transaction-section">
          <h2 className="transaction-title">Transaction History</h2>

          {isLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="empty-state">
              <p>No transactions yet. Start posting or claiming tasks!</p>
            </div>
          ) : (
            <div className="transaction-list">
              {transactions.map((tx) => (
                <div key={tx.id} className="transaction-item">
                  <div className="transaction-left">
                    <span className={`transaction-status ${getTransactionLabel(tx).toLowerCase()}`}>
                      {getTransactionLabel(tx)}
                    </span>
                    <span className="transaction-name">{tx.title}</span>
                  </div>
                  <span className={`transaction-credits ${tx.credits >= 0 ? 'positive' : 'negative'}`}>
                    {tx.credits >= 0 ? '+' : ''}{tx.credits} credits
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
