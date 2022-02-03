import * as React from 'react';
import { useState } from 'react';
import useMuiAppBarHeight from '@hooks/useMuiAppBarHeight';
import useWindowSize from '@hooks/useWindowSize';
import { GitHub } from '@mui/icons-material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SettingsIcon from '@mui/icons-material/Settings';
import { AppBar, Tooltip } from '@mui/material';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer, { DrawerProps } from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { styled, useTheme } from '@mui/material/styles';

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}

type LeftDrawerLayoutProps = {
    mainContent?: React.ReactNode | ((appBarHeight: number) => React.ReactNode);
    drawerContent?: React.ReactNode;
    title?: string;
    drawerWidth?: number | ((windowWidth: number) => number);
    drawerProps?: DrawerProps;
};

function LeftDrawerLayout({
    mainContent = <div />,
    drawerContent = <div />,
    title = 'Drawer Layout',
    drawerWidth = (windowWidth) => windowWidth * 0.3,
    drawerProps = {}
}: LeftDrawerLayoutProps) {
    const { width: windowWidth } = useWindowSize();
    const computedDrawerWidth =
        typeof drawerWidth === 'function' ? drawerWidth(windowWidth) : drawerWidth;

    const appBarHeight = useMuiAppBarHeight();

    const AppBar = styled(MuiAppBar, {
        shouldForwardProp: (prop) => prop !== 'open'
    })<AppBarProps>(({ theme, open }) => ({
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen
        }),
        ...(open && {
            width: `calc(100% - ${computedDrawerWidth}px)`,
            marginLeft: `${computedDrawerWidth}px`,
            transition: theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen
            })
        })
    }));

    const DrawerHeader = styled('div')(({ theme }) => ({
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(0, 1),
        // necessary for content to be below app bar
        ...theme.mixins.toolbar,
        justifyContent: 'flex-end'
    }));

    const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
        open?: boolean;
    }>(({ theme, open }) => ({
        flexGrow: 1,
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen
        }),
        marginLeft: `-${computedDrawerWidth}px`,
        ...(open && {
            transition: theme.transitions.create('margin', {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen
            }),
            marginLeft: 0
        })
    }));

    const theme = useTheme();
    const [open, setOpen] = useState(false);

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" open={open}>
                <Toolbar>
                    <div className="flex grow justify-between items-center">
                        <div className="flex items-center">
                            <IconButton
                                color="inherit"
                                aria-label="open drawer"
                                onClick={handleDrawerOpen}
                                edge="start"
                                sx={{ mr: 2, ...(open && { display: 'none' }) }}
                            >
                                <SettingsIcon />
                            </IconButton>
                            <Typography variant="h6" noWrap component="div">
                                <div className="text-sm md:text-lg">{title}</div>
                            </Typography>
                        </div>
                        <div className="hidden sm:block">
                            <a
                                href="https://github.com/peter-gy/visualization-and-data-analysis-with-d3/tree/main/assignments/A5"
                                target="_blank"
                            >
                                <Tooltip title='Project Source Code'>
                                    <GitHub />
                                </Tooltip>
                            </a>
                        </div>
                    </div>
                </Toolbar>
            </AppBar>
            <Drawer
                sx={{
                    width: computedDrawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: computedDrawerWidth,
                        boxSizing: 'border-box'
                    }
                }}
                variant="persistent"
                anchor="left"
                open={open}
                {...drawerProps}
            >
                <DrawerHeader>
                    <IconButton onClick={handleDrawerClose}>
                        {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                    </IconButton>
                </DrawerHeader>
                <Divider />
                {drawerContent}
            </Drawer>
            <Main open={open}>
                {typeof mainContent === 'function' ? mainContent(appBarHeight) : mainContent}
            </Main>
        </Box>
    );
}

export default LeftDrawerLayout;
