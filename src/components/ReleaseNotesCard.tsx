import { Card, List, Title, Text } from "@mantine/core";

const ReleaseNotesCard = () => (
  <Card shadow="sm" padding="md" mb="md">
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Title order={4}>Version 0.1.3-beta</Title>
      <Text size="sm" c="dimmed">
        Last updated: 2024.08.10
      </Text>
    </div>
    <List fz="sm" c="dimmed" mt="sm">
      <List.Item>Switched the main installer to Microsoft's Installer (MSI).</List.Item>
    </List>
  </Card>
);
export default ReleaseNotesCard;
