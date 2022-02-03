import { ReactElement, ReactNode, Ref, RefObject, forwardRef, useState } from 'react';
import HelpIcon from '@mui/icons-material/Help';
import { IconButton } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Zoom from '@mui/material/Zoom';
import { TransitionProps } from '@mui/material/transitions';

const Transition = forwardRef(function Transition(
    props: TransitionProps & {
        children: ReactElement<any, any>;
    },
    ref: Ref<unknown>
) {
    return <Zoom in={true} ref={ref} {...props} children={props.children} />;
});

type GridItemProps = {
    title: string;
    appBarHeight: number;
    description?: string | ReactNode;
    content?: ReactNode;
    contentContainerRef?: RefObject<HTMLDivElement>;
    className?: string;
};

function GridItem({
    title,
    appBarHeight,
    description = '',
    content = <div />,
    contentContainerRef,
    className = ''
}: GridItemProps) {
    const gridItemId = `grid-item-${title}`.toLowerCase();

    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
            <Dialog
                open={open}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleClose}
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogTitle>{`${title} Information`}</DialogTitle>
                <DialogContent>
                    {typeof description === 'string' && (
                        <DialogContentText id="alert-dialog-slide-description">
                            {description}
                        </DialogContentText>
                    )}
                    {typeof description === 'object' && description}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Ok</Button>
                </DialogActions>
            </Dialog>
            <div
                style={{
                    height: 'calc(50vh - ' + appBarHeight / 1.25 + 'px)'
                }}
                className={
                    'm-2 bg-white rounded-lg shadow-lg hover:shadow-2xl w-[95vw] lg:w-[47.5vw] flex flex-col justify-start items-center ' +
                    className
                }
            >
                <div className="flex justify-center items-center">
                    <h1 className="text-md sm:text-xl font-bold text-center my-2">{title}</h1>
                    <div className="ml-1">
                        <IconButton onClick={handleClickOpen}>
                            <HelpIcon />
                        </IconButton>
                    </div>
                </div>
                <div
                    ref={contentContainerRef}
                    id={gridItemId}
                    className="grow flex justify-center items-center w-[100%]"
                >
                    {content}
                </div>
            </div>
        </>
    );
}

export default GridItem;
