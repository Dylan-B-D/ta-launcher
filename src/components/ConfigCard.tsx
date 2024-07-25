import { Paper, Text, Group, Box } from '@mantine/core';
import classes from './CardGradient.module.css';

interface ConfigCardProps {
    title: string;
    author: string;
    description: string;
    onApply: () => void;
}

export function ConfigCard({ title, author, description, onApply }: ConfigCardProps) {
    return (
        <Paper
            withBorder
            radius="sm"
            className={classes.card}
            p={0}
            style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
            onClick={onApply}
        >
            <Group justify="space-between" align="start" wrap="nowrap" p={0} style={{ padding: '2px 8px' }}>
                <Box style={{ paddingLeft: 10, paddingRight: 5 ,display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Box style={{ display: 'flex', flexDirection: 'column' }}>
                        <Text size="sm" fw={600} lineClamp={1}>
                            {title}
                        </Text>
                    </Box>
                    <Text size="xs" c="dimmed" lineClamp={1}>
                        by {author}
                    </Text>
                </Box>
            </Group>
            <Box style={{ flex: 1, paddingLeft: 10, paddingRight: 2, paddingBottom: 2 }}>
                <Text c="dimmed" size="xs" lineClamp={2} style={{ textAlign: 'left' }}>
                    {description}
                </Text>
            </Box>
        </Paper>
    );
}