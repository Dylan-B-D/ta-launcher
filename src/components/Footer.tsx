import { UnstyledButton, Group, Text } from "@mantine/core";
import DownloadProgressIndicator from "./DownloadProgressIndicator";
import { useDownloadContext } from "../contexts/DownloadContext";

function Footer() {
  const { getQueue } = useDownloadContext();
  const playerCount1 = 10;
  const playerCount2 = 20;

  return (
    <Group p='md' justify="space-between" align="center" style={{ width: '100%' }}>
      <Group>
        {getQueue().length > 0 ? (
          <DownloadProgressIndicator />
        ) : (
          <>
            <Text ta="center" size="sm">
              Community: {playerCount1}
            </Text>
            <Text ta="center" size="sm">
              PUG: {playerCount2}
            </Text>
          </>
        )}
      </Group>
      <button className='glowing-btn'><span className='glowing-txt'>L<span className='faulty-letter'>A</span>UNCH</span></button>
    </Group>
  );
}

export default Footer;