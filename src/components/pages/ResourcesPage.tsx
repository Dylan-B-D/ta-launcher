import { Center } from "@mantine/core";
import UsefulResources from "../UsefulResources";

const ResourcesPage = () => {
  return (
    <Center
      w="100%"
      p="lg"
      style={{ flexDirection: "column", textAlign: "center", height: "100%" }}
    >
      <UsefulResources />
    </Center>
  );
};

export default ResourcesPage;
