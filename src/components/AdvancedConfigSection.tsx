import { useState } from 'react';
import { Select, Textarea } from '@mantine/core';

const AdvancedConfigSection = () => {
  const [selectedIni, setSelectedIni] = useState('config.ini');
  const [iniContent, setIniContent] = useState('...'); // Placeholder INI content

  return (
    <div>
      <Select
        label="Select INI File"
        value={selectedIni}
        onChange={setSelectedIni}
        data={['config.ini', 'input.ini']}
      />
      <Textarea
        label="INI Content"
        value={iniContent}
        onChange={(event) => setIniContent(event.currentTarget.value)}
        minRows={10}
      />
    </div>
  );
};

export default AdvancedConfigSection;
