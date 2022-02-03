import dayjs from 'dayjs';
import { Helmet } from 'react-helmet';
import DrawerContent from '@components/layout/drawer/DrawerContent';
import LeftDrawerLayout from '@components/layout/drawer/LeftDrawerLayout';
import MainGrid from '@components/layout/grid/MainGrid';
import { useUserConfig } from '@contexts/user-config/UserConfigContext';

function App() {
    const {
        state: {
            selectedTimeRange: { start: startDate, end: endDate }
        }
    } = useUserConfig();
    const formatDate = (date: Date) => dayjs(date).format('DD/MM/YYYY');
    return (
        <>
            <Helmet>
                <meta charSet="utf-8" />
                <title>Covid-19 Dashboard</title>
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
                />
            </Helmet>
            <LeftDrawerLayout
                title={`Covid-19 Dashboard (${formatDate(startDate)} - ${formatDate(endDate)})`}
                drawerWidth={(windowWidth) => {
                    if (windowWidth >= 1280) {
                        return windowWidth / 4;
                    } else if (windowWidth >= 1024) {
                        return windowWidth / 3;
                    } else if (windowWidth >= 768) {
                        return windowWidth / 2;
                    } else {
                        return windowWidth;
                    }
                }}
                drawerContent={<DrawerContent />}
                mainContent={<MainGrid />}
            />
        </>
    );
}

export default App;
