import { useEffect, useState } from 'react';
import { Paper, Text, Button, TableData, Table, useMantineTheme } from '@mantine/core';
import { invoke } from '@tauri-apps/api/tauri';
import { hexToRgba } from '../utils';

const LogFileSection = () => {
    const theme = useMantineTheme();
    const [logStats, setLogStats] = useState({
        size: 'Calculating...',  // Initial placeholder values
        itemCount: 'Calculating...',
        oldestFileDate: 'Calculating...'
    });

    useEffect(() => {
        const fetchLogStats = async () => {
            try {
                const stats = await invoke('check_directory_stats',);
                console.log(stats); // Log to see the exact format

                setLogStats({
                    size: stats.total_size, // Already formatted in Rust
                    itemCount: stats.item_count.toLocaleString(),
                    oldestFileDate: stats.oldest_file_date ? new Date(stats.oldest_file_date).toLocaleDateString() : 'N/A'
                });
            } catch (error) {
                console.error('Error fetching log stats:', error);
            }
        };

        fetchLogStats();
    }, []);

    const handleClearLog = () => {
        // Logic to clear log
    };

   
    // Define table data
    const tableData: TableData = {
        body: [
            ['Crash Logs Size', logStats.size],
            ['Files', logStats.itemCount],
            ['Oldest', logStats.oldestFileDate]
        ]
    };

    return (
        <Paper style={{
            border: `${theme.colors.dark[4]} 1px solid`,
            borderRadius: '8px',
            padding: '10px',
          }}>
            <Table data={tableData} style={{ background: 'transparent' }} /> {/* Remove background color */}
            <Button onClick={handleClearLog}>Delete all Logs</Button>
        </Paper>
    );
};


export default LogFileSection;
