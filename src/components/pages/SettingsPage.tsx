import { Container, Button, Title, Space, Text, Paper, Divider } from "@mantine/core";
import LaunchOptionsStep from "../LaunchOptionsStep";

const SettingsPage = () => {
  const handleButtonClick = () => {
    localStorage.setItem("isFirstTime", "true");
    window.location.reload();
  };

  return (
    <Container>
      <Paper shadow="sm" p="md">
        <Title order={3}>Settings</Title>
        <Space h='md'/>
        <Text c='dimmed'>Return to the first time setup</Text>
        <Button color="cyan" variant='light' onClick={handleButtonClick}>Return to First Time Setup</Button>
        <Divider mt='sm' h='sm'/>
        <LaunchOptionsStep />
      </Paper>
    </Container>
  );
};

export default SettingsPage;