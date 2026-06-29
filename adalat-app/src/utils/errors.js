export const parseError = (err) => {
  if (!err) return 'An unknown error occurred';

  // Check for common Wagmi / MetaMask errors
  if (err.message) {
    if (err.message.includes('User denied transaction signature')) {
      return 'Transaction rejected by user.';
    }
    if (err.message.includes('insufficient funds')) {
      return 'Insufficient funds for gas * price + value.';
    }
    if (err.message.includes('execution reverted')) {
      // Try to extract the custom revert reason if present
      const match = err.message.match(/reverted with reason string '([^']+)'/);
      if (match && match[1]) {
        return match[1];
      }
      return 'Transaction reverted by the smart contract. Check inputs.';
    }
    
    // Wagmi often provides a shortMessage
    if (err.shortMessage) {
      return err.shortMessage;
    }
    
    // Return a cleaned up version of the message if it's super long
    const msg = err.message.split('\n')[0];
    return msg.length > 100 ? msg.substring(0, 100) + '...' : msg;
  }
  
  return 'An unexpected error occurred.';
};
