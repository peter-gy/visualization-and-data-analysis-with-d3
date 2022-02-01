import LeftDrawerLayout from '@components/layout/drawer/LeftDrawerLayout';
import { Helmet } from 'react-helmet';
import DateRangePicker from '@components/controls/DateRangePicker';
import CountryPicker from '@components/controls/CountryPicker';
import MainGrid from '@components/layout/grid/MainGrid';
import DrawerContent from '@components/layout/drawer/DrawerContent';
import { useUserConfig } from '@contexts/user-config/UserConfigContext';
import dayjs from 'dayjs';

function App() {
    const {state: {selectedTimeRange: {start: startDate, end: endDate}}}= useUserConfig();
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
                drawerWidth={(windowWidth) =>
                    windowWidth >= 768 ? 0.5 * windowWidth : windowWidth
                }
                drawerContent={<DrawerContent />}
                mainContent={<MainGrid />}
            />
        </>
    );
}

export default App;
