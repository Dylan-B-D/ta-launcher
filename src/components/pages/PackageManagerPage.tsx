import { Container } from "@mantine/core";
import PackagesTable from "../PackageTable";

const PackageManagerPage = () => {
  return (
    <Container fluid p='md'>
      <PackagesTable />
    </Container>
  );
};

export default PackageManagerPage;
