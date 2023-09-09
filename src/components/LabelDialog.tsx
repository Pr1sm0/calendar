import React, { ChangeEvent, ReactElement, useEffect } from 'react';

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from '@mui/material';

import { ColorsEnum } from '../utils/enums';
import { ILabel } from '../utils/interfaces';

const labelColors = [
  ColorsEnum.DARK_GREEN,
  ColorsEnum.GREEN,
  ColorsEnum.YELLOW,
  ColorsEnum.ORANGE,
  ColorsEnum.DARK_ORANGE,
];

const classes = {
  labelColor: {
    p: 2,
    width: '100%',
    boxSizing: 'border-box',
  },
};

type IProps = {
  open: boolean;
  handleSubmit: (labelText: string, labelColor: string) => void;
  onClose: () => void;
  editLabel?: ILabel | null;
};

const LabelDialog = ({ open, handleSubmit, onClose, editLabel = null }: IProps): ReactElement => {
  const [labelColor, setLabelColor] = React.useState<string>(ColorsEnum.DARK_GREEN);
  const [labelText, setLabelText] = React.useState<string>('');

  useEffect(() => {
    if (editLabel) {
      setLabelColor(editLabel?.color);
      setLabelText(editLabel?.text);
    }
  }, [editLabel]);

  const handleClose = () => {
    onClose();
    setLabelColor(ColorsEnum.DARK_GREEN);
    setLabelText('');
  };

  const handleSubmitLabel = () => {
    handleSubmit(labelText, labelColor);
    handleClose();
  };

  const handleChangeColorSelect = (event: SelectChangeEvent) => {
    setLabelColor(event.target.value as string);
  };

  const handleChangeTextInput = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setLabelText(event.target.value as string);
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <DialogTitle>{`${editLabel ? 'Edit' : 'Add'}`} label</DialogTitle>
      <DialogContent>
        <TextField
          id="name"
          label="Name"
          value={labelText}
          fullWidth
          autoFocus
          sx={{ my: 2 }}
          required
          onChange={handleChangeTextInput}
          inputProps={{ maxLength: 20 }}
        />
        <FormControl fullWidth>
          <InputLabel id="label-color-select-label">Color</InputLabel>
          <Select
            labelId="label-color-select-label"
            id="label-color-select"
            value={labelColor}
            label="Color"
            onChange={handleChangeColorSelect}
          >
            {labelColors.map((color) => (
              <MenuItem key={color} value={color}>
                <Box sx={{ ...classes.labelColor, backgroundColor: color }} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          disabled={(!editLabel && !labelText) || (labelText === editLabel?.text && labelColor === editLabel?.color)}
          onClick={handleSubmitLabel}
        >
          {`${editLabel ? 'Edit' : 'Add'}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LabelDialog;
