import React, { ChangeEvent, ReactElement, useEffect, useMemo, useRef, useState } from 'react';

import axios from 'axios';
import html2canvas from 'html2canvas';
import { Box, Button, TextField } from '@mui/material';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { format, getMonth, getYear } from 'date-fns';
import { debounce, isArray, mergeWith, uniqBy } from 'lodash';

import Cell from './Cell';
import { createDaysForCalendarView } from '../utils/dateHelpers';
import { IDay, IHoliday, ITask } from '../utils/interfaces';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const classes = {
  container: {
    minWidth: 1500,
  },
  header: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  selectedMonth: {
    margin: 'auto',
    width: 'fit-content',
    display: 'flex',
    justifyContent: 'space-between',
    color: '#311B92',
    fontWeight: 700,
  },
  calendar: {
    display: 'grid',
    gap: '0.5rem',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gridColumn: '1 / 7',
    backgroundColor: '#EDE7F6',
    border: 'solid 1px #B39DDB',
    borderRadius: '1.5rem',
    padding: '1rem',
  },
  weekday: {
    textAlign: 'center',
    color: '#EDE7F6',
    backgroundColor: '#5E35B1',
    borderRadius: '1rem',
    padding: '0.25rem 0.5rem',
    fontSize: '0.875rem',
    fontWeight: 700,
  },
  searchContainer: {
    display: 'flex',
    gap: 2,
    mb: 2,
  },
  button: {
    lineHeight: 2,
    border: 'solid 1px #b39ddb',
    borderRadius: '1rem',
    color: '#311b92',
    backgroundColor: '#ede7f6',
    transition: 'background-color ease 0.3s',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#5e35b1',
      color: '#ede7f6',
    },
    '&:active': {
      backgroundColor: '#9c27b0',
      color: '#ede7f6',
    },
  },
};

type Search = { tasks: string; labels: string };
type Tasks = Record<string, ITask[]>;

const Calendar = (): ReactElement => {
  const today = new Date();
  const initialYear = getYear(today);
  const initialMonth = getMonth(today);
  const printRef = useRef();
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [holidays, setHolidays] = useState<IHoliday[]>([]);
  const [tasks, setTasks] = useState<Tasks>({});
  const [search, setSearch] = useState<Search>({ tasks: '', labels: '' });
  const tasksSearchRegex = new RegExp(`${search.tasks}`);
  const labelsSearchRegex = new RegExp(`${search.labels}`);

  const daysForCalendarView: IDay[] = useMemo(
    () => createDaysForCalendarView(selectedYear, selectedMonth, holidays),
    [selectedYear, selectedMonth, holidays],
  );

  useEffect(() => getHolidays(), []);

  const getHolidays = () => {
    axios
      .get(`https://date.nager.at/api/v3/NextPublicHolidaysWorldwide`)
      .then(({ data }) => setHolidays(data))
      .catch((e) => e);
  };

  const goToPrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedYear((prev) => prev - 1);
      setSelectedMonth(11);
    } else setSelectedMonth((prev) => prev - 1);
  };

  const goToNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedYear((prev) => prev + 1);
      setSelectedMonth(0);
    } else setSelectedMonth((prev) => prev + 1);
  };

  const handleUpdateTasks = (updatedTasks: ITask[], date: string) => {
    setTasks({ ...tasks, [date]: [...updatedTasks] });
  };

  const onDragEnd = ({ source, destination }: DropResult) => {
    // Make sure we have a valid destination
    if (destination === undefined || destination === null) return null;

    // Make sure we're actually moving the item
    if (source.droppableId === destination.droppableId && destination.index === source.index) return null;

    // Set start and end variables
    const start = source.droppableId;
    const end = destination.droppableId;

    // If start is the same as end, we're in the same day
    if (start === end) {
      // Move the item within the list
      // Start by making a new list without the dragged item
      const newList = tasks[start].filter((_: any, idx: number) => idx !== source.index);

      // Then insert the item at the right location
      newList.splice(destination.index, 0, tasks[start][source.index]);

      // Update the state
      setTasks({ ...tasks, [start]: newList });
      return null;
    } else {
      // If start is different from end, we need to update multiple days
      // Filter the start list like before
      const newStartList = tasks[start].filter((_: any, idx: number) => idx !== source.index);

      // Make a new end list array
      const newEndList = tasks[end] || [];

      // Insert the item into the end list
      newEndList.splice(destination.index, 0, tasks[start][source.index]);

      // Update the state
      setTasks({ ...tasks, [start]: newStartList, [end]: newEndList });
      return null;
    }
  };

  const handleTaskSearchInputChange = debounce((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSearch({ ...search, tasks: e.target.value });
  }, 500);

  const handleLabelsSearchInputChange = debounce((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSearch({ ...search, labels: e.target.value });
  }, 500);

  const filteredTasks = (date: string) =>
    tasks[date]?.filter(({ text, labels }) => {
      if (search?.tasks && search?.labels) {
        return tasksSearchRegex.test(text) && labels.some(({ text }) => labelsSearchRegex.test(text));
      } else if (search?.tasks) {
        return tasksSearchRegex.test(text);
      } else if (search?.labels) {
        return labels.some(({ text }) => labelsSearchRegex.test(text));
      } else {
        return true;
      }
    }) || [];

  const handleDownloadImage = async () => {
    const element = printRef.current;
    if (element) {
      const canvas = await html2canvas(element);
      const data = canvas.toDataURL('image/jpg');
      const link = document.createElement('a');
      link.href = data;
      link.download = `${format(new Date(selectedYear, selectedMonth), 'MMMM yyyy')}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleExportCalendar = () => {
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(JSON.stringify(tasks))}`;
    const link = document.createElement('a');
    const date = new Date();
    link.href = jsonString;
    link.download = `${date.getTime()}.json`;
    link.click();
  };

  const handleCalendarImport = (event: React.FormEvent<HTMLInputElement>): void => {
    const selectedFile = event.currentTarget.files?.[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.readAsText(selectedFile as Blob);
      reader.onload = function () {
        const data = JSON.parse(reader.result as string);

        function customizer(objValue: Array<Tasks>, srcValue: Array<Tasks>) {
          if (isArray(objValue)) {
            return uniqBy(objValue.concat(srcValue), 'id');
          }
        }

        const updatedTasks = mergeWith(tasks, data, customizer);
        setTasks({ ...updatedTasks });
      };
      if (event) ((event.target as HTMLTextAreaElement).value as string | null) = null;
    }
  };

  return (
    <Box sx={classes.container}>
      <Box sx={classes.header}>
        <Button sx={classes.button} onClick={goToPrevMonth}>
          Prev
        </Button>
        <Box component="span" style={classes.selectedMonth}>
          {format(new Date(selectedYear, selectedMonth), 'MMMM yyyy')}
        </Box>
        <Button sx={classes.button} onClick={goToNextMonth}>
          Next
        </Button>
      </Box>
      <Box sx={classes.searchContainer}>
        <TextField
          id="search-task-field"
          variant="outlined"
          label="Search tasks by text"
          onChange={handleTaskSearchInputChange}
          size="small"
        />
        <TextField
          id="search-label-field"
          variant="outlined"
          label="Search tasks by label"
          onChange={handleLabelsSearchInputChange}
          size="small"
        />
        <Button onClick={handleDownloadImage}>Download calendar as image</Button>
        <Button onClick={handleExportCalendar}>Export calendar as JSON</Button>
        <Button component="label">
          Import calendar as JSON
          <input type="file" accept="application/JSON" hidden onChange={handleCalendarImport} />
        </Button>
      </Box>
      <Box ref={printRef} sx={classes.calendar}>
        {WEEKDAYS.map((weekday, index) => {
          return (
            <Box key={'weekday-' + index} sx={classes.weekday}>
              {weekday}
            </Box>
          );
        })}

        <DragDropContext onDragEnd={onDragEnd}>
          {daysForCalendarView.map((day, index) => {
            return (
              <Cell
                key={'day-box-' + index}
                day={day}
                tasks={search?.tasks || search?.labels ? filteredTasks(day?.date) : tasks[day?.date]}
                handleUpdateTasks={handleUpdateTasks}
              />
            );
          })}
        </DragDropContext>
      </Box>
    </Box>
  );
};
export default Calendar;
