import { Container } from "@mantine/core";
import ReleaseNotesCard from "../ReleaseNotesCard";
import FolderLinks from "../FolderLinks";

const MainPage = () => {
  return (
    <Container mt="md">
      <ReleaseNotesCard />
      <FolderLinks />
    </Container>
  );
};

export default MainPage;
