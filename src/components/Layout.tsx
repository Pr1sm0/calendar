import React, { ReactElement } from 'react';

import Box from '@mui/material/Box';

const classes = {
  root: {
    flex: '1 1 auto',
    overflow: 'auto',
    position: 'relative',
    height: '100vh',
    boxSizing: 'border-box',
    p: 8,
    backgroundColor: '#eed3d3',
  },
};

type IProps = {
  children: ReactElement;
};

function Layout({ children }: IProps): ReactElement {
  return <Box sx={classes.root}>{children}</Box>;
}

export default Layout;
