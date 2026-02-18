"use client";

import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import RichTextEditor from "@/components/form/input/RichTextEditor";
import TextArea from "@/components/form/input/TextArea";
import {
  addCityApi,
  addStateApi,
  deleteCityApi,
  deleteStateApi,
  getStateCitiesApi,
  updateCityApi,
  updateStateApi,
  type ApiCity,
  type StateWithCitiesItem,
} from "@/lib/api";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { useDropzone } from "react-dropzone";
import Badge from "@/components/ui/badge/Badge";

export default function LocationsPage() {
  const [states, setStates] = useState<StateWithCitiesItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingState, setSavingState] = useState(false);
  const [savingCity, setSavingCity] = useState(false);
  const [updatingStateId, setUpdatingStateId] = useState<string | null>(null);
  const [deletingStateId, setDeletingStateId] = useState<string | null>(null);
  const [deletingCityId, setDeletingCityId] = useState<string | null>(null);
  const [openStateModal, setOpenStateModal] = useState(false);
  const [openEditStateModal, setOpenEditStateModal] = useState(false);
  const [openLocalAreaModal, setOpenLocalAreaModal] = useState(false);
  const [openEditCityModal, setOpenEditCityModal] = useState(false);
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const [editingState, setEditingState] = useState<StateWithCitiesItem | null>(null);
  const [editingCity, setEditingCity] = useState<ApiCity | null>(null);
  const [expandedDescriptionId, setExpandedDescriptionId] = useState<string | null>(null);
  const [updatingCityId, setUpdatingCityId] = useState<string | null>(null);

  const [stateForm, setStateForm] = useState<{
    name: string;
    description: string;
    imageFile: File | null;
  }>({ name: "", description: "", imageFile: null });
  const [localAreaForm, setLocalAreaForm] = useState<{
    name: string;
    description: string;
    imageFile: File | null;
  }>({ name: "", description: "", imageFile: null });
  const [editForm, setEditForm] = useState<{
    name: string;
    description: string;
    imageFile: File | null;
  }>({ name: "", description: "", imageFile: null });
  const [editCityForm, setEditCityForm] = useState<{
    name: string;
    description: string;
    imageFile: File | null;
    top_cities: "0" | "1";
  }>({ name: "", description: "", imageFile: null, top_cities: "0" });

  const refetchLocations = () => {
    getStateCitiesApi()
      .then(setStates)
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Failed to refresh locations.");
      });
  };

  useEffect(() => {
    let cancelled = false;
    getStateCitiesApi()
      .then((data) => {
        if (!cancelled) setStates(data);
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : "Failed to load locations.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAddState = () => {
    const name = stateForm.name.trim();
    const description = stateForm.description.trim();
    if (!name) {
      toast.error("State name is required.");
      return;
    }
    if (!description) {
      toast.error("State description is required.");
      return;
    }
    if (!stateForm.imageFile) {
      toast.error("State photo is required.");
      return;
    }
    setSavingState(true);
    addStateApi(name, description, stateForm.imageFile)
      .then(() => {
        toast.success("State added successfully.");
        setStateForm({ name: "", description: "", imageFile: null });
        setOpenStateModal(false);
        refetchLocations();
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Failed to add state.");
      })
      .finally(() => setSavingState(false));
  };

  const handleAddLocalArea = () => {
    const name = localAreaForm.name.trim();
    const description = localAreaForm.description.trim();
    if (!name || !selectedStateId) return;
    if (!description) {
      toast.error("City description required.");
      return;
    }
    setSavingCity(true);
    addCityApi(selectedStateId, name, description, localAreaForm.imageFile ?? undefined)
      .then(() => {
        toast.success("City added successfully.");
        setLocalAreaForm({ name: "", description: "", imageFile: null });
        setOpenLocalAreaModal(false);
        setSelectedStateId(null);
        refetchLocations();
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Failed to add city.");
      })
      .finally(() => setSavingCity(false));
  };

  const handleDeleteState = (stateId: string) => {
    if (!confirm("Are you sure you want to delete this state and all its cities?")) return;
    setDeletingStateId(stateId);
    deleteStateApi(stateId)
      .then(() => {
        toast.success("State deleted successfully.");
        refetchLocations();
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Failed to delete state.");
      })
      .finally(() => setDeletingStateId(null));
  };

  const handleDeleteLocalArea = (_stateId: string, cityId: string) => {
    if (!confirm("Are you sure you want to delete this city?")) return;
    setDeletingCityId(cityId);
    deleteCityApi(cityId)
      .then(() => {
        toast.success("City deleted successfully.");
        refetchLocations();
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Failed to delete city.");
      })
      .finally(() => setDeletingCityId(null));
  };

  const openAddLocalAreaModal = (stateId: string) => {
    setSelectedStateId(stateId);
    setOpenLocalAreaModal(true);
  };

  const openEditStateModalFor = (state: StateWithCitiesItem) => {
    setEditingState(state);
    setEditForm({
      name: state.name,
      description: state.description ?? "",
      imageFile: null,
    });
    setOpenEditStateModal(true);
  };

  const closeEditStateModal = () => {
    setOpenEditStateModal(false);
    setEditingState(null);
    setEditForm({ name: "", description: "", imageFile: null });
  };

  const handleUpdateState = () => {
    if (!editingState) return;
    const name = editForm.name.trim();
    if (!name) {
      toast.error("State name is required.");
      return;
    }
    setUpdatingStateId(editingState.id);
    updateStateApi(editingState.id, {
      name,
      description: editForm.description ?? "",
      image: editForm.imageFile ?? undefined,
    })
      .then(() => getStateCitiesApi())
      .then((data) => {
        setStates(data);
        toast.success("State updated successfully.");
        closeEditStateModal();
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Failed to update state.");
      })
      .finally(() => setUpdatingStateId(null));
  };

  const editImageDropzone = useDropzone({
    accept: { "image/png": [], "image/jpeg": [], "image/webp": [], "image/gif": [] },
    maxFiles: 1,
    onDrop: (accepted) => {
      setEditForm((prev) => ({ ...prev, imageFile: accepted[0] ?? null }));
    },
    disabled: !!updatingStateId,
  });

  const openEditCityModalFor = (city: ApiCity) => {
    setEditingCity(city);
    setEditCityForm({
      name: city.name,
      description: city.description ?? "",
      imageFile: null,
      top_cities: String(city.top_cities ?? "0") === "1" ? "1" : "0",
    });
    setOpenEditCityModal(true);
  };

  const closeEditCityModal = () => {
    setOpenEditCityModal(false);
    setEditingCity(null);
    setEditCityForm({ name: "", description: "", imageFile: null, top_cities: "0" });
  };

  const handleUpdateCity = () => {
    if (!editingCity) return;
    const name = editCityForm.name.trim();
    if (!name) {
      toast.error("City name is required.");
      return;
    }
    if (!editingCity.state_id) {
      toast.error("State ID is missing.");
      return;
    }
    setUpdatingCityId(editingCity.id);
    updateCityApi(editingCity.id, editingCity.state_id, {
      name,
      description: editCityForm.description ?? "",
      image: editCityForm.imageFile ?? undefined,
      top_cities: editCityForm.top_cities,
    })
      .then(() => getStateCitiesApi())
      .then((data) => {
        setStates(data);
        toast.success("City updated successfully.");
        closeEditCityModal();
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Failed to update city.");
      })
      .finally(() => setUpdatingCityId(null));
  };

  const editCityImageDropzone = useDropzone({
    accept: { "image/png": [], "image/jpeg": [], "image/webp": [], "image/gif": [] },
    maxFiles: 1,
    onDrop: (accepted) => {
      setEditCityForm((prev) => ({ ...prev, imageFile: accepted[0] ?? null }));
    },
    disabled: !!updatingCityId,
  });

  const addCityImageDropzone = useDropzone({
    accept: { "image/png": [], "image/jpeg": [], "image/webp": [], "image/gif": [] },
    maxFiles: 1,
    onDrop: (accepted) => {
      setLocalAreaForm((prev) => ({ ...prev, imageFile: accepted[0] ?? null }));
    },
    disabled: !!savingCity,
  });

  const addStateImageDropzone = useDropzone({
    accept: { "image/png": [], "image/jpeg": [], "image/webp": [], "image/gif": [] },
    maxFiles: 1,
    onDrop: (accepted) => {
      setStateForm((prev) => ({ ...prev, imageFile: accepted[0] ?? null }));
    },
    disabled: !!savingState,
  });

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
      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">Loading locations…</p>
        </div>
      ) : states.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No states found. Click &quot;Add State&quot; to add one.
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
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap items-center gap-3">
                  {state.img && (
                    <img
                      src={state.img}
                      alt={state.name}
                      className="h-12 w-12 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                    />
                  )}
                  <h2 className="text-xl font-semibold text-black dark:text-white">
                    {state.name}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => openEditStateModalFor(state)}
                    className="bg-gray-600 hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500"
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => openAddLocalAreaModal(state.id)}
                  >
                    + Add City
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleDeleteState(state.id)}
                    className="bg-red-500 hover:bg-red-600"
                    disabled={deletingStateId === state.id}
                  >
                    {deletingStateId === state.id ? "Deleting…" : "Delete State"}
                  </Button>
                </div>
              </div>

              {/* State photo & description */}
              {(state.img || state.description) && (
                <div className="p-4 border-b border-gray-100 dark:border-white/5 flex flex-col sm:flex-row gap-4">
                  {state.img && (
                    <div className="shrink-0">
                      <img
                        src={state.img}
                        alt={state.name}
                        className="rounded-xl max-h-40 w-auto object-cover border border-gray-200 dark:border-gray-700"
                      />
                    </div>
                  )}
                  {state.description && (
                    <div className="min-w-0 flex-1">
                      <div
                        className={`prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 transition-[max-height] duration-300 ease-out ${
                          expandedDescriptionId === state.id ? "max-h-none" : "max-h-24 overflow-hidden"
                        }`}
                        dangerouslySetInnerHTML={{ __html: state.description }}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedDescriptionId((prev) =>
                            prev === state.id ? null : state.id
                          )
                        }
                        className="mt-1 text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300"
                      >
                        {expandedDescriptionId === state.id ? "Show less" : "Read more"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Cities Table */}
              <div className="p-4">
                {state.cities.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No cities for this state.
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
                            City
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-5 py-3 text-theme-xs text-gray-500"
                          >
                            Description
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-5 py-3 text-theme-xs text-gray-500"
                          >
                            Status
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
                        {state.cities.map((city) => {
                          const cityDescId = `city-${city.id}`;
                          const isExpanded = expandedDescriptionId === cityDescId;
                          return (
                            <TableRow key={city.id}>
                              <TableCell className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  {city.img && (
                                    <img
                                      src={city.img}
                                      alt={city.name}
                                      className="h-10 w-10 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                                    />
                                  )}
                                  <div>
                                    <p className="font-medium text-black dark:text-white">
                                      {city.name}
                                    </p>
                                    {city.top_cities === "1" || city.top_cities === 1 ? (
                                      <span className="mt-1 inline-block">
                                        <Badge size="sm" variant="solid" color="warning">
                                          Top City
                                        </Badge>
                                      </span>
                                    ) : null}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="px-5 py-4 max-w-md">
                                {city.description ? (
                                  <div>
                                    <div
                                      className={`prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 transition-[max-height] duration-300 ${
                                        isExpanded ? "max-h-none" : "max-h-16 overflow-hidden"
                                      }`}
                                      dangerouslySetInnerHTML={{ __html: city.description }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setExpandedDescriptionId((prev) =>
                                          prev === cityDescId ? null : cityDescId
                                        )
                                      }
                                      className="mt-1 text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
                                    >
                                      {isExpanded ? "Show less" : "Read more"}
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 dark:text-gray-500">No description</span>
                                )}
                              </TableCell>
                              <TableCell className="px-5 py-4">
                                {city.top_cities === "1" || city.top_cities === 1 ? (
                                  <Badge size="sm" variant="solid" color="warning">
                                    Top
                                  </Badge>
                                ) : (
                                  <Badge size="sm" variant="solid" color="light">
                                    Normal
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="px-5 py-4">
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => openEditCityModalFor(city)}
                                    className="bg-gray-600 hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500"
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleDeleteLocalArea(state.id, city.id)
                                    }
                                    className="bg-red-500 hover:bg-red-600"
                                    disabled={deletingCityId === city.id}
                                  >
                                    {deletingCityId === city.id ? "Deleting…" : "Delete"}
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add State Modal – same description and image as Edit State */}
      <Modal
        isOpen={openStateModal}
        onClose={() => {
          setOpenStateModal(false);
          setStateForm({ name: "", description: "", imageFile: null });
        }}
        showCloseButton={true}
      >
        <div className="text-white p-6 max-h-[90vh] overflow-y-auto">
          <h1 className="text-2xl font-semibold mb-4">Add State</h1>
          <div className="space-y-4">
            <div>
              <Label className="mb-2">State Name</Label>
              <Input
                placeholder="e.g., California, New York, Texas"
                type="text"
                value={stateForm.name}
                onChange={(e) =>
                  setStateForm((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full"
              />
            </div>
            <div>
              <Label className="mb-2">Photo (required)</Label>
              <div className="flex flex-wrap items-start gap-4">
                {stateForm.imageFile && (
                  <div className="shrink-0">
                    <p className="text-xs text-gray-400 mb-1">Selected</p>
                    <img
                      src={URL.createObjectURL(stateForm.imageFile)}
                      alt="Preview"
                      className="h-24 w-24 rounded-lg object-cover border border-gray-600"
                    />
                  </div>
                )}
                <div
                  {...addStateImageDropzone.getRootProps()}
                  className="border border-dashed border-gray-500 rounded-xl p-4 cursor-pointer hover:border-brand-500 transition-colors min-w-[200px]"
                >
                  <input {...addStateImageDropzone.getInputProps()} />
                  <p className="text-sm text-gray-400 text-center">
                    {addStateImageDropzone.isDragActive
                      ? "Drop image here"
                      : "Drag & drop a photo, or click to select"}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <RichTextEditor
                label="Page description (required)"
                value={stateForm.description}
                onChange={(html) =>
                  setStateForm((prev) => ({ ...prev, description: html }))
                }
                placeholder="Add a description with bold, links, lists…"
                minHeight="160px"
                disabled={!!savingState}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                onClick={() => {
                  setOpenStateModal(false);
                  setStateForm({ name: "", description: "", imageFile: null });
                }}
                className="bg-gray-600 hover:bg-gray-700"
                disabled={savingState}
              >
                Cancel
              </Button>
              <Button onClick={handleAddState} disabled={savingState}>
                {savingState ? "Adding…" : "Add State"}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit State Modal – photo upload & description (rich text) */}
      <Modal
        isOpen={openEditStateModal}
        onClose={closeEditStateModal}
        showCloseButton={true}
      >
        <div className="text-white p-6 max-h-[90vh] overflow-y-auto">
          <h1 className="text-2xl font-semibold mb-4">Edit State</h1>
          <div className="space-y-4">
            <div>
              <Label className="mb-2">State Name</Label>
              <Input
                placeholder="e.g., California, New York, Texas"
                type="text"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full"
              />
            </div>
            <div>
              <Label className="mb-2">Photo</Label>
              <div className="flex flex-wrap items-start gap-4">
                {editingState?.img && !editForm.imageFile && (
                  <div className="shrink-0">
                    <p className="text-xs text-gray-400 mb-1">Current</p>
                    <img
                      src={editingState.img}
                      alt={editingState.name}
                      className="h-24 w-24 rounded-lg object-cover border border-gray-600"
                    />
                  </div>
                )}
                {editForm.imageFile && (
                  <div className="shrink-0">
                    <p className="text-xs text-gray-400 mb-1">New</p>
                    <img
                      src={URL.createObjectURL(editForm.imageFile)}
                      alt="Preview"
                      className="h-24 w-24 rounded-lg object-cover border border-gray-600"
                    />
                  </div>
                )}
                <div
                  {...editImageDropzone.getRootProps()}
                  className="border border-dashed border-gray-500 rounded-xl p-4 cursor-pointer hover:border-brand-500 transition-colors min-w-[200px]"
                >
                  <input {...editImageDropzone.getInputProps()} />
                  <p className="text-sm text-gray-400 text-center">
                    {editImageDropzone.isDragActive
                      ? "Drop image here"
                      : "Drag & drop a photo, or click to select"}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <RichTextEditor
                label="Page description"
                value={editForm.description}
                onChange={(html) =>
                  setEditForm((prev) => ({ ...prev, description: html }))
                }
                placeholder="Add a description with bold, links, lists…"
                minHeight="160px"
                disabled={!!updatingStateId}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                onClick={closeEditStateModal}
                className="bg-gray-600 hover:bg-gray-700"
                disabled={!!updatingStateId}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateState}
                disabled={!!updatingStateId}
              >
                {updatingStateId ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Add City Modal – same layout as Edit State: name, photo, rich text description */}
      <Modal
        isOpen={openLocalAreaModal}
        onClose={() => {
          setOpenLocalAreaModal(false);
          setLocalAreaForm({ name: "", description: "", imageFile: null });
          setSelectedStateId(null);
        }}
        showCloseButton={true}
      >
        <div className="text-white p-6 max-h-[90vh] overflow-y-auto">
          <h1 className="text-2xl font-semibold mb-4">Add City</h1>
          <div className="space-y-4">
            <div>
              <Label className="mb-2">City Name</Label>
              <Input
                placeholder="e.g., Indore, Ujjain"
                type="text"
                value={localAreaForm.name}
                onChange={(e) =>
                  setLocalAreaForm((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full"
              />
            </div>
            <div>
              <Label className="mb-2">Photo</Label>
              <div className="flex flex-wrap items-start gap-4">
                {localAreaForm.imageFile && (
                  <div className="shrink-0">
                    <p className="text-xs text-gray-400 mb-1">New</p>
                    <img
                      src={URL.createObjectURL(localAreaForm.imageFile)}
                      alt="Preview"
                      className="h-24 w-24 rounded-lg object-cover border border-gray-600"
                    />
                  </div>
                )}
                <div
                  {...addCityImageDropzone.getRootProps()}
                  className="border border-dashed border-gray-500 rounded-xl p-4 cursor-pointer hover:border-brand-500 transition-colors min-w-[200px]"
                >
                  <input {...addCityImageDropzone.getInputProps()} />
                  <p className="text-sm text-gray-400 text-center">
                    {addCityImageDropzone.isDragActive
                      ? "Drop image here"
                      : "Drag & drop a photo, or click to select"}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <RichTextEditor
                label="Page description"
                placeholder="Add a description with bold, links, lists…"
                value={localAreaForm.description}
                onChange={(html) =>
                  setLocalAreaForm((prev) => ({ ...prev, description: html }))
                }
                minHeight="160px"
                disabled={!!savingCity}
              />
              <p className="mt-1 text-xs text-gray-400">City description is required.</p>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                onClick={() => {
                  setOpenLocalAreaModal(false);
                  setLocalAreaForm({ name: "", description: "", imageFile: null });
                  setSelectedStateId(null);
                }}
                className="bg-gray-600 hover:bg-gray-700"
                disabled={savingCity}
              >
                Cancel
              </Button>
              <Button onClick={handleAddLocalArea} disabled={savingCity}>
                {savingCity ? "Adding…" : "Add City"}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit City Modal – photo upload, description (rich text), top city toggle */}
      <Modal
        isOpen={openEditCityModal}
        onClose={closeEditCityModal}
        showCloseButton={true}
      >
        <div className="text-white p-6 max-h-[90vh] overflow-y-auto">
          <h1 className="text-2xl font-semibold mb-4">Edit City</h1>
          <div className="space-y-4">
            <div>
              <Label className="mb-2">City Name</Label>
              <Input
                placeholder="e.g., Indore, Ujjain"
                type="text"
                value={editCityForm.name}
                onChange={(e) =>
                  setEditCityForm((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full"
              />
            </div>
            <div>
              <Label className="mb-2">Photo</Label>
              <div className="flex flex-wrap items-start gap-4">
                {editingCity?.img && !editCityForm.imageFile && (
                  <div className="shrink-0">
                    <p className="text-xs text-gray-400 mb-1">Current</p>
                    <img
                      src={editingCity.img}
                      alt={editingCity.name}
                      className="h-24 w-24 rounded-lg object-cover border border-gray-600"
                    />
                  </div>
                )}
                {editCityForm.imageFile && (
                  <div className="shrink-0">
                    <p className="text-xs text-gray-400 mb-1">New</p>
                    <img
                      src={URL.createObjectURL(editCityForm.imageFile)}
                      alt="Preview"
                      className="h-24 w-24 rounded-lg object-cover border border-gray-600"
                    />
                  </div>
                )}
                <div
                  {...editCityImageDropzone.getRootProps()}
                  className="border border-dashed border-gray-500 rounded-xl p-4 cursor-pointer hover:border-brand-500 transition-colors min-w-[200px]"
                >
                  <input {...editCityImageDropzone.getInputProps()} />
                  <p className="text-sm text-gray-400 text-center">
                    {editCityImageDropzone.isDragActive
                      ? "Drop image here"
                      : "Drag & drop a photo, or click to select"}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <RichTextEditor
                label="City description"
                value={editCityForm.description}
                onChange={(html) =>
                  setEditCityForm((prev) => ({ ...prev, description: html }))
                }
                placeholder="Add a description with bold, links, lists…"
                minHeight="160px"
                disabled={!!updatingCityId}
              />
            </div>
            <div>
              <Label className="mb-2">Top City</Label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setEditCityForm((prev) => ({
                      ...prev,
                      top_cities: prev.top_cities === "1" ? "0" : "1",
                    }))
                  }
                  className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors ${
                    editCityForm.top_cities === "1"
                      ? "border-amber-500 bg-amber-500/20 text-amber-400"
                      : "border-gray-500 bg-gray-500/20 text-gray-400 hover:border-gray-400"
                  }`}
                  disabled={!!updatingCityId}
                >
                  {editCityForm.top_cities === "1" ? "✓ Top City" : "Normal City"}
                </button>
                <span className="text-sm text-gray-400">
                  {editCityForm.top_cities === "1"
                    ? "This city will be marked as a top city"
                    : "This city will be a normal city"}
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                onClick={closeEditCityModal}
                className="bg-gray-600 hover:bg-gray-700"
                disabled={!!updatingCityId}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateCity}
                disabled={!!updatingCityId}
              >
                {updatingCityId ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

