import { useEffect, useState } from 'react';
import { Paper, Button, TableData, Table, useMantineTheme } from '@mantine/core';
import { invoke } from '@tauri-apps/api/tauri';

interface Stats {
    total_size: string;
    item_count: number;
    oldest_file_date: string | null;
}


const LogFileSection = () => {
    const theme = useMantineTheme();
    const [logStats, setLogStats] = useState({
        size: 'Calculating...',  // Initial placeholder values
        itemCount: 'Calculating...',
        oldestFileDate: 'Calculating...'
    });

    useEffect(() => {
        fetchLogStats();
    }, []);

    const fetchLogStats = async () => {
        try {
            const stats = await invoke('check_directory_stats') as Stats;
            setLogStats({
                size: stats.total_size,
                itemCount: stats.item_count.toLocaleString(),
                oldestFileDate: stats.oldest_file_date ? new Date(stats.oldest_file_date).toLocaleDateString() : 'N/A'
            });
        } catch (error) {
            console.error('Error fetching log stats:', error);
        }
    };

    const handleClearLog = async () => {
        try {
            await invoke('clear_log_folder');
            // After clearing the log folder, fetch the updated log stats
            fetchLogStats();
        } catch (error) {
            console.error('Error clearing log folder:', error);
        }
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