import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';

export default function PaymentCancel() {
  return (
    <div className="bg-[#f5f5f5] min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-xl border max-w-md w-full p-8 text-center">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Payment Cancelled</h1>
        <p className="text-sm text-gray-600 mb-6">No charge was made. You can retry from your order page.</p>
        <Link to="/orders" className="inline-block bg-[#00A651] hover:bg-[#008a44] text-white px-6 py-2.5 rounded-full font-bold">
          Back to Orders
        </Link>
      </div>
    </div>
  );
}
