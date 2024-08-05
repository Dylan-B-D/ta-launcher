import { useState, useEffect, useRef } from "react";
import {
  Button,
  Table,
  Text,
  Space,
  Fieldset,
  ScrollArea,
  Group,
  Modal,
  Tooltip,
  Center,
} from "@mantine/core";
import { invoke } from "@tauri-apps/api/core";
import LocationChart from "../RouteGraphs";
import RouteFilters from "../RouteFilters";

interface Route {
  game_mode: string;
  map: string;
  side: string;
  class: string;
  username: string;
  route_name: string;
  time: string;
  file_name: string;
}

interface DecodedRoute {
  positions: Position[];
}

interface Position {
  loc: [number, number, number];
}

type MirroringAxis = "xy" | "x" | "y";

const RouteManagerPage = () => {
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const [isPythonInstalled, setIsPythonInstalled] = useState(false);
  const controlsRef = useRef<HTMLDivElement>(null);
  const [scrollAreaHeight, setScrollAreaHeight] = useState<number>(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [decodedRoutes, setDecodedRoutes] = useState<DecodedRoute[]>([]);
  const locations = decodedRoutes.map((route) =>
    route.positions.map((pos) => ({
      x: pos.loc[0],
      y: pos.loc[1],
      z: pos.loc[2],
    }))
  );
  const [isGraphModalOpen, setIsGraphModalOpen] = useState(false);
  const [isMirrorModalOpen, setIsMirrorModalOpen] = useState(false);
  const [, setSelectedAxis] = useState("xy");

  const [filters, setFilters] = useState({
    gameMode: "",
    map: "",
    side: "",
    class: "",
    username: "",
    routeName: "",
    routeTime: "",
  });

  useEffect(() => {
    fetchRoutes();
  }, []);

  useEffect(() => {
    // Check if Python is installed
    const checkPythonInstallation = async () => {
      try {
        const isInstalled = await invoke<boolean>("check_python_installed");
        setIsPythonInstalled(isInstalled);
      } catch (error) {
        console.error("Error checking Python installation:", error);
      }
    };

    checkPythonInstallation();
  }, []);

  const fetchRoutes = async () => {
    try {
      const data: Route[] = await invoke("get_route_files");
      setRoutes(data);
    } catch (error) {
      console.error("Error fetching routes:", error);
    }
  };

  useEffect(() => {
    const updateScrollAreaHeight = () => {
      const windowHeight = window.innerHeight;
      const filtersHeight = filtersRef.current?.offsetHeight || 0;
      const controlsHeight = controlsRef.current?.offsetHeight || 0;
      const otherElementsHeight = filtersHeight + controlsHeight;

      if (mainContainerRef.current) {
        const mainContainerTopOffset =
          mainContainerRef.current.getBoundingClientRect().top;
        setScrollAreaHeight(
          windowHeight - mainContainerTopOffset - otherElementsHeight - 110 - 26
        );
      }
    };

    window.addEventListener("resize", updateScrollAreaHeight);
    updateScrollAreaHeight();

    return () => window.removeEventListener("resize", updateScrollAreaHeight);
  }, []);

  const resetFilters = () => {
    setFilters({
      gameMode: "",
      map: "",
      side: "",
      class: "",
      username: "",
      routeName: "",
      routeTime: "",
    });
  };

  const confirmDelete = async () => {
    try {
      for (const file of selectedRows) {
        await invoke("delete_route_file", { file: file });
      }
      fetchRoutes();
      setSelectedRows(new Set());
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting files:", error);
    }
  };

  const handleDeleteClick = () => {
    if (selectedRows.size > 0) {
      setIsDeleteModalOpen(true);
    } else {
      console.error("No files selected for deletion.");
    }
  };

  const handleFilterChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFilters({ ...filters, [field]: event.target.value });
    };

  const deselectAll = () => {
    setSelectedRows(new Set());
  };

  const handleRowSelect = (fileName: string) => {
    setSelectedRows((prev) => {
      const newSelectedRows = new Set(prev);
      if (newSelectedRows.has(fileName)) {
        newSelectedRows.delete(fileName);
      } else {
        newSelectedRows.add(fileName);
      }
      return newSelectedRows;
    });
  };

  const decodeSelectedRoutes = async () => {
    try {
      const newDecodedRoutes = [];

      for (const fileName of selectedRows) {
        const decodedData = await invoke("decode_route", { file: fileName });
        newDecodedRoutes.push(decodedData);
      }

      setDecodedRoutes(newDecodedRoutes as DecodedRoute[]);
      openGraphModal();
      console.log(newDecodedRoutes);
    } catch (error) {
      console.error("Error decoding routes:", error);
    }
  };

  const openGraphModal = () => {
    setIsGraphModalOpen(true);
  };

  const mirrorSelectedRoutesWithAxis = async (axis: string) => {
    setIsMirrorModalOpen(false); // Close the modal

    try {
      for (const fileName of selectedRows) {
        const response = await invoke("python_route_decoder", {
          file: fileName,
          axis: axis,
        });
        console.log("Mirrored route:", response);
      }

      fetchRoutes();
    } catch (error) {
      console.error("Error mirroring routes:", error);
    }
  };

  const openMirrorModal = () => {
    setIsMirrorModalOpen(true);
  };

  const filteredRoutes = routes.filter(
    (route) =>
      route.game_mode.toLowerCase().includes(filters.gameMode.toLowerCase()) &&
      route.map.toLowerCase().includes(filters.map.toLowerCase()) &&
      route.side.toLowerCase().includes(filters.side.toLowerCase()) &&
      route.class.toLowerCase().includes(filters.class.toLowerCase()) &&
      route.username.toLowerCase().includes(filters.username.toLowerCase()) &&
      route.route_name
        .toLowerCase()
        .includes(filters.routeName.toLowerCase()) &&
      route.time.toLowerCase().includes(filters.routeTime.toLowerCase())
  );

  const mirroringDescriptions: Record<MirroringAxis, string> = {
    xy: "Mirrors on both axis. Use on symetrical maps such as Arx Novena",
    x: "Mirrors on only the X axis. Use on maps that are symetrical along the X axis.",
    y: "Mirrors on only the Y axis. Use on maps that are symetrical along the Y axis.",
  };

  return (
    <>
      <Modal
        opened={isGraphModalOpen}
        onClose={() => setIsGraphModalOpen(false)}
        fullScreen
        radius={0}
      >
        <LocationChart locations={locations} />
      </Modal>
      <Modal
        opened={isMirrorModalOpen}
        onClose={() => setIsMirrorModalOpen(false)}
        centered
        withCloseButton={false}
      >
        <div>
          {(["xy", "x", "y"] as MirroringAxis[]).map((axis) => (
            <Tooltip key={axis} label={mirroringDescriptions[axis]} withArrow>
              <Button
                variant="light"
                color="cyan"
                onClick={() => {
                  setSelectedAxis(axis);
                  mirrorSelectedRoutesWithAxis(axis);
                }}
                style={{
                  marginRight: "10px",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
                }}
              >
                {axis.toUpperCase()} Mirroring
              </Button>
            </Tooltip>
          ))}
        </div>
      </Modal>
      <div ref={mainContainerRef} style={{ padding: "16px" }}>
        <div ref={filtersRef}>
          <RouteFilters
            filters={filters}
            handleFilterChange={handleFilterChange}
          />
        </div>

        <div ref={controlsRef}>
          <Fieldset legend="Controls">
            <Group style={{ display: "flex", width: "100%" }}>
              <div style={{ flexGrow: 1 }}>
                <Button
                  variant="light"
                  color="cyan"
                  style={{
                    width: "100%",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
                  }}
                  onClick={decodeSelectedRoutes}
                >
                  View Selected
                </Button>
              </div>
              <div style={{ flexGrow: 1 }}>
                {isPythonInstalled ? (
                  <Button
                    variant="light"
                    color="cyan"
                    style={{
                      width: "100%",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
                    }}
                    onClick={openMirrorModal}
                  >
                    Mirror Selected
                  </Button>
                ) : (
                  <Tooltip
                    label="Currently a Python install is required to mirror routes"
                    withArrow
                  >
                    <Button
                      variant="light"
                      color="cyan"
                      style={{
                        width: "100%",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
                      }}
                      disabled
                    >
                      Mirror Selected
                    </Button>
                  </Tooltip>
                )}
              </div>
              <div style={{ flexGrow: 1 }}>
                <Button
                  variant="light"
                  color="cyan"
                  style={{
                    width: "100%",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
                  }}
                  onClick={resetFilters}
                >
                  Reset Filters
                </Button>
              </div>
              <div style={{ flexGrow: 1 }}>
                <Button
                  variant="light"
                  color="cyan"
                  style={{
                    width: "100%",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
                  }}
                  onClick={deselectAll}
                >
                  Deselect All
                </Button>
              </div>
              <div style={{ flexGrow: 1 }}>
                <Button
                  variant="light"
                  color="red"
                  style={{
                    width: "100%",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
                  }}
                  onClick={handleDeleteClick}
                >
                  Delete Selected
                </Button>
              </div>
            </Group>
          </Fieldset>
        </div>

        <Space h="xs" />
        <Center>
          <Text>
            Click on a row to select or deselect it. Routes displayed:{" "}
            {filteredRoutes.length}
          </Text>
        </Center>
        <Space h="xs" />
        <ScrollArea style={{ height: `${scrollAreaHeight}px` }}>
          <Table
            withRowBorders={false}
            verticalSpacing="0"
            style={{ borderRadius: "8px " }}
          >
            <Table.Thead style={{ textAlign: "left", borderRadius: "8px" }}>
              <Table.Tr style={{ textAlign: "left", borderRadius: "8px" }}>
                <Table.Th
                  style={{
                    position: "sticky",
                    top: 0,
                    background: "rgba(50,50,50)",
                    borderRadius: "8px 0 0 0",
                  }}
                >
                  Game Mode
                </Table.Th>
                <Table.Th
                  style={{
                    position: "sticky",
                    top: 0,
                    background: "rgba(50,50,50)",
                  }}
                >
                  Map
                </Table.Th>
                <Table.Th
                  style={{
                    position: "sticky",
                    top: 0,
                    background: "rgba(50,50,50)",
                  }}
                >
                  Side
                </Table.Th>
                <Table.Th
                  style={{
                    position: "sticky",
                    top: 0,
                    background: "rgba(50,50,50)",
                  }}
                >
                  Class
                </Table.Th>
                <Table.Th
                  style={{
                    position: "sticky",
                    top: 0,
                    background: "rgba(50,50,50)",
                  }}
                >
                  Username
                </Table.Th>
                <Table.Th
                  style={{
                    position: "sticky",
                    top: 0,
                    background: "rgba(50,50,50)",
                  }}
                >
                  Route Name
                </Table.Th>
                <Table.Th
                  style={{
                    position: "sticky",
                    top: 0,
                    background: "rgba(50,50,50)",
                    borderRadius: "0 8px 0 0",
                  }}
                >
                  Route Time
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody style={{ userSelect: "none" }}>
              {filteredRoutes.map((route, index) => (
                <Table.Tr
                  key={index}
                  style={{
                    textShadow: selectedRows.has(route.file_name)
                      ? "1px 1px 2px black, 0 0 1em black, 0 0 0.2em black"
                      : "none",
                    backgroundColor: selectedRows.has(route.file_name)
                      ? "teal"
                      : "transparent",
                    cursor: "pointer",
                    borderBottom: "1px solid",
                    borderColor: "rgba(255, 255, 255,0.055)",
                  }}
                  onClick={() => handleRowSelect(route.file_name)}
                >
                  <Table.Td>{route.game_mode}</Table.Td>
                  <Table.Td>{route.map}</Table.Td>
                  <Table.Td>{route.side}</Table.Td>
                  <Table.Td>{route.class}</Table.Td>
                  <Table.Td>{route.username}</Table.Td>
                  <Table.Td>{route.route_name}</Table.Td>
                  <Table.Td>{route.time}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
        <Modal
          opened={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          size="lg"
          centered
          withCloseButton={false}
        >
          <Text>
            Are you sure you want to delete the following route files?
          </Text>
          <ScrollArea style={{ maxHeight: "200px" }}>
            <ul>
              {Array.from(selectedRows).map((file, index) => (
                <li key={index}>{file}</li>
              ))}
            </ul>
          </ScrollArea>
          <Group mt="md">
            <Button
              variant="light"
              color="cyan"
              onClick={() => setIsDeleteModalOpen(false)}
              style={{ boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)" }}
            >
              Cancel
            </Button>
            <Button
              variant="light"
              color="red"
              onClick={confirmDelete}
              style={{ boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)" }}
            >
              Delete
            </Button>
          </Group>
        </Modal>
      </div>
    </>
  );
};

export default RouteManagerPage;
