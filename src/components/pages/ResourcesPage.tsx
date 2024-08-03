import { Center } from "@mantine/core";
import UsefulResources from "../UsefulResources";

const ResourcesPage = () => {
  return (
    <Center p='lg' style={{ flexDirection: 'column', textAlign: 'center', height: '100%' }}>
      <UsefulResources />
    </Center>
  );
};

export default ResourcesPage;
