import { useState } from 'react';
import { Paper, Select, Text, Textarea } from '@mantine/core';

const AdvancedConfigSection = () => {
  // const [selectedIni, setSelectedIni] = useState('config.ini');
  const [iniContent, setIniContent] = useState('...'); // Placeholder INI content

  return (
    <div>
      <Paper>
        <Text>
          [Under Contruction]
        </Text>
      </Paper>
      <Select
        label="Select INI File"
        // value={selectedIni}
        // onChange={setSelectedIni}
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
