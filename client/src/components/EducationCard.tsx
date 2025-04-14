import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface EducationCardProps {
  title: string;
  contentList: string[];
  icon: React.ReactNode;
  iconColor: string;
  iconBgColor: string;
  learnMoreColor: string;
  onLearnMore?: () => void;
}

const EducationCard = ({ 
  title, 
  contentList, 
  icon, 
  iconColor, 
  iconBgColor, 
  learnMoreColor,
  onLearnMore 
}: EducationCardProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700"
    >
      <div className="p-5">
        <div className="flex items-center mb-4">
          <div className={`w-10 h-10 rounded-full ${iconBgColor} flex items-center justify-center mr-3`}>
            <div className={`${iconColor}`}>{icon}</div>
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
        </div>
        
        <ul className="space-y-2">
          {contentList.map((item, index) => (
            <li key={index} className="flex items-start">
              <ChevronRight className={`w-4 h-4 ${iconColor} mt-1 flex-shrink-0`} />
              <span className="ml-2 text-gray-700 dark:text-gray-300 text-sm">{item}</span>
            </li>
          ))}
        </ul>
        
        {onLearnMore && (
          <button 
            onClick={onLearnMore}
            className={`mt-4 text-sm ${learnMoreColor} flex items-center`}
          >
            Learn more <ChevronRight className="ml-1 h-4 w-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default EducationCard;
