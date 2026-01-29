"use client";

import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";

interface LocalArea {
  id: number;
  name: string;
}

interface State {
  id: number;
  name: string;
  localAreas: LocalArea[];
}

export default function LocationsPage() {
  const [states, setStates] = useState<State[]>([]);
  const [openStateModal, setOpenStateModal] = useState(false);
  const [openLocalAreaModal, setOpenLocalAreaModal] = useState(false);
  const [selectedStateId, setSelectedStateId] = useState<number | null>(null);
  
  const [stateForm, setStateForm] = useState({
    name: "",
  });

  const [localAreaForm, setLocalAreaForm] = useState({
    name: "",
  });

  const handleAddState = () => {
    if (!stateForm.name.trim()) return;

    setStates((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: stateForm.name,
        localAreas: [],
      },
    ]);

    setStateForm({ name: "" });
    setOpenStateModal(false);
  };

  const handleAddLocalArea = () => {
    if (!localAreaForm.name.trim() || !selectedStateId) return;

    setStates((prev) =>
      prev.map((state) =>
        state.id === selectedStateId
          ? {
              ...state,
              localAreas: [
                ...state.localAreas,
                {
                  id: Date.now(),
                  name: localAreaForm.name,
                },
              ],
            }
          : state
      )
    );

    setLocalAreaForm({ name: "" });
    setOpenLocalAreaModal(false);
    setSelectedStateId(null);
  };

  const handleDeleteState = (stateId: number) => {
    if (confirm("Are you sure you want to delete this state and all its local areas?")) {
      setStates((prev) => prev.filter((state) => state.id !== stateId));
    }
  };

  const handleDeleteLocalArea = (stateId: number, localAreaId: number) => {
    if (confirm("Are you sure you want to delete this local area?")) {
      setStates((prev) =>
        prev.map((state) =>
          state.id === stateId
            ? {
                ...state,
                localAreas: state.localAreas.filter(
                  (area) => area.id !== localAreaId
                ),
              }
            : state
        )
      );
    }
  };

  const openAddLocalAreaModal = (stateId: number) => {
    setSelectedStateId(stateId);
    setOpenLocalAreaModal(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-black dark:text-white">
          Location Management
        </h1>
        <Button onClick={() => setOpenStateModal(true)}>
          + Add State
        </Button>
      </div>

      {/* States List */}
      {states.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No states added yet. Click &quot;Add State&quot; to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {states.map((state) => (
            <div
              key={state.id}
              className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden"
            >
              {/* State Header */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-black dark:text-white">
                  {state.name}
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => openAddLocalAreaModal(state.id)}
                  >
                    + Add Local Area
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleDeleteState(state.id)}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Delete State
                  </Button>
                </div>
              </div>

              {/* Local Areas Table */}
              <div className="p-4">
                {state.localAreas.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No local areas added for this state.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                        <TableRow>
                          <TableCell
                            isHeader
                            className="px-5 py-3 text-theme-xs text-gray-500"
                          >
                            Local Area Name
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-5 py-3 text-theme-xs text-gray-500"
                          >
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {state.localAreas.map((localArea) => (
                          <TableRow key={localArea.id}>
                            <TableCell className="px-5 py-4 text-black dark:text-white">
                              {localArea.name}
                            </TableCell>
                            <TableCell className="px-5 py-4">
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleDeleteLocalArea(state.id, localArea.id)
                                }
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add State Modal */}
      <Modal
        isOpen={openStateModal}
        onClose={() => {
          setOpenStateModal(false);
          setStateForm({ name: "" });
        }}
        showCloseButton={true}
      >
        <div className="text-white p-6">
          <h1 className="text-2xl font-semibold mb-4">Add State</h1>
          <div className="space-y-4">
            <div>
              <Label className="mb-2">State Name</Label>
              <Input
                placeholder="e.g., California, New York, Texas"
                type="text"
                value={stateForm.name}
                onChange={(e) =>
                  setStateForm({ ...stateForm, name: e.target.value })
                }
                className="w-full"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                onClick={() => {
                  setOpenStateModal(false);
                  setStateForm({ name: "" });
                }}
                className="bg-gray-600 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button onClick={handleAddState}>Add State</Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Add Local Area Modal */}
      <Modal
        isOpen={openLocalAreaModal}
        onClose={() => {
          setOpenLocalAreaModal(false);
          setLocalAreaForm({ name: "" });
          setSelectedStateId(null);
        }}
        showCloseButton={true}
      >
        <div className="text-white p-6">
          <h1 className="text-2xl font-semibold mb-4">Add Local Area</h1>
          <div className="space-y-4">
            <div>
              <Label className="mb-2">Local Area Name</Label>
              <Input
                placeholder="e.g., Downtown, Midtown, Uptown"
                type="text"
                value={localAreaForm.name}
                onChange={(e) =>
                  setLocalAreaForm({ ...localAreaForm, name: e.target.value })
                }
                className="w-full"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                onClick={() => {
                  setOpenLocalAreaModal(false);
                  setLocalAreaForm({ name: "" });
                  setSelectedStateId(null);
                }}
                className="bg-gray-600 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button onClick={handleAddLocalArea}>Add Local Area</Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

