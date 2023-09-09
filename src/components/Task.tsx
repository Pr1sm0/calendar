import React, { ChangeEvent, KeyboardEvent, lazy, ReactElement, Suspense, useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import { Draggable } from 'react-beautiful-dnd';
import { v4 } from 'uuid';

import { IDay, ILabel, ITask } from '../utils/interfaces';

const LabelDialog = lazy(() => import('./LabelDialog'));
const Tooltip = lazy(() => import('@mui/material/Tooltip'));

const classes = {
  task: {
    marginY: 1,
    p: 1,
    backgroundColor: 'white',
    wordWrap: 'break-word',
    borderRadius: 2,
    fontSize: '14px',
  },
  labelsWrapper: {
    display: 'flex',
    gap: 1,
    mb: 1,
    overflow: 'auto',
  },
  label: (labelColor: string) => ({
    backgroundColor: labelColor,
    color: 'white',
    p: 1,
    borderRadius: 1,
    fontSize: '14px',
  }),
};

type IProps = {
  tasks: ITask[];
  day: IDay;
  task: ITask;
  index: number;
  handleUpdateTasks: (updatedTasks: ITask[], date: string) => void;
};

const Task = ({ tasks, day, task, index, handleUpdateTasks }: IProps): ReactElement => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedField, setEditedField] = useState<ITask | null>(null);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [editLabelModalItem, setEditLabelModalItem] = useState<ILabel | null>(null);

  const handleLabelModalOpen = (task: ITask) => {
    setEditedField(task);
    setIsLabelModalOpen(true);
  };

  const handleLabelModalClose = () => {
    setEditLabelModalItem(null);
    setEditedField(null);
    setIsLabelModalOpen(false);
  };

  const handleEditLabel = (labelText: string, labelColor: string) => {
    if (editedField && editLabelModalItem) {
      const tasksCopy = [...tasks];
      const labels = tasksCopy[tasksCopy.indexOf(editedField)].labels;
      if (labelText) {
        labels[labels.indexOf(editLabelModalItem)] = { ...editLabelModalItem, text: labelText, color: labelColor };
      } else {
        tasksCopy[tasksCopy.indexOf(editedField)].labels = labels.filter((label) => label.id !== editLabelModalItem.id);
      }
      handleUpdateTasks(tasksCopy, day.date);
      handleLabelModalClose();
    }
  };

  const handleAddLabel = (labelText: string, labelColor: string) => {
    if (editedField) {
      const tasksCopy = [...tasks];
      tasksCopy[tasksCopy.indexOf(editedField)].labels = [
        { id: v4(), text: labelText, color: labelColor },
        ...editedField.labels,
      ];
      handleUpdateTasks(tasksCopy, day.date);
      handleLabelModalClose();
    }
  };

  const handleEditInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, task: ITask) => {
    setEditedField({ ...task, text: e.target.value });
  };

  const handleKeyDownTaskEdit = (e: KeyboardEvent<HTMLDivElement>, task: ITask, index: number): void => {
    if (e.key === 'Enter') {
      handleTaskEditField(task, index);
    }
  };

  const handleTaskEditField = (task: ITask, index: number) => {
    setIsEditing(false);
    if (editedField?.text) {
      const tasksCopy = [...tasks];
      tasks[index].text = editedField?.text;
      handleUpdateTasks(tasksCopy, day.date);
    } else {
      handleUpdateTasks([...tasks.filter((item) => item.id !== task.id)], day.date);
    }
  };

  return (
    <>
      <Draggable key={task.id} draggableId={task.id} index={index}>
        {(provided) => (
          <Box ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} sx={classes.task}>
            <Box sx={classes.labelsWrapper}>
              <Suspense fallback={null}>
                <Tooltip title="Add label">
                  <IconButton aria-label="add-label" size="small" onClick={() => handleLabelModalOpen(task)}>
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Suspense>
              {task.labels.map((label) => (
                <Box
                  key={label.id}
                  sx={classes.label(label.color)}
                  onClick={() => {
                    setEditLabelModalItem(label);
                    handleLabelModalOpen(task);
                  }}
                >
                  {label.text}
                </Box>
              ))}
            </Box>
            {isEditing && task.id === editedField?.id ? (
              <TextField
                id="edit-task-field"
                variant="outlined"
                onChange={(e) => handleEditInputChange(e, task)}
                onBlur={() => handleTaskEditField(task, index)}
                onKeyDown={(e) => handleKeyDownTaskEdit(e, task, index)}
                value={editedField.text}
                autoFocus
                size="small"
                sx={{ width: '100%' }}
                key={editedField.id}
                inputProps={{ maxLength: 100 }}
              />
            ) : (
              <Box
                onClick={() => {
                  setEditedField(task);
                  setIsEditing(true);
                }}
              >
                {task.text}
              </Box>
            )}
          </Box>
        )}
      </Draggable>
      <Suspense fallback={null}>
        <LabelDialog
          open={isLabelModalOpen}
          handleSubmit={editLabelModalItem ? handleEditLabel : handleAddLabel}
          onClose={handleLabelModalClose}
          editLabel={editLabelModalItem}
        />
      </Suspense>
    </>
  );
};

export default Task;
