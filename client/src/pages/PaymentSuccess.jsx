import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  return (
    <div className="bg-[#f5f5f5] min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-xl border max-w-md w-full p-8 text-center">
        <CheckCircle className="w-16 h-16 text-[#00A651] mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Payment Successful</h1>
        <p className="text-sm text-gray-600 mb-6">Thank you! Your order has been paid. The supplier has been notified.</p>
        {sessionId && <p className="text-xs text-gray-400 mb-6 break-all">Session: {sessionId.slice(0, 20)}...</p>}
        <Link to="/orders" className="inline-block bg-[#00A651] hover:bg-[#008a44] text-white px-6 py-2.5 rounded-full font-bold">
          View My Orders
        </Link>
      </div>
    </div>
  );
}
