import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { updateTask } from "../../firebase/tasks";
import TaskCard from "./TaskCard";
import { ClipboardList, Zap, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const columns = [
  {
    id: "todo",
    label: "To Do",
    icon: ClipboardList,
    color: "text-gray-400",
    bg: "bg-gray-500/10",
    border: "border-gray-500/20",
  },
  {
    id: "inprogress",
    label: "In Progress",
    icon: Zap,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
  },
  {
    id: "done",
    label: "Done",
    icon: CheckCircle,
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
  },
];

const KanbanBoard = ({ tasks, onEdit, onDelete, onToggle }) => {
  const getColumnTasks = (status) =>
    tasks.filter((t) => t.status === status);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    try {
      await updateTask(draggableId, { status: destination.droppableId });
      toast.success("Task moved!");
    } catch {
      toast.error("Failed to move task!");
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
        {columns.map((col) => {
          const Icon = col.icon;
          const colTasks = getColumnTasks(col.id);

          return (
            <div key={col.id} className="glass-card p-4">
              {/* Column Header */}
              <div className={`flex items-center gap-2 mb-4 pb-3 border-b border-white/10`}>
                <div className={`p-1.5 rounded-lg ${col.bg} border ${col.border}`}>
                  <Icon size={14} className={col.color} />
                </div>
                <span className="font-display font-semibold text-white text-sm">
                  {col.label}
                </span>
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${col.bg} ${col.color} border ${col.border}`}>
                  {colTasks.length}
                </span>
              </div>

              {/* Droppable Area */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-3 min-h-32 rounded-xl transition-all duration-200 ${
                      snapshot.isDraggingOver ? "bg-primary-500/5 border border-primary-500/20 p-2" : ""
                    }`}
                  >
                    {colTasks.length === 0 && !snapshot.isDraggingOver && (
                      <div className="text-center py-8">
                        <p className="text-gray-600 text-sm">No tasks here</p>
                        <p className="text-gray-700 text-xs mt-1">Drop tasks here</p>
                      </div>
                    )}
                    {colTasks.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`transition-all duration-200 ${
                              snapshot.isDragging
                                ? "rotate-2 scale-105 shadow-xl shadow-primary-500/20"
                                : ""
                            }`}
                          >
                            <TaskCard
                              task={task}
                              view="grid"
                              onEdit={onEdit}
                              onDelete={onDelete}
                              onToggle={onToggle}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;