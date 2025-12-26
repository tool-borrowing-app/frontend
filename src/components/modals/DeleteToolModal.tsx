import { deleteTool } from "@/apiClient/modules/tool";
import { ToolDto } from "@/app/eszkozeim/page";
import { Button, Group, Modal, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";

export function DeleteToolModal({
  selectedToolIdForDelete,
  fetchTools,
  isDeleteToolModelOpen,
  setIsDeleteToolModelOpen,
}: {
  selectedToolIdForDelete: ToolDto | undefined;
  fetchTools: () => Promise<void>;
  isDeleteToolModelOpen: boolean;
  setIsDeleteToolModelOpen: (open: boolean) => void;
}) {
  const handleDeleteTool = async () => {
    if (!selectedToolIdForDelete) return;
    const result = await deleteTool(selectedToolIdForDelete.id);
    if (result.status === 204) {
      setIsDeleteToolModelOpen(false);
      notifications.show({
        withBorder: true,
        title: "Sikeres törlés!",
        message: "Az eszköz törlése sikeresen megtörtént.",
        color: "green",
      });
      await fetchTools();
    }
  };

  return (
    <Modal
      opened={isDeleteToolModelOpen}
      onClose={() => setIsDeleteToolModelOpen(false)}
      title="Eszköz törlése"
      overlayProps={{
        backgroundOpacity: 0.2,
      }}
      transitionProps={{
        transition: "fade",
        duration: 150,
        timingFunction: "linear",
      }}
      centered
    >
      <Group>
        <Text>Biztos benne, hogy törölni szeretné ezt az eszközt?</Text>
        <div className="flex gap-x-4 w-full justify-end">
          <Button
            variant="subtle"
            onClick={() => setIsDeleteToolModelOpen(false)}
          >
            Mégse
          </Button>
          <Button variant="primary" onClick={() => handleDeleteTool()}>
            Igen
          </Button>
        </div>
      </Group>
    </Modal>
  );
}
