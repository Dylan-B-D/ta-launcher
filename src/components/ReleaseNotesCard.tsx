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
      <Title order={4}>Version 0.1.2-beta2</Title>
      <Text size="sm" c="dimmed">
        Last updated: 2024.08.05
      </Text>
    </div>
    <List fz="sm" c="dimmed" mt="sm">
      <List.Item>Fix incorrect config check on setup.</List.Item>
      <List.Item>Removed inches from sensitivity calculator due to issues.</List.Item>
    </List>
  </Card>
);
export default ReleaseNotesCard;
