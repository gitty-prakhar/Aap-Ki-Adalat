import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { ABIS, ADDRESSES } from '../config/contracts';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { parseError } from '../utils/errors';
import { ArrowRight, ArrowLeft, User, DollarSign, FileText, CheckCircle, AlertCircle } from 'lucide-react';

const STEPS = ['Counterparty', 'Terms', 'Review'];

const StepIndicator = ({ step }) => (
  <div className="flex items-center justify-center space-x-2 mb-10">
    {STEPS.map((label, i) => (
      <React.Fragment key={label}>
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 flex items-center justify-center border font-mono text-xs font-bold transition-all duration-300 ${
            i < step
              ? 'border-gold-500 bg-gold-500 text-dark-900'
              : i === step
              ? 'border-gold-500 text-gold-500 bg-gold-500/10'
              : 'border-dark-600 text-gray-600'
          }`}>
            {i < step ? <CheckCircle size={14} /> : i + 1}
          </div>
          <span className={`text-[9px] font-mono uppercase tracking-widest mt-1.5 ${
            i === step ? 'text-gold-500' : 'text-gray-600'
          }`}>
            {label}
          </span>
        </div>
        {i < STEPS.length - 1 && (
          <div className={`h-px w-12 mb-5 transition-colors duration-500 ${i < step ? 'bg-gold-500' : 'bg-dark-600'}`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

const InputField = ({ label, hint, children }) => (
  <div className="space-y-1.5">
    <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest">{label}</label>
    {children}
    {hint && <p className="text-[10px] font-mono text-gray-700">{hint}</p>}
  </div>
);

const inputClass = "w-full bg-dark-700 border border-dark-600 text-gray-200 px-4 py-3 font-mono text-sm focus:border-gold-500 transition-colors placeholder-gray-700";

const FileCase = () => {
  const { address, isConnected } = useAccount();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    partyB: '',
    amountEth: '',
    deadlineDays: '',
    description: '',
  });

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validateStep = () => {
    if (step === 0) {
      if (!form.partyB || !/^0x[a-fA-F0-9]{40}$/.test(form.partyB)) {
        toast.error('Please enter a valid Ethereum address for Party B');
        return false;
      }
      if (form.partyB.toLowerCase() === address?.toLowerCase()) {
        toast.error('Party B cannot be your own address');
        return false;
      }
    }
    if (step === 1) {
      if (!form.amountEth || parseFloat(form.amountEth) <= 0) {
        toast.error('Please enter a valid ETH amount');
        return false;
      }
      if (!form.deadlineDays || parseInt(form.deadlineDays) < 1) {
        toast.error('Please enter a deadline of at least 1 day');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!isConnected) { toast.error('Please connect your wallet first'); return; }
    if (validateStep()) setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => s - 1);

  const handleSubmit = () => {
    try {
      const baseValue = parseEther(form.amountEth);
      const totalValue = baseValue + (baseValue * 250n) / 10000n;
      writeContract(
        {
          address: ADDRESSES.EscrowFactory,
          abi: ABIS.EscrowFactory,
          functionName: 'createEscrow',
          args: [form.partyB, baseValue, BigInt(form.deadlineDays)],
          value: totalValue,
        },
        { onError: (err) => toast.error('Transaction Failed: ' + parseError(err)) }
      );
    } catch (err) {
      toast.error('Invalid input: ' + err.message);
    }
  };

  useEffect(() => {
    if (isConfirming) toast.loading('Confirming on-chain…', { id: 'tx' });
  }, [isConfirming]);

  useEffect(() => {
    if (isConfirmed) {
      toast.success('🎉 Escrow Created Successfully!', { id: 'tx' });
      setForm({ partyB: '', amountEth: '', deadlineDays: '', description: '' });
      setStep(0);
    }
  }, [isConfirmed]);

  useEffect(() => {
    if (error) toast.error('Error: ' + parseError(error));
  }, [error]);

  const totalEth = form.amountEth ? (parseFloat(form.amountEth) * 1.025).toFixed(4) : '0.0000';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-10">
        <span className="text-[10px] font-mono text-gold-500/60 tracking-[0.4em] uppercase">New Agreement</span>
        <h2 className="text-3xl font-serif text-white mt-1">
          File a Case <span className="text-gradient italic">/ New Escrow</span>
        </h2>
        <p className="text-xs font-mono text-gray-500 mt-2 leading-relaxed">
          Create a tamper-proof escrow agreement on Ethereum. A 2.5% platform fee is added.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-dark-800 border border-dark-700/60 p-8"
      >
        <StepIndicator step={step} />

        <AnimatePresence mode="wait">
          {/* ── STEP 0: Counterparty ── */}
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 border border-dark-600 bg-dark-700 text-gold-500"><User size={14} /></div>
                <div>
                  <h3 className="text-sm font-serif text-white">Counterparty</h3>
                  <p className="text-[10px] font-mono text-gray-600">Who is the other party in this agreement?</p>
                </div>
              </div>

              <InputField
                label="Respondent (Party B) Address"
                hint="This is the contractor, service provider, or other party receiving the funds on completion."
              >
                <input
                  type="text"
                  value={form.partyB}
                  onChange={update('partyB')}
                  placeholder="0x..."
                  className={inputClass}
                />
              </InputField>

              {form.partyB && !/^0x[a-fA-F0-9]{40}$/.test(form.partyB) && (
                <div className="flex items-center space-x-2 text-red-400 text-[10px] font-mono">
                  <AlertCircle size={10} />
                  <span>Invalid Ethereum address format</span>
                </div>
              )}
            </motion.div>
          )}

          {/* ── STEP 1: Terms ── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 border border-dark-600 bg-dark-700 text-gold-500"><DollarSign size={14} /></div>
                <div>
                  <h3 className="text-sm font-serif text-white">Contract Terms</h3>
                  <p className="text-[10px] font-mono text-gray-600">Define the financial terms of the agreement.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField label="Amount (ETH)" hint="Funds locked in escrow">
                  <input
                    type="number" step="0.0001" min="0"
                    value={form.amountEth} onChange={update('amountEth')}
                    placeholder="0.1"
                    className={inputClass}
                  />
                </InputField>
                <InputField label="Deadline (Days)" hint="Days until agreement expires">
                  <input
                    type="number" min="1" step="1"
                    value={form.deadlineDays} onChange={update('deadlineDays')}
                    placeholder="30"
                    className={inputClass}
                  />
                </InputField>
              </div>

              <InputField label="Brief Description (Optional)" hint="Describe the purpose of this agreement. Not stored on-chain.">
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={update('description')}
                  placeholder="E.g. Freelance web development for portfolio site..."
                  className={`${inputClass} resize-none`}
                />
              </InputField>

              <div className="bg-dark-700/50 border border-dark-600 p-4 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-mono text-gray-600 uppercase tracking-wider">Total Required</p>
                  <p className="text-[10px] font-mono text-gray-700 mt-0.5">Amount + 2.5% platform fee</p>
                </div>
                <span className="text-xl font-serif text-gold-500">{totalEth} ETH</span>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Review ── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 border border-dark-600 bg-dark-700 text-gold-500"><FileText size={14} /></div>
                <div>
                  <h3 className="text-sm font-serif text-white">Review & Sign</h3>
                  <p className="text-[10px] font-mono text-gray-600">Confirm the details before creating the contract.</p>
                </div>
              </div>

              <div className="border border-dark-600 divide-y divide-dark-600">
                {[
                  { label: 'Party A (You)', value: `${address?.slice(0, 10)}···${address?.slice(-8)}` },
                  { label: 'Party B', value: `${form.partyB.slice(0, 10)}···${form.partyB.slice(-8)}` },
                  { label: 'Escrow Amount', value: `${form.amountEth} ETH` },
                  { label: 'Platform Fee (2.5%)', value: `${(parseFloat(form.amountEth || 0) * 0.025).toFixed(5)} ETH` },
                  { label: 'Total to Send', value: `${totalEth} ETH` },
                  { label: 'Deadline', value: `${form.deadlineDays} days from now` },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-center px-4 py-3">
                    <span className="text-[10px] font-mono text-gray-600 uppercase tracking-wider">{row.label}</span>
                    <span className="text-xs font-mono text-gray-200">{row.value}</span>
                  </div>
                ))}
              </div>

              {form.description && (
                <div className="border border-dark-600 p-4">
                  <p className="text-[10px] font-mono text-gray-600 uppercase tracking-wider mb-2">Description</p>
                  <p className="text-xs font-mono text-gray-400 leading-relaxed">{form.description}</p>
                </div>
              )}

              <p className="text-[10px] font-mono text-gray-600 leading-relaxed">
                ⚠ By clicking "Create Escrow" you authorize a transaction to the EscrowFactory smart contract. Funds will be held securely until both parties agree to complete, or until a jury resolves any dispute.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Navigation ── */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-dark-700/60">
          <button
            onClick={handleBack}
            disabled={step === 0}
            className="flex items-center space-x-2 text-xs font-mono text-gray-500 hover:text-gray-300 disabled:opacity-0 transition-colors cursor-pointer"
          >
            <ArrowLeft size={12} /><span>Back</span>
          </button>

          {step < 2 ? (
            <button
              onClick={handleNext}
              disabled={!isConnected}
              className="flex items-center space-x-2 px-6 py-3 btn-gold"
            >
              <span>Continue</span>
              <ArrowRight size={12} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isPending || isConfirming}
              className="flex items-center space-x-2 px-8 py-3 btn-gold"
            >
              <span>
                {isPending ? 'Requesting Signature…' : isConfirming ? 'Confirming…' : 'Create Escrow'}
              </span>
              {!isPending && !isConfirming && <ArrowRight size={12} />}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default FileCase;
