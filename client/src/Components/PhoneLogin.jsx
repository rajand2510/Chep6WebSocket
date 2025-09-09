import { useSignIn } from '@clerk/clerk-react';
import { useState } from 'react';

const PhoneLogin = () => {
  const { signIn } = useSignIn();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');

  const sendOtp = async () => {
    try {
      await signIn.create({ identifier: phone });
      setOtpSent(true);
    } catch (err) {
      setError(err.errors?.[0]?.message || 'Failed to send OTP');
    }
  };
  const verifyOtp = async () => {
    try {
      const result = await signIn.attemptFirstFactor({ strategy: 'phone_code', code: otp });
      if (result.status === 'complete') {
        window.location.href = '/'; // redirect on success
      }
    } catch (err) {
      setError(err.errors?.[0]?.message || 'Invalid OTP');
    }
  };

  return (
    <div className="p-4 max-w-sm mx-auto">
      <h2 className="text-xl font-bold mb-2">Login via Phone</h2>
      {!otpSent ? (
        <>
          <input
            type="tel"
            placeholder="+91XXXXXXXXXX"
            className="border px-3 py-2 w-full mb-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button onClick={sendOtp} className="bg-blue-500 text-white px-4 py-2 rounded">
            Send OTP
          </button>
        </>
      ) : (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            className="border px-3 py-2 w-full mb-2"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button onClick={verifyOtp} className="bg-green-500 text-white px-4 py-2 rounded">
            Verify OTP
          </button>
        </>
      )}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default PhoneLogin;
