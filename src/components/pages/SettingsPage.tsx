import { Container, Button, Title, Space } from "@mantine/core";

const SettingsPage = () => {
  const handleButtonClick = () => {
    localStorage.setItem("isFirstTime", "true");
    window.location.reload();
  };

  return (
    <Container>
      <Title>Settings</Title>
      <Space h='md'/>
      <Button color="cyan" variant='light' onClick={handleButtonClick}>Return to First Time Setup</Button>
    </Container>
  );
};

export default SettingsPage;