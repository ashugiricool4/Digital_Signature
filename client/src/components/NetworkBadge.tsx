import { NETWORKS } from '@/lib/constants';

interface NetworkBadgeProps {
  chainId: number;
}

const NetworkBadge = ({ chainId }: NetworkBadgeProps) => {
  const network = NETWORKS[chainId] || { name: 'Unknown Network', color: 'bg-gray-500' };
  
  return (
    <div className="flex items-center">
      <div className={`h-2.5 w-2.5 rounded-full ${network.color} mr-2`}></div>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {network.name}
        {network.isTestnet && <span className="ml-1 text-xs font-normal text-gray-500 dark:text-gray-400">(Testnet)</span>}
      </span>
    </div>
  );
};

export default NetworkBadge;
