import { Button, Container, Group, Text } from "@mantine/core";
import DownloadProgressIndicator from "./DownloadProgressIndicator";
import { useDownloadContext } from "../contexts/DownloadContext";

function Footer() {
  const { getQueue } = useDownloadContext();
  const playerCount1 = 10;
  const playerCount2 = 20;

  return (
    <Container size="md">
      <Group justify='space-between'>
        {getQueue().length > 0 ? (
          <DownloadProgressIndicator />
        ) : (
          <>
            <Text ta="center" size="sm">
              Community Player Count: {playerCount1}
            </Text>
            <Text ta="center" size="sm">
              PUG Player Count: {playerCount2}
            </Text>
          </>
        )}
        <Button>Launch</Button>
      </Group>
    </Container>
  );
}

export default Footer;
