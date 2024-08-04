import { useState, useEffect } from 'react';
import { Container, Grid, Card, Text, Group, Button, Modal, TextInput, Checkbox, CheckboxGroup, Badge } from "@mantine/core";
import { invoke } from "@tauri-apps/api/core";
import NotificationPopup from './NotificationPopup';
import { Notification } from '../interfaces';

interface BackupInfo {
    name: string;
    modified: string;
}

const ConfigBackupManager = () => {
    const [backups, setBackups] = useState<BackupInfo[]>([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [backupName, setBackupName] = useState("");
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
    const [notification, setNotification] = useState<Notification>({
        visible: false,
        message: '',
        title: '',
        color: '',
        icon: null,
    });
    const [confirmationModal, setConfirmationModal] = useState<{ visible: boolean, action: () => void, message: string }>({
        visible: false,
        action: () => { },
        message: '',
    });

    useEffect(() => {
        loadBackups();
    }, []);

    const loadBackups = async () => {
        try {
            const backups = await invoke<BackupInfo[]>("get_backups");
            const sortedBackups = backups.sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime());
            setBackups(sortedBackups);
        } catch (error) {
            console.error("Failed to load backups:", error);
        }
    };

    const createBackup = async () => {
        if (selectedFiles.length === 0) {
            setNotification({
                visible: true,
                message: 'No INI files selected for backup',
                title: 'Error',
                color: 'red',
                icon: null,
            });
            return;
        }

        const name = backupName.trim() ? backupName : "untitled";
        const duplicate = backups.some(backup => selectedFiles.some(file => backup.name === `${name}_${file}`));

        if (duplicate) {
            setNotification({
                visible: true,
                message: 'Backup name already exists for the selected files',
                title: 'Error',
                color: 'red',
                icon: null,
            });
            return;
        }

        try {
            await invoke("backup_ini_files", { backupName: name, selectedFiles });
            setModalOpen(false);
            loadBackups();
            setNotification({
                visible: true,
                message: 'Backup created successfully!',
                title: 'Success',
                color: 'green',
                icon: null,
            });
        } catch (error) {
            console.error("Failed to create backup:", error);
            setNotification({
                visible: true,
                message: 'Failed to create backup',
                title: 'Error',
                color: 'red',
                icon: null,
            });
        }
    };

    const confirmLoadBackup = (backupName: string) => {
        setConfirmationModal({
            visible: true,
            action: () => loadBackup(backupName),
            message: 'Are you sure you want to load this backup? This will overwrite the current configuration.',
        });
    };

    const loadBackup = async (backupName: string) => {
        try {
            await invoke("load_backup_ini_file", { backupName });
            setNotification({
                visible: true,
                message: 'Backup loaded successfully!',
                title: 'Success',
                color: 'green',
                icon: null,
            });
        } catch (error) {
            console.error("Failed to load backup:", error);
            setNotification({
                visible: true,
                message: 'Failed to load backup',
                title: 'Error',
                color: 'red',
                icon: null,
            });
        }
    };

    const confirmDeleteBackup = (backupName: string) => {
        setConfirmationModal({
            visible: true,
            action: () => deleteBackup(backupName),
            message: 'Are you sure you want to delete this backup? This action cannot be undone.',
        });
    };

    const deleteBackup = async (backupName: string) => {
        try {
            await invoke("delete_backup", { backupName });
            loadBackups();
            setNotification({
                visible: true,
                message: 'Backup deleted successfully!',
                title: 'Success',
                color: 'green',
                icon: null,
            });
        } catch (error) {
            console.error("Failed to delete backup:", error);
            setNotification({
                visible: true,
                message: 'Failed to delete backup',
                title: 'Error',
                color: 'red',
                icon: null,
            });
        }
    };

    return (
        <>
            <NotificationPopup
                visible={notification.visible}
                message={notification.message}
                title={notification.title}
                color={notification.color}
                onClose={() => setNotification(prev => ({ ...prev, visible: false }))}
                icon={notification.icon}
            />

            <Modal
                opened={confirmationModal.visible}
                onClose={() => setConfirmationModal(prev => ({ ...prev, visible: false }))}
                withCloseButton={false}
                centered
            >
                <Text>{confirmationModal.message}</Text>
                <Group mt="md" justify='space-between'>
                    <Button variant='light' color='cyan' style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)' }} onClick={() => setConfirmationModal(prev => ({ ...prev, visible: false }))}>Cancel</Button>
                    <Button variant='light' color="red" style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)' }} onClick={() => {
                        confirmationModal.action();
                        setConfirmationModal(prev => ({ ...prev, visible: false }));
                    }}>Confirm</Button>
                </Group>
            </Modal>

            <Container p={0} fluid>
                <Group justify='space-between'>
                    <Text fw={500}>Config Backups</Text>
                    <Button color='cyan' variant='light' onClick={() => setModalOpen(true)} style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)' }}>Create Backup</Button>
                </Group>

                <Grid mt="sm" gutter="md">
                    {backups.map(({ name, modified }) => {
                        const [backupName, fileType] = name.split('_');
                        return (
                            <Grid.Col span={6} key={name}>
                                <Card shadow="sm" padding="sm">
                                    <Group justify="space-between">
                                        <div>
                                            <Group gap="xs">
                                                <Group gap="xs">
                                                    {fileType === 'TribesInput.ini' && <Badge variant='light' color="cyan">Input</Badge>}
                                                    {fileType === 'tribes.ini' && <Badge variant='light' color="teal">Graphics</Badge>}
                                                </Group>
                                                <Text fw={500}>{backupName}</Text>
                                            </Group>
                                        </div>
                                        <div>
                                            <Text size="xs" c="dimmed">{modified}</Text>
                                        </div>
                                    </Group>
                                    <Group grow align="right" mt="xs">
                                        <Button color='cyan' variant='light' size="xs" onClick={() => confirmLoadBackup(name)} style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)' }}>Load</Button>
                                        <Button variant='light' size="xs" color="red" onClick={() => confirmDeleteBackup(name)} style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)' }}>Delete</Button>
                                    </Group>
                                </Card>
                            </Grid.Col>
                        );
                    })}
                </Grid>

                <Modal
                    opened={isModalOpen}
                    onClose={() => setModalOpen(false)}
                    centered
                    withCloseButton={false}
                >
                    <TextInput
                        label="Backup Name"
                        placeholder="Enter a name for your backup"
                        value={backupName}
                        onChange={(event) => setBackupName(event.currentTarget.value)}
                        styles={{
                            input: { padding: '6px', fontSize: '14px', backgroundColor: 'rgba(255, 255, 255, 0.05)' },
                        }}
                    />
                    <CheckboxGroup
                        label="Select INI files to backup"
                        onChange={setSelectedFiles}
                        value={selectedFiles}
                    >
                        <Checkbox value="TribesInput.ini" label="TribesInput.ini" />
                        <Checkbox mt='4px' value="tribes.ini" label="tribes.ini" />
                    </CheckboxGroup>
                    <Button color='cyan' variant='light' style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)' }} onClick={createBackup} mt="sm">Save Backup</Button>
                </Modal>
            </Container>
        </>
    );
};

export default ConfigBackupManager;