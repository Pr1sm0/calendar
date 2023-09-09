import React, { ChangeEvent, KeyboardEvent, ReactElement, useState } from 'react';

import { Box, Button, TextField } from '@mui/material';
import { Droppable } from 'react-beautiful-dnd';
import { v4 } from 'uuid';

import Task from './Task';
import { IDay, ITask } from '../utils/interfaces';

const classes = {
  day: {
    width: '100%',
    aspectRatio: 1,
    display: 'flex',
    flexDirection: 'column',
    border: 'solid 1px #D1C4E9',
    borderRadius: '1rem',
    padding: 1,
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  currentMonth: {
    border: 'solid 1px #B39DDB',
  },
  weekend: {
    border: 'solid 1px #B39DDB',
    backgroundColor: '#D1C4E9',
  },
  today: {
    backgroundColor: '#eed3d3',
  },
  dayNumber: (isCurrentMonth: boolean) => ({
    fontWeight: 'bold',
    color: `${isCurrentMonth ? '#311B92' : '#B39DDB'}`,
    mr: 2,
  }),
  holidaysWrapper: {
    maxHeight: '100px',
    overflow: 'auto',
    fontSize: '14px',
  },
};

type IProps = {
  day: IDay;
  tasks: ITask[];
  handleUpdateTasks: (updatedTasks: ITask[], date: string) => void;
};

const Cell = ({ day, tasks, handleUpdateTasks }: IProps): ReactElement => {
  const [hoverDay, setHoverDay] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [addInputValue, setAddInputValue] = useState('');

  const mouseOverDay = () => {
    setHoverDay(true);
  };

  const mouseOutDay = () => {
    setHoverDay(false);
  };

  const handleCreate = () => {
    setIsCreating(true);
  };

  const handleAddInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setAddInputValue(e.target.value);
  };

  const handleAddField = () => {
    setIsCreating(false);
    addInputValue && handleUpdateTasks([{ id: v4(), text: addInputValue, labels: [] }, ...tasks], day.date);
    setAddInputValue('');
  };

  const handleKeyDownTaskAdd = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === 'Enter') {
      handleAddField();
    }
  };

  return (
    <Droppable droppableId={day.date}>
      {(provided) => (
        <Box
          {...provided.droppableProps}
          ref={provided.innerRef}
          onMouseEnter={mouseOverDay}
          onMouseLeave={mouseOutDay}
          sx={{
            ...classes.day,
            ...(day.isCurrentMonth && classes.currentMonth),
            ...(day.isWeekend && classes.weekend),
            ...(day.isToday && classes.today),
          }}
        >
          <Box sx={{ display: 'flex' }}>
            <Box sx={classes.dayNumber(day.isCurrentMonth)}>{day.dayOfMonth}</Box>
            {tasks?.length > 0 && (
              <Box sx={{ color: `grey` }}>
                {tasks?.length} card{tasks?.length > 1 ? 's' : ''}
              </Box>
            )}
          </Box>
          <Box sx={classes.holidaysWrapper}>
            {day.holidays.map((holiday) => (
              <Box key={holiday} py="2px">
                {holiday}
              </Box>
            ))}
          </Box>
          <Box sx={{ overflow: 'auto', pt: 2 }}>
            {!isCreating && (
              <Button sx={{ display: `${hoverDay ? 'flex' : 'none'}`, width: '100%' }} onClick={handleCreate}>
                Add task
              </Button>
            )}
            {isCreating && (
              <TextField
                id="add-task-field"
                variant="outlined"
                onChange={handleAddInputChange}
                onBlur={handleAddField}
                onKeyDown={handleKeyDownTaskAdd}
                autoFocus
                size="small"
                sx={{ width: '100%' }}
              />
            )}
            {tasks?.map((task, index) => {
              return (
                <Task
                  key={task.id}
                  tasks={tasks}
                  task={task}
                  day={day}
                  index={index}
                  handleUpdateTasks={handleUpdateTasks}
                ></Task>
              );
            })}
          </Box>
          {provided.placeholder}
        </Box>
      )}
    </Droppable>
  );
};

export default Cell;
