import SimpleConfigSection from './SimpleConfigSection';
import AdvancedConfigSection from './AdvancedConfigSection';

interface ConfigToggleSectionProps {
    isAdvancedMode: boolean;
  }

  const ConfigToggleSection: React.FC<ConfigToggleSectionProps> = ({ isAdvancedMode }) => {
  return (
    <div>
      {!isAdvancedMode ? <SimpleConfigSection /> : <AdvancedConfigSection />}
    </div>
  );
};

export default ConfigToggleSection;

