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
      <Title order={4}>Version 0.1.4</Title>
      <Text size="sm" c="dimmed">
        Last updated: 2026.03.08
      </Text>
    </div>
    <List fz="sm" c="dimmed" mt="sm">
      <List.Item>Added Lag comp dll support.</List.Item>
      <List.Item>Fixed player count tooltip overflow.</List.Item>
      <List.Item>Update app icon.</List.Item>
    </List>
  </Card>
);
export default ReleaseNotesCard;
