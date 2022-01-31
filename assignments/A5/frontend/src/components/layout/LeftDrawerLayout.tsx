import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer, { DrawerProps } from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useState } from 'react';
import useWindowSize from '@hooks/useWindowSize';
import { AppBar } from '@mui/material';
import useMuiAppBarHeight from '@hooks/useMuiAppBarHeight';

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
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        sx={{ mr: 2, ...(open && { display: 'none' }) }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div">
                        {title}
                    </Typography>
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