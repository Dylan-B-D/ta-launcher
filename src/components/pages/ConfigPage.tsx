import { Container, Space } from "@mantine/core";
import ConfigBackupManager from "../ConfigBackupManager ";
import ConfigStep from "../ConfigStep";

const ConfigPage = () => {
  return (
    <>
      <ConfigStep />
      <Container fluid p="xs">
        <Space mt="lg" />
        <ConfigBackupManager />
      </Container>
    </>
  );
};

export default ConfigPage;
