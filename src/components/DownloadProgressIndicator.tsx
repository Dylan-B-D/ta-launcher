// src/components/DownloadProgressIndicator.tsx
import { useEffect, useState } from "react";
import { RingProgress, Text, Group, Loader } from "@mantine/core";
import { useDownloadContext } from "../contexts/DownloadContext";
import { formatTime } from "../utils/formatters";

const DownloadProgressIndicator = () => {
  const { getTotalSize, getOverallProgress, getQueue } = useDownloadContext();
  const downloadPercentage = (getOverallProgress() / getTotalSize()) * 100;
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [lastProgress, setLastProgress] = useState<number>(0);
  const elapsedTime = (Date.now() - startTime) / 1000; // in seconds
  const downloadedBytes = getOverallProgress() - lastProgress;
  const downloadSpeed = downloadedBytes / elapsedTime; // bytes per second
  const remainingBytes = getTotalSize() - getOverallProgress();
  const estimatedTimeLeft = remainingBytes / downloadSpeed; // in seconds

  useEffect(() => {
    if (getQueue().length > 0 && lastProgress === 0) {
      setStartTime(Date.now());
      setLastProgress(getOverallProgress());
    }

    const interval = setInterval(() => {
      if (getQueue().length > 0) {
        setLastProgress(getOverallProgress());
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [getQueue, getOverallProgress, lastProgress]);

  return downloadPercentage < 100 ? (
    <>
      <RingProgress
        size={35}
        thickness={2}
        roundCaps
        label={
          <Text size="sm" ta="center">
            {Math.floor(downloadPercentage)}
          </Text>
        }
        sections={[{ value: downloadPercentage, color: "teal" }]}
        style={{ margin: 0 }}
      />
      <Text size="sm" ta="center">{`Estimated time left: ${formatTime(
        estimatedTimeLeft
      )}`}</Text>
    </>
  ) : (
    <Group align="center" gap="xs">
      <Loader color="cyan" size="sm" />
      <Text size="sm" c="cyan">
        Extracting files...
      </Text>
    </Group>
  );
};

export default DownloadProgressIndicator;
